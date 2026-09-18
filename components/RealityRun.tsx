'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RealityGame, type RealityGameHandle } from './RealityGame';
import { RealityPing } from './RealityPing';
import { buildPingCandidates, selectPing } from '@/lib/pings';
import { computeReality, formatMoney, shouldAutoEnd, stakeOptionsFor, daysUntil, isFinancialContextStale } from '@/lib/engine';
import { dealPoker, drawPoker, resolveSimpleGame, SPORTS_MARKETS, type ResolvedGameOutcome } from '@/lib/gameEngines';
import { clearActiveRun, loadData, saveActiveRun, track, updateData } from '@/lib/storage';
import { spinAudio } from '@/lib/audio';
import { createRunLease } from '@/lib/runLease';
import type { ActiveRun, ExitReason, PingCandidate, RealityProfile } from '@/lib/types';

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
  if (type === 'slots') return 'Cash Out';
  if (type === 'poker' || type === 'casino') return 'Leave Table';
  return 'Leave';
}

function cardLabel(code: string) {
  const suit = code.slice(-1);
  const rank = code.slice(0,-1);
  return rank + (suit === 'S' ? '♠' : suit === 'H' ? '♥' : suit === 'D' ? '♦' : '♣');
}

function freshRun(profile: RealityProfile): ActiveRun {
  const stakes = stakeOptionsFor(profile.intendedWagerCents);
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
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
  };
}

export function RealityRun({ profile, restoredRun, onEnd }: { profile: RealityProfile; restoredRun?: ActiveRun | null; onEnd: (data: RunEndData) => void }) {
  const game = useRef<RealityGameHandle>(null);
  const [run, setRun] = useState<ActiveRun>(() => restoredRun ?? freshRun(profile));
  const runRef = useRef(run);
  const [animating, setAnimating] = useState(false);
  const [ping, setPing] = useState<PingCandidate | null>(null);
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
    track('session_start', { game: profile.gamblingType, trigger: profile.triggerType, intended: profile.intendedWagerCents });
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
      balance: current.balanceCents,
      largestLoss: current.largestLossCents,
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
    });
    const chosen = selectPing(candidates, data.pingLearning, next.pings.slice(-2).map(p => p.type));
    if (!chosen) return false;
    const shownAt = Date.now();
    const pingRecord = { ...chosen, shownAt, dismissedAt: null };
    const updated: ActiveRun = {
      ...next,
      lastPingAction: next.actionCount,
      pings: [...next.pings, pingRecord],
      timeline: [...next.timeline, {
        kind: 'ping-shown',
        at: shownAt,
        balanceCents: next.balanceCents,
        stakeCents: next.stakeCents,
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
    setPing(chosen);
    track('reality_ping', { type: chosen.type, level: chosen.level });
    return true;
  }, [profile]);

  const notePostPingContinuation = (next: ActiveRun, outcome: ResolvedGameOutcome) => {
    const recentPing = lastDismissedPing.current;
    track('run_action', {
      action: next.actionCount,
      net: outcome.netCents,
      balance: next.balanceCents,
      stake: next.stakeCents,
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
    const next: ActiveRun = {
      ...current,
      previousBalanceCents: previousBalance,
      balanceCents,
      previousStakeCents: current.stakeCents,
      actionCount: current.actionCount + 1,
      lastNetCents: outcome.netCents,
      largestLossCents: Math.max(current.largestLossCents, Math.max(0, current.initialBalanceCents - balanceCents)),
      simulatedLossesCents: current.simulatedLossesCents + Math.max(0, -outcome.netCents),
      simulatedRecoveriesCents: current.simulatedRecoveriesCents + Math.max(0, outcome.netCents),
      timeline: [...current.timeline, {
        kind: 'action',
        at: Date.now(),
        balanceCents,
        stakeCents: current.stakeCents,
        netCents: outcome.netCents,
        decision,
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
    if (blockedByOtherTab || animating || ping || ended.current) return;

    if (profile.gamblingType === 'poker') {
      if (!pokerRound) {
        if (run.balanceCents < run.stakeCents) return;
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
        track('poker_deal', { stake: state.wagerCents, balance: balanceCents });
        window.setTimeout(() => setAnimating(false), reducedMotion ? 0 : 280);
        return;
      }

      setAnimating(true);
      spinAudio.spin(520, 'poker');
      const result = drawPoker(pokerRound.hand, pokerRound.deck, pokerRound.held, pokerRound.wagerCents);
      const payoutCents = result.outcome.netCents + pokerRound.wagerCents;
      const balanceCents = run.balanceCents + payoutCents;
      const heldCards = pokerRound.held.map((held, index) => held ? index + 1 : null).filter(Boolean).join(',');
      setPokerRound(null);
      await completeOutcome(result.outcome, balanceCents, heldCards ? 'held ' + heldCards : 'draw all', pokerRound.balanceBeforeCents);
      return;
    }

    if (run.balanceCents < run.stakeCents) return;
    setAnimating(true);
    const duration = profile.gamblingType === 'casino' ? 1500 : profile.gamblingType === 'slots' || profile.gamblingType === 'other' ? 1200 : profile.gamblingType === 'lottery' ? 820 : 520;
    spinAudio.spin(duration, profile.gamblingType);
    const outcome = resolveSimpleGame(profile.gamblingType, random01, run.stakeCents, gameDecision);
    const balanceCents = Math.max(0, run.balanceCents + outcome.netCents);
    await completeOutcome(outcome, balanceCents, gameDecision || undefined);
  };

  const togglePokerHold = (index: number) => {
    if (!pokerRound || animating || ping || blockedByOtherTab) return;
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
    if (blockedByOtherTab || animating || ping || pokerRound) return;
    const currentIndex = stakes.indexOf(run.stakeCents as never);
    const index = Math.max(0, Math.min(stakes.length - 1, (currentIndex < 0 ? 1 : currentIndex) + direction));
    const nextStake = stakes[index];
    if (nextStake > run.balanceCents) return;
    spinAudio.click();
    const recentPing = lastDismissedPing.current;
    track('stake_changed', {
      from: run.stakeCents,
      to: nextStake,
      balance: run.balanceCents,
      afterPing: recentPing?.type ?? null,
    });
    if (recentPing) {
      updateData(data => {
        const old = data.pingLearning[recentPing.type] ?? { shown: 0, exitsAfter: 0 };
        const key = nextStake < run.stakeCents ? 'stakeDownAfter' : 'stakeUpAfter';
        return {
          ...data,
          pingLearning: {
            ...data.pingLearning,
            [recentPing.type]: { ...old, [key]: (old[key] ?? 0) + 1 },
          },
        };
      });
    }
    setRun(current => ({
      ...current,
      previousStakeCents: current.stakeCents,
      stakeCents: nextStake,
      timeline: [...current.timeline, {
        kind: 'stake',
        at: Date.now(),
        balanceCents: current.balanceCents,
        stakeCents: nextStake,
      }],
    }));
  };

  const dismissPing = () => {
    const now = Date.now();
    if (ping) {
      const record = runRef.current.pings[runRef.current.pings.length - 1];
      track('reality_ping_dismissed', {
        type: ping.type,
        dwellMs: record ? Math.max(0, now - record.shownAt) : 0,
      });
      lastDismissedPing.current = {
        type: ping.type,
        dismissedAt: now,
        balanceAt: runRef.current.balanceCents,
        stakeAt: runRef.current.stakeCents,
      };
    }
    setPing(null);
    setRun(current => ({
      ...current,
      pings: current.pings.map((p, i) => i === current.pings.length - 1 ? { ...p, dismissedAt: now } : p),
      timeline: [...current.timeline, {
        kind: 'ping-dismissed',
        at: now,
        balanceCents: current.balanceCents,
        stakeCents: current.stakeCents,
        pingType: ping?.type,
      }],
    }));
    if (pendingBalanceEnd) {
      setPendingBalanceEnd(false);
      window.setTimeout(() => finish('balance'), 80);
    }
  };

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

  return (
    <main className="run-shell" style={{ '--reality': intensity } as React.CSSProperties}>
      <div className="reality-background" aria-hidden="true">
        {financeFresh && obligation && profile.obligationAmountCents ? <div className="context-ghost ghost-a"><span>{obligation}</span><strong>{formatMoney(profile.obligationAmountCents)}</strong></div> : null}
        {days != null ? <div className="context-ghost ghost-b"><strong>{days}</strong><span>DAYS UNTIL MONEY</span></div> : null}
        {profile.personalMoneyGoal ? <div className="context-ghost ghost-c"><span>{profile.personalMoneyGoal.toUpperCase()}</span></div> : null}
        {financeFresh && reality.obligationShortfallCents ? <div className="context-ghost ghost-d"><strong>{formatMoney(reality.obligationShortfallCents)}</strong><span>SHORT</span></div> : null}
        {financeFresh && profile.availableUntilIncomeCents != null ? <div className="context-ghost ghost-e"><span>AVAILABLE UNTIL INCOME</span><strong>{formatMoney(profile.availableUntilIncomeCents)}</strong></div> : null}
        {profile.recentLenderName && profile.recentLenderHelpedRecently ? <div className="context-ghost ghost-f"><span>{profile.recentLenderName.toUpperCase()}</span><strong>HELPED BEFORE</strong></div> : null}
        {profile.additionalMoneyGoal ? <div className="context-ghost ghost-g"><span>{profile.additionalMoneyGoal.toUpperCase()}</span></div> : null}
      </div>

      <section className="run-card" aria-label="Reality Run">
        {blockedByOtherTab ? <div className="tab-lock" role="dialog" aria-modal="true" aria-label="Reality Run open in another tab"><strong>Reality Run is open in another tab.</strong><button type="button" onClick={() => { const ok = lease.current?.claim(true) ?? true; setBlockedByOtherTab(!ok); }}>Use this tab</button></div> : null}

        <div className="run-hud">
          <div><span>Balance</span><strong>{formatMoney(run.balanceCents)}</strong></div>
          <div><span>Stake</span><strong>{formatMoney(run.stakeCents)}</strong></div>
          <div><span>Plays</span><strong>{run.actionCount}</strong></div>
          <div className="run-access"><span>Access</span><strong>{accessMode === 'paid' ? 'Plus' : accessMode === 'trial' ? 'Plus trial' : accessMode === 'checking' ? '…' : 'Core'}</strong></div>
          <button type="button" className="sound-button" aria-label={muted ? 'Unmute sound' : 'Mute sound'} onClick={() => { const next = !muted; setMuted(next); spinAudio.setMuted(next); if (!next) spinAudio.startAmbient(); }}>{muted ? 'Sound off' : 'Sound on'}</button>
        </div>

        <div className="casino-frame">
          <div className="bulbs bulbs-top" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
          <div className="bulbs bulbs-left" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>
          <div className="bulbs bulbs-right" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>
          <RealityGame ref={game} gameType={profile.gamblingType} reducedMotion={reducedMotion} initialBalanceCents={run.balanceCents}/>
          {ping ? <RealityPing ping={ping} reducedMotion={reducedMotion} onDismiss={dismissPing}/> : null}
          <button type="button" className="cashout-button" onClick={() => finish('voluntary')}>{exitLabel(profile.gamblingType)}</button>
        </div>

        {profile.gamblingType === 'sports' ? <div className="game-decision sports-picks" role="group" aria-label="Fictional moneyline market">
          {sportsChoices.map(choice => <button key={choice.name} type="button" className={gameDecision === choice.name ? 'is-on' : ''} onClick={() => setGameDecision(choice.name)} disabled={animating || Boolean(ping)}>
            <span>{choice.name}</span><strong>{choice.odds.toFixed(2)}</strong>
          </button>)}
        </div> : null}

        {profile.gamblingType === 'casino' ? <div className="game-decision" role="group" aria-label="Roulette color">
          {['Red','Black'].map(name => <button key={name} type="button" className={gameDecision === name ? 'is-on' : ''} onClick={() => setGameDecision(name)} disabled={animating || Boolean(ping)}>{name}</button>)}
        </div> : null}

        {profile.gamblingType === 'poker' && pokerRound ? <div className="game-decision poker-holds" role="group" aria-label="Cards to hold">
          {pokerRound.hand.map((code, index) => <button key={index} type="button" className={pokerRound.held[index] ? 'is-on' : ''} onClick={() => togglePokerHold(index)} disabled={animating || Boolean(ping)}>
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
        <p className="run-fineprint">Simulation. Leave whenever you want.</p>
      </section>
    </main>
  );
}
