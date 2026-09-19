'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RealityGame, type RealityGameHandle } from './RealityGame';
import { RealityPing } from './RealityPing';
import { XRayMoment } from './XRayMoment';
import { LongRunExperience } from './LongRunExperience';
import { InRunSetup } from './InRunSetup';
import { buildPingCandidates, selectPing } from '@/lib/pings';
import { computeReality, formatMoney, shouldAutoEnd, stakeOptionsFor, daysUntil, isFinancialContextStale } from '@/lib/engine';
import { dealPoker, drawPoker, resolveSimpleGame, SPORTS_MARKETS, type ResolvedGameOutcome } from '@/lib/gameEngines';
import { clearActiveRun, loadData, saveActiveRun, track, updateData } from '@/lib/storage';
import { spinAudio } from '@/lib/audio';
import { createRunLease } from '@/lib/runLease';
import { decideIntervention, initialDirectorState, interventionFamily, type AmbientMode, type InterventionSurface } from '@/lib/realityEngine/director';
import { simulateLongRun, type LongRunResult } from '@/lib/realityEngine/longRun';
import type { ActiveRun, ExitReason, PingCandidate, RealityProfile, SessionLimit } from '@/lib/types';

export interface RunEndData {
  run: ActiveRun;
  reason: ExitReason;
  endedAt: number;
  timeToExitSeconds: number | null;
}

function random01() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 2 ** 32;
}

function actionLabel(type: RealityProfile['gamblingType'], pokerHolding: boolean) {
  if (type === 'sports') return 'Place bet';
  if (type === 'poker') return pokerHolding ? 'Draw' : 'Deal';
  if (type === 'lottery') return 'Scratch';
  return 'Spin';
}

function exitLabel(type: RealityProfile['gamblingType']) {
  if (type === 'poker' || type === 'casino') return 'Leave table';
  if (type === 'sports') return 'Leave game';
  return "I'm done";
}

function cardLabel(code: string) {
  const suit = code.slice(-1);
  const rank = code.slice(0,-1);
  return rank + (suit === 'S' ? '♠' : suit === 'H' ? '♥' : suit === 'D' ? '♦' : '♣');
}

function freshRun(profile: RealityProfile, limit: SessionLimit): ActiveRun {
  const stakes = stakeOptionsFor(profile.intendedWagerCents);
  const data = loadData();
  const runs = data.runs;
  const previous = runs.length ? runs[runs.length - 1] : null;
  const previousEndEvent = [...data.events].reverse().find(event =>
    event.name === 'session_voluntary_exit'
    || event.name === 'session_timeout'
    || event.name === 'credits_exhausted'
  ) ?? null;
  const startedAt = Date.now();
  return {
    id: crypto.randomUUID(),
    startedAt,
    initialBalanceCents: profile.intendedWagerCents,
    balanceCents: profile.intendedWagerCents,
    previousBalanceCents: profile.intendedWagerCents,
    stakeCents: stakes[1],
    previousStakeCents: stakes[1],
    actionCount: 0,
    largestLossCents: 0,
    simulatedLossesCents: 0,
    simulatedRecoveriesCents: 0,
    lastNetCents: 0,
    lastPingAction: -10,
    pings: [],
    timeline: [],
    lastActionAt: null,
    actionIntervalsMs: [],
    consecutiveLosses: 0,
    consecutiveWins: 0,
    lossesBeforeLastWin: 0,
    lastOutcomeBand: null,
    lastNearMiss: false,
    pingDismissalStreak: 0,
    chosenLimitRounds: limit.rounds,
    chosenLimitMinutes: limit.minutes,
    limitExceededAt: null,
    returnedAfterMs: previousEndEvent ? Math.max(0, startedAt - previousEndEvent.at) : previous ? Math.max(0, startedAt - previous.endedAt) : null,
    totalStakedCents: 0,
    directorState: initialDirectorState(),
  };
}

function hydrateRun(run: ActiveRun): ActiveRun {
  return {
    ...run,
    lastActionAt: run.lastActionAt ?? null,
    actionIntervalsMs: run.actionIntervalsMs ?? [],
    consecutiveLosses: run.consecutiveLosses ?? 0,
    consecutiveWins: run.consecutiveWins ?? 0,
    lossesBeforeLastWin: run.lossesBeforeLastWin ?? 0,
    lastOutcomeBand: run.lastOutcomeBand ?? null,
    lastNearMiss: run.lastNearMiss ?? false,
    pingDismissalStreak: run.pingDismissalStreak ?? 0,
    chosenLimitRounds: run.chosenLimitRounds ?? null,
    chosenLimitMinutes: run.chosenLimitMinutes ?? null,
    limitExceededAt: run.limitExceededAt ?? null,
    returnedAfterMs: run.returnedAfterMs ?? null,
    totalStakedCents: run.totalStakedCents ?? 0,
    directorState: run.directorState ?? initialDirectorState(),
  };
}

export function RealityRun({
  profile,
  restoredRun,
  sessionLimit,
  onProfileChange,
  onEnd,
}: {
  profile: RealityProfile;
  restoredRun?: ActiveRun | null;
  sessionLimit: SessionLimit;
  onProfileChange: (next: RealityProfile) => void;
  onEnd: (data: RunEndData) => void;
}) {
  const game = useRef<RealityGameHandle>(null);
  const [run, setRun] = useState<ActiveRun>(() => hydrateRun(restoredRun ?? freshRun(profile, sessionLimit)));
  const runRef = useRef(run);
  const [animating, setAnimating] = useState(false);
  const [gameInteractionCount, setGameInteractionCount] = useState(0);
  const [ping, setPing] = useState<PingCandidate | null>(null);
  const [interventionSurface, setInterventionSurface] = useState<InterventionSurface | null>(null);
  const [ambientMode, setAmbientMode] = useState<AmbientMode>(() => restoredRun?.directorState?.ambientMode ?? 'normal');
  const [longRun, setLongRun] = useState<LongRunResult | null>(null);
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  );
  const [pendingBalanceEnd, setPendingBalanceEnd] = useState(false);
  const [blockedByOtherTab, setBlockedByOtherTab] = useState(false);
  const [accessMode, setAccessMode] = useState<'checking'|'trial'|'paid'|'core'>('checking');
  const [gameDecision, setGameDecision] = useState<string>(() =>
    profile.gamblingType === 'sports' ? SPORTS_MARKETS[0].home : profile.gamblingType === 'casino' ? 'Red' : ''
  );
  const [pokerRound, setPokerRound] = useState<NonNullable<NonNullable<ActiveRun['gameState']>['poker']> | null>(
    () => restoredRun?.gameState?.poker ?? null,
  );
  const ended = useRef(false);
  const actionLock = useRef(false);
  const lease = useRef<ReturnType<typeof createRunLease> | null>(null);
  const lastDismissedPing = useRef<{ type: string; dismissedAt: number; balanceAt: number; stakeAt: number } | null>(null);
  const stakes = useMemo(() => stakeOptionsFor(profile.intendedWagerCents), [profile.intendedWagerCents]);
  const reality = useMemo(() => computeReality(profile, run.balanceCents), [profile, run.balanceCents]);
  const intensity = Math.min(1, reality.simulatedLossCents / Math.max(profile.intendedWagerCents, 1));

  useEffect(() => {
    runRef.current = run;
    saveActiveRun({ profile, run });
  }, [profile, run]);

  useEffect(() => {
    spinAudio.setAmbientMode(ambientMode);
  }, [ambientMode]);

  useEffect(() => {
    if (pokerRound) game.current?.setPokerHand(pokerRound.hand, pokerRound.held);
  }, [pokerRound]);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/access/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ runId: runRef.current.id, game: profile.gamblingType }),
    })
      .then(async response => {
        const payload = await response.json().catch(() => ({})) as { access?: 'trial'|'paid'|'core' };
        if (!cancelled) {
          setAccessMode(payload.access === 'trial' || payload.access === 'paid' ? payload.access : 'core');
          window.dispatchEvent(new Event('spinout:access-changed'));
        }
      })
      .catch(() => { if (!cancelled) setAccessMode('core'); });
    return () => { cancelled = true; };
  }, [profile.gamblingType]);

  useEffect(() => {
    lease.current = createRunLease(runRef.current.id);
    const claim = lease.current.claim();
    queueMicrotask(() => setBlockedByOtherTab(!claim));
    const timer = window.setInterval(() => {
      const current = lease.current;
      if (!current) return;
      if (current.heldByThisTab()) current.renew();
      else setBlockedByOtherTab(true);
    }, 5_000);
    const onStorage = () => {
      const current = lease.current;
      if (!current) return;
      setBlockedByOtherTab(!current.heldByThisTab());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      lease.current?.release();
      lease.current = null;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(Boolean(media?.matches));
    sync();
    media?.addEventListener?.('change', sync);
    queueMicrotask(() => setMuted(spinAudio.isMuted()));
    spinAudio.startAmbient();
    spinAudio.setAmbientMode(runRef.current.directorState?.ambientMode ?? 'normal');
    track('session_start', { game: profile.gamblingType, trigger: profile.triggerType });
    return () => {
      media?.removeEventListener?.('change', sync);
      spinAudio.stopAmbient();
    };
  }, [profile.gamblingType, profile.triggerType, profile.intendedWagerCents]);

  const finish = useCallback((reason: ExitReason) => {
    if (ended.current) return;
    ended.current = true;
    const current = runRef.current;
    const endedAt = Date.now();
    const timeToExitSeconds = reason === 'voluntary' ? Math.max(0, Math.round((endedAt - current.startedAt) / 1000)) : null;
    const lastPing = current.pings[current.pings.length - 1];
    if (reason === 'voluntary' && lastPing && endedAt - lastPing.shownAt <= 60_000) {
      updateData(data => {
        const old = data.pingLearning[lastPing.type] ?? { shown: 0, exitsAfter: 0 };
        const recovered = current.balanceCents >= current.initialBalanceCents && current.previousBalanceCents < current.initialBalanceCents;
        return {
          ...data,
          pingLearning: {
            ...data.pingLearning,
            [lastPing.type]: {
              ...old,
              exitsAfter: old.exitsAfter + 1,
              recoveryExitAfter: (old.recoveryExitAfter ?? 0) + (recovered ? 1 : 0),
            },
          },
        };
      });
    }
    clearActiveRun();
    spinAudio.stopAmbient();
    track(reason === 'voluntary' ? 'session_voluntary_exit' : reason === 'timeout' ? 'session_timeout' : 'credits_exhausted', {
      actions: current.actionCount,
      timeToExitSeconds,
      pings: current.pings.length,
    });
    onEnd({ run: current, reason, endedAt, timeToExitSeconds });
  }, [onEnd]);

  useEffect(() => {
    if (!pokerRound && run.balanceCents < stakes[0] && !ended.current) {
      const timer = window.setTimeout(() => finish('balance'), 80);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setInterval(() => {
      if (shouldAutoEnd(runRef.current.startedAt, Date.now())) finish('timeout');
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, pokerRound, run.balanceCents, stakes]);

  const showPing = useCallback((next: ActiveRun) => {
    const data = loadData();
    const candidates = buildPingCandidates(profile, {
      initialBalanceCents: next.initialBalanceCents,
      balanceCents: next.balanceCents,
      previousBalanceCents: next.previousBalanceCents,
      stakeCents: next.stakeCents,
      previousStakeCents: next.previousStakeCents,
      actionCount: next.actionCount,
      lastNetCents: next.lastNetCents,
      lastPingAction: next.lastPingAction,
      lastPingAt: next.pings[next.pings.length - 1]?.shownAt ?? null,
      startedAt: next.startedAt,
      lastActionAt: next.lastActionAt ?? null,
      actionIntervalsMs: next.actionIntervalsMs ?? [],
      consecutiveLosses: next.consecutiveLosses ?? 0,
      consecutiveWins: next.consecutiveWins ?? 0,
      lossesBeforeLastWin: next.lossesBeforeLastWin ?? 0,
      lastOutcomeBand: next.lastOutcomeBand ?? null,
      nearMiss: next.lastNearMiss ?? false,
      pingDismissalStreak: next.pingDismissalStreak ?? 0,
      chosenLimitRounds: next.chosenLimitRounds ?? null,
      chosenLimitMinutes: next.chosenLimitMinutes ?? null,
      limitExceededAt: next.limitExceededAt ?? null,
      returnedAfterMs: next.returnedAfterMs ?? null,
      totalStakedCents: next.totalStakedCents ?? 0,
    });

    const recentTypes = next.pings.slice(-3).map(item => item.type);
    const byFamily = new Map<string, PingCandidate[]>();
    for (const candidate of candidates) {
      const family = interventionFamily(candidate.type);
      byFamily.set(family, [...(byFamily.get(family) ?? []), candidate]);
    }

    const representatives = [...byFamily.values()]
      .map(group => selectPing(group, data.pingLearning, recentTypes))
      .filter((candidate): candidate is PingCandidate => Boolean(candidate));

    const decision = decideIntervention({
      now: Date.now(),
      candidates: representatives,
      foregroundOpen: Boolean(ping || longRun),
      state: next.directorState ?? initialDirectorState(),
    });

    setAmbientMode(decision.ambientMode);

    const directedRun: ActiveRun = {
      ...next,
      directorState: decision.nextState,
    };

    if (!decision.foreground) {
      setRun(directedRun);
      runRef.current = directedRun;
      return false;
    }

    const chosen = decision.foreground.candidate;
    const shownAt = Date.now();
    const pingRecord = {
      ...chosen,
      shownAt,
      dismissedAt: null,
      surface: decision.foreground.surface,
    };
    const updated: ActiveRun = {
      ...directedRun,
      lastPingAction: directedRun.actionCount,
      pings: [...directedRun.pings, pingRecord],
      timeline: [...directedRun.timeline, {
        kind: 'ping-shown',
        at: shownAt,
        balanceCents: directedRun.balanceCents,
        stakeCents: directedRun.stakeCents,
        pingType: chosen.type,
      }],
    };

    setRun(updated);
    runRef.current = updated;
    updateData(current => {
      const old = current.pingLearning[chosen.type] ?? { shown: 0, exitsAfter: 0 };
      return {
        ...current,
        pingLearning: {
          ...current.pingLearning,
          [chosen.type]: { ...old, shown: old.shown + 1 },
        },
      };
    });

    spinAudio.ping();
    setInterventionSurface(decision.foreground.surface);
    setPing(chosen);
    track('reality_intervention', {
      type: chosen.type,
      level: chosen.level,
      surface: decision.foreground.surface,
      family: decision.foreground.family,
    });
    return true;
  }, [longRun, ping, profile]);

  const notePostPingContinuation = (next: ActiveRun, outcome: ResolvedGameOutcome) => {
    const recentPing = lastDismissedPing.current;
    track('run_action', {
      action: next.actionCount,
      outcome: outcome.band,
      nearMiss: outcome.nearMiss === true,
      game: profile.gamblingType,
      afterPing: recentPing?.type ?? null,
      msAfterPing: recentPing ? Math.max(0, Date.now() - recentPing.dismissedAt) : null,
    });
    if (recentPing) {
      updateData(data => {
        const old = data.pingLearning[recentPing.type] ?? { shown: 0, exitsAfter: 0 };
        return {
          ...data,
          pingLearning: {
            ...data.pingLearning,
            [recentPing.type]: { ...old, continuedAfter: (old.continuedAfter ?? 0) + 1 },
          },
        };
      });
    }
    lastDismissedPing.current = null;
  };

  const completeOutcome = async (
    outcome: ResolvedGameOutcome,
    balanceCents: number,
    decision?: string,
    previousBalanceOverride?: number,
  ) => {
    const current = runRef.current;
    const previousBalance = previousBalanceOverride ?? current.balanceCents;
    const actionAt = Date.now();
    const intervalMs = current.lastActionAt == null ? null : Math.max(0, actionAt - current.lastActionAt);
    const actionIntervalsMs = intervalMs == null
      ? (current.actionIntervalsMs ?? [])
      : [...(current.actionIntervalsMs ?? []), intervalMs].slice(-12);
    const actionCount = current.actionCount + 1;
    const consecutiveLosses = outcome.netCents < 0 ? (current.consecutiveLosses ?? 0) + 1 : 0;
    const lossesBeforeLastWin = outcome.netCents > 0 ? (current.consecutiveLosses ?? 0) : 0;
    const consecutiveWins = outcome.netCents > 0 ? (current.consecutiveWins ?? 0) + 1 : 0;
    const roundsExceeded = current.chosenLimitRounds != null && actionCount > current.chosenLimitRounds;
    const timeExceeded = current.chosenLimitMinutes != null && actionAt - current.startedAt > current.chosenLimitMinutes * 60_000;
    const limitExceededAt = current.limitExceededAt ?? (roundsExceeded || timeExceeded ? actionAt : null);

    const next: ActiveRun = {
      ...current,
      previousBalanceCents: previousBalance,
      balanceCents,
      previousStakeCents: current.stakeCents,
      actionCount,
      lastNetCents: outcome.netCents,
      largestLossCents: Math.max(current.largestLossCents, Math.max(0, current.initialBalanceCents - balanceCents)),
      simulatedLossesCents: current.simulatedLossesCents + Math.max(0, -outcome.netCents),
      simulatedRecoveriesCents: current.simulatedRecoveriesCents + Math.max(0, outcome.netCents),
      lastActionAt: actionAt,
      actionIntervalsMs,
      consecutiveLosses,
      consecutiveWins,
      lossesBeforeLastWin,
      lastOutcomeBand: outcome.band,
      lastNearMiss: outcome.nearMiss === true,
      totalStakedCents: (current.totalStakedCents ?? 0) + current.stakeCents,
      limitExceededAt,
      timeline: [...current.timeline, {
        kind: 'action',
        at: actionAt,
        balanceCents,
        stakeCents: current.stakeCents,
        netCents: outcome.netCents,
        decision,
        intervalMs,
        outcomeBand: outcome.band,
        nearMiss: outcome.nearMiss === true,
      }],
      gameState: undefined,
    };
    setRun(next);
    runRef.current = next;
    notePostPingContinuation(next, outcome);

    await game.current?.playOutcome({
      ...outcome,
      balanceCents,
      actionCount: next.actionCount,
      decision,
    });

    spinAudio.result(outcome.netCents, profile.gamblingType);
    setAnimating(false);
    if (ended.current) return;

    const showed = showPing(next);
    if (balanceCents < stakes[0]) {
      if (showed) setPendingBalanceEnd(true);
      else window.setTimeout(() => finish('balance'), reducedMotion ? 0 : 260);
    }
  };

  const act = async () => {
    if (blockedByOtherTab || animating || ping || longRun || ended.current || actionLock.current) return;
    actionLock.current = true;
    setGameInteractionCount(count => count + 1);

    if (profile.gamblingType === 'poker') {
      if (!pokerRound) {
        if (run.balanceCents < run.stakeCents) { actionLock.current = false; return; }
        setAnimating(true);
        spinAudio.click();
        const dealt = dealPoker(random01);
        const balanceCents = run.balanceCents - run.stakeCents;
        const state = {
          ...dealt,
          phase: 'hold' as const,
          wagerCents: run.stakeCents,
          balanceBeforeCents: run.balanceCents,
        };
        const next: ActiveRun = {
          ...run,
          previousBalanceCents: run.balanceCents,
          balanceCents,
          largestLossCents: Math.max(run.largestLossCents, Math.max(0, run.initialBalanceCents - balanceCents)),
          gameState: { poker: state },
        };
        setPokerRound(state);
        setRun(next);
        runRef.current = next;
        game.current?.setBalance(balanceCents);
        game.current?.setPokerHand(state.hand, state.held);
        track('poker_deal', { action: run.actionCount + 1 });
        window.setTimeout(() => {
          actionLock.current = false;
          setAnimating(false);
        }, reducedMotion ? 0 : 280);
        return;
      }

      setAnimating(true);
      spinAudio.spin(520, 'poker');
      const result = drawPoker(pokerRound.hand, pokerRound.deck, pokerRound.held, pokerRound.wagerCents);
      const payoutCents = result.outcome.netCents + pokerRound.wagerCents;
      const balanceCents = run.balanceCents + payoutCents;
      const heldCards = pokerRound.held.map((held, index) => held ? index + 1 : null).filter(Boolean).join(',');
      setPokerRound(null);
      try {
        await completeOutcome(result.outcome, balanceCents, heldCards ? 'held ' + heldCards : 'draw all', pokerRound.balanceBeforeCents);
      } finally {
        actionLock.current = false;
      }
      return;
    }

    if (run.balanceCents < run.stakeCents) { actionLock.current = false; return; }
    setAnimating(true);
    const duration = profile.gamblingType === 'casino' ? 1500 : profile.gamblingType === 'slots' || profile.gamblingType === 'other' ? 1200 : profile.gamblingType === 'lottery' ? 820 : 520;
    spinAudio.spin(duration, profile.gamblingType);
    const outcome = resolveSimpleGame(profile.gamblingType, random01, run.stakeCents, gameDecision);
    const balanceCents = Math.max(0, run.balanceCents + outcome.netCents);
    try {
      await completeOutcome(outcome, balanceCents, gameDecision || undefined);
    } finally {
      actionLock.current = false;
    }
  };

  const togglePokerHold = (index: number) => {
    if (!pokerRound || animating || ping || longRun || blockedByOtherTab) return;
    spinAudio.click();
    const held = pokerRound.held.map((value, i) => i === index ? !value : value);
    const nextRound = { ...pokerRound, held };
    setPokerRound(nextRound);
    game.current?.setPokerHand(nextRound.hand, held);
    setRun(current => ({
      ...current,
      gameState: { poker: nextRound },
    }));
  };

  const setStake = (direction: -1 | 1) => {
    if (blockedByOtherTab || animating || ping || longRun || pokerRound) return;
    const current = runRef.current;
    const currentIndex = stakes.indexOf(current.stakeCents as never);
    const index = Math.max(0, Math.min(stakes.length - 1, (currentIndex < 0 ? 1 : currentIndex) + direction));
    const nextStake = stakes[index];
    if (nextStake === current.stakeCents || nextStake > current.balanceCents) return;

    spinAudio.click();
    const recentPing = lastDismissedPing.current;
    track('stake_changed', {
      direction: nextStake > current.stakeCents ? 'up' : 'down',
      afterPing: recentPing?.type ?? null,
    });

    if (recentPing) {
      updateData(data => {
        const old = data.pingLearning[recentPing.type] ?? { shown: 0, exitsAfter: 0 };
        const key = nextStake < current.stakeCents ? 'stakeDownAfter' : 'stakeUpAfter';
        return {
          ...data,
          pingLearning: {
            ...data.pingLearning,
            [recentPing.type]: { ...old, [key]: (old[key] ?? 0) + 1 },
          },
        };
      });
    }

    const next: ActiveRun = {
      ...current,
      previousStakeCents: current.stakeCents,
      stakeCents: nextStake,
      timeline: [...current.timeline, {
        kind: 'stake',
        at: Date.now(),
        balanceCents: current.balanceCents,
        stakeCents: nextStake,
      }],
    };

    setRun(next);
    runRef.current = next;

    if (nextStake > current.stakeCents && current.lastNetCents < 0) {
      showPing(next);
    }
  };

  const closePing = (leave = false) => {
    const now = Date.now();
    const current = runRef.current;
    const record = current.pings[current.pings.length - 1];
    const dwellMs = record ? Math.max(0, now - record.shownAt) : 0;

    if (ping) {
      track(leave ? 'reality_ping_exit' : 'reality_ping_dismissed', {
        type: ping.type,
        dwellMs,
      });
      lastDismissedPing.current = {
        type: ping.type,
        dismissedAt: now,
        balanceAt: current.balanceCents,
        stakeAt: current.stakeCents,
      };
    }

    const quickDismiss = !leave && dwellMs > 0 && dwellMs < 1_200;
    const pingDismissalStreak = ping?.type === 'dismissals'
      ? 0
      : quickDismiss
        ? (current.pingDismissalStreak ?? 0) + 1
        : 0;

    const updated: ActiveRun = {
      ...current,
      pingDismissalStreak,
      pings: current.pings.map((p, i) => i === current.pings.length - 1 ? { ...p, dismissedAt: now } : p),
      timeline: [...current.timeline, {
        kind: 'ping-dismissed',
        at: now,
        balanceCents: current.balanceCents,
        stakeCents: current.stakeCents,
        pingType: ping?.type,
      }],
    };

    setPing(null);
    setInterventionSurface(null);
    setRun(updated);
    runRef.current = updated;

    if (leave) {
      finish('voluntary');
      return;
    }

    if (pendingBalanceEnd) {
      setPendingBalanceEnd(false);
      window.setTimeout(() => finish('balance'), 80);
    }
  };

  const dismissPing = () => closePing(false);
  const leaveFromPing = () => closePing(true);

  const openLongRun = () => {
    if (animating || longRun) return;
    const seed = Math.floor(random01() * 2 ** 32);
    const result = simulateLongRun({
      gameType: profile.gamblingType,
      stakeCents: runRef.current.stakeCents,
      decision: gameDecision,
      seed,
    });
    setLongRun(result);
    track('long_run_opened', { game: profile.gamblingType });
  };

  const gameLabel = profile.gamblingType === 'slots' ? 'Slots'
    : profile.gamblingType === 'sports' ? 'Sportsbook'
    : profile.gamblingType === 'casino' ? 'Roulette'
    : profile.gamblingType === 'poker' ? 'Video Poker'
    : profile.gamblingType === 'lottery' ? 'Scratch'
    : 'Reality Run';

  const financeFresh = !isFinancialContextStale(profile);
  const days = financeFresh ? daysUntil(profile.nextIncomeDate) : null;
  const obligation = profile.obligationType === 'rent' ? 'RENT'
    : profile.obligationType === 'car' ? 'CAR PAYMENT'
    : profile.obligationType === 'none' ? null
    : profile.obligationType.replace('-', ' ').toUpperCase();

  const sportsChoices = SPORTS_MARKETS.flatMap(market => [
    { name:market.home, odds:market.homeOdds },
    { name:market.away, odds:market.awayOdds },
  ]);
  const selectedSports = sportsChoices.find(choice => choice.name === gameDecision) ?? sportsChoices[0];
  const sportsPotentialReturn = Math.round(run.stakeCents * selectedSports.odds);

  return (
    <main className={`run-shell ambient-${ambientMode}`} data-environment="layered-casino" data-game={profile.gamblingType} data-intervention-surface={interventionSurface ?? 'none'} style={{ '--reality': intensity } as React.CSSProperties}>
      <div className="reality-background" aria-hidden="true">
        {financeFresh && obligation && profile.obligationAmountCents ? <div className="context-ghost ghost-a"><span>{obligation}</span><strong>{formatMoney(profile.obligationAmountCents)}</strong></div> : null}
        {days != null ? <div className="context-ghost ghost-b"><strong>{days}</strong><span>DAYS UNTIL MONEY</span></div> : null}
        {profile.personalMoneyGoal ? <div className="context-ghost ghost-c"><span>{profile.personalMoneyGoal.toUpperCase()}</span></div> : null}
        {financeFresh && reality.obligationShortfallCents ? <div className="context-ghost ghost-d"><strong>{formatMoney(reality.obligationShortfallCents)}</strong><span>SHORT</span></div> : null}
        {financeFresh && profile.availableUntilIncomeCents != null ? <div className="context-ghost ghost-e"><span>AVAILABLE UNTIL INCOME</span><strong>{formatMoney(profile.availableUntilIncomeCents)}</strong></div> : null}
        {profile.recentLenderName && profile.recentLenderHelpedRecently ? <div className="context-ghost ghost-f"><span>{profile.recentLenderName.toUpperCase()}</span><strong>HELPED BEFORE</strong></div> : null}
        {profile.additionalMoneyGoal ? <div className="context-ghost ghost-g"><span>{profile.additionalMoneyGoal.toUpperCase()}</span></div> : null}
      </div>

      <div className="run-experience-layout">
        <InRunSetup
          profile={profile}
          foregroundOpen={Boolean(ping) || Boolean(longRun) || blockedByOtherTab}
          collapseSignal={gameInteractionCount + run.pings.length}
          onProfileChange={onProfileChange}
        />
      <section className="run-card" aria-label="Reality Run">
        {blockedByOtherTab ? <div className="tab-lock" role="dialog" aria-modal="true" aria-label="Reality Run open in another tab"><strong>Reality Run is open in another tab.</strong><button type="button" onClick={() => { const ok = lease.current?.claim(true) ?? true; setBlockedByOtherTab(!ok); }}>Use this tab</button></div> : null}

        <div className="run-hud">
          <div><span>Balance</span><strong>{formatMoney(run.balanceCents)}</strong></div>
          <div><span>Stake</span><strong>{formatMoney(run.stakeCents)}</strong></div>
          <div><span>Plays</span><strong>{run.actionCount}</strong></div>
          <div className="run-access"><span>Access</span><strong>{accessMode === 'paid' ? 'Plus' : accessMode === 'trial' ? 'Plus trial' : accessMode === 'checking' ? '…' : 'Core'}</strong></div>
          <button type="button" className="sound-button" aria-label={muted ? 'Unmute sound' : 'Mute sound'} onClick={() => { const next = !muted; setMuted(next); spinAudio.setMuted(next); if (!next) spinAudio.startAmbient(); }}>{muted ? 'Sound off' : 'Sound on'}</button>
        </div>

        <div className="game-stage-heading"><h1>{gameLabel}</h1></div>
        <div className="casino-frame">
          {profile.gamblingType === 'slots' || profile.gamblingType === 'other' ? <>
          <div className="bulbs bulbs-top" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
          <div className="bulbs bulbs-left" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>
          <div className="bulbs bulbs-right" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>
          </> : null}
          <RealityGame ref={game} gameType={profile.gamblingType} reducedMotion={reducedMotion} initialBalanceCents={run.balanceCents}/>
          {ping && interventionSurface === 'xray'
            ? <XRayMoment
                insight={ping}
                onContinue={dismissPing}
                onExit={leaveFromPing}
                onRunLong={['near-miss','win-after-losses','loss-streak'].includes(ping.type) ? openLongRun : undefined}
              />
            : ping
              ? <RealityPing ping={ping} reducedMotion={reducedMotion} onDismiss={dismissPing} onExit={leaveFromPing}/>
              : null}
          {!ping?.requiresChoice && interventionSurface !== 'xray' && !longRun ? <button type="button" className="cashout-button" onClick={() => finish('voluntary')}>{exitLabel(profile.gamblingType)}</button> : null}
        </div>

        {profile.gamblingType === 'sports' ? <>
          <div className="game-decision sports-picks" role="group" aria-label="Fictional moneyline market">
            {sportsChoices.map(choice => <button key={choice.name} type="button" className={gameDecision === choice.name ? 'is-on' : ''} onClick={() => setGameDecision(choice.name)} disabled={animating || Boolean(ping) || Boolean(longRun)}>
              <span>{choice.name}</span><strong>{choice.odds.toFixed(2)}</strong>
            </button>)}
          </div>
          <div className="bet-slip-summary" aria-live="polite">
            <span>Selection <strong>{selectedSports.name}</strong></span>
            <span>Odds <strong>{selectedSports.odds.toFixed(2)}</strong></span>
            <span>Potential return <strong>{formatMoney(sportsPotentialReturn)}</strong></span>
          </div>
        </> : null}

        {profile.gamblingType === 'casino' ? <div className="game-decision" role="group" aria-label="Roulette color">
          {['Red','Black'].map(name => <button key={name} type="button" className={gameDecision === name ? 'is-on' : ''} onClick={() => setGameDecision(name)} disabled={animating || Boolean(ping) || Boolean(longRun)}>{name}</button>)}
        </div> : null}

        {profile.gamblingType === 'poker' && pokerRound ? <div className="game-decision poker-holds" role="group" aria-label="Cards to hold">
          {pokerRound.hand.map((code, index) => <button key={index} type="button" className={pokerRound.held[index] ? 'is-on' : ''} onClick={() => togglePokerHold(index)} disabled={animating || Boolean(ping) || Boolean(longRun)}>
            <span>{cardLabel(code)}</span><strong>{pokerRound.held[index] ? 'HELD' : 'Hold'}</strong>
          </button>)}
        </div> : null}

        <div className="run-controls">
          <div className="stake-control" aria-label="Practice stake">
            <button type="button" onClick={() => setStake(-1)} aria-label="Lower practice stake" disabled={blockedByOtherTab || animating || Boolean(pokerRound) || stakes[0] === run.stakeCents}>−</button>
            <span><small>Practice stake</small>{formatMoney(run.stakeCents)}</span>
            <button type="button" onClick={() => setStake(1)} aria-label="Raise practice stake" disabled={blockedByOtherTab || animating || Boolean(pokerRound) || stakes[2] === run.stakeCents || stakes[Math.min(stakes.length-1,stakes.indexOf(run.stakeCents as never)+1)] > run.balanceCents}>+</button>
          </div>
          <button type="button" className="game-action" onClick={act} disabled={blockedByOtherTab || animating || Boolean(ping) || (!pokerRound && run.balanceCents < run.stakeCents)}>
            {animating ? '...' : actionLabel(profile.gamblingType, Boolean(pokerRound))}
          </button>
        </div>
        <div className="run-secondary">
          <button type="button" onClick={openLongRun} disabled={animating || Boolean(ping) || Boolean(longRun)}>Run 10,000</button>
          <p className="run-fineprint">Simulation. Leave whenever you want.</p>
        </div>
      </section>
      </div>
      {longRun ? <LongRunExperience result={longRun} gameLabel={gameLabel} onClose={() => setLongRun(null)} /> : null}
    </main>
  );
}
