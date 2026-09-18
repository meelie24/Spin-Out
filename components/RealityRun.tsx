'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RealityGame, type RealityGameHandle } from './RealityGame';
import { RealityPing } from './RealityPing';
import { buildPingCandidates, selectPing } from '@/lib/pings';
import { computeReality, formatMoney, sampleOutcome, shouldAutoEnd, stakeOptionsFor, daysUntil } from '@/lib/engine';
import { clearActiveRun, loadData, saveActiveRun, track, updateData } from '@/lib/storage';
import { spinAudio } from '@/lib/audio';
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

function actionLabel(type: RealityProfile['gamblingType']) {
  if (type === 'sports') return 'Place';
  if (type === 'poker') return 'Deal';
  if (type === 'lottery') return 'Scratch';
  return 'Spin';
}
function exitLabel(type: RealityProfile['gamblingType']) {
  if (type === 'slots') return 'Cash Out';
  if (type === 'poker' || type === 'casino') return 'Leave Table';
  return 'Leave';
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
  };
}

export function RealityRun({ profile, restoredRun, onEnd }: { profile: RealityProfile; restoredRun?: ActiveRun | null; onEnd: (data: RunEndData) => void }) {
  const game = useRef<RealityGameHandle>(null);
  const [run, setRun] = useState<ActiveRun>(() => restoredRun ?? freshRun(profile));
  const runRef = useRef(run);
  const [animating, setAnimating] = useState(false);
  const [ping, setPing] = useState<PingCandidate | null>(null);
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pendingBalanceEnd, setPendingBalanceEnd] = useState(false);
  const ended = useRef(false);
  const lastDismissedPing = useRef<{ type: string; dismissedAt: number } | null>(null);
  const stakes = useMemo(() => stakeOptionsFor(profile.intendedWagerCents), [profile.intendedWagerCents]);
  const reality = useMemo(() => computeReality(profile, run.balanceCents), [profile, run.balanceCents]);
  const intensity = Math.min(1, reality.simulatedLossCents / Math.max(profile.intendedWagerCents, 1));

  useEffect(() => { runRef.current = run; saveActiveRun({ profile, run }); }, [profile, run]);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(Boolean(media?.matches)); sync(); media?.addEventListener?.('change', sync);
    spinAudio.startAmbient();
    track('session_start', { game: profile.gamblingType, trigger: profile.triggerType, intended: profile.intendedWagerCents });
    return () => { media?.removeEventListener?.('change', sync); spinAudio.stopAmbient(); };
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
        return { ...data, pingLearning: { ...data.pingLearning, [lastPing.type]: { ...old, exitsAfter: old.exitsAfter + 1 } } };
      });
    }
    clearActiveRun();
    spinAudio.stopAmbient();
    track(reason === 'voluntary' ? 'session_voluntary_exit' : reason === 'timeout' ? 'session_timeout' : 'credits_exhausted', { actions: current.actionCount, timeToExitSeconds, balance: current.balanceCents, largestLoss: current.largestLossCents, pings: current.pings.length });
    onEnd({ run: current, reason, endedAt, timeToExitSeconds });
  }, [onEnd]);

  useEffect(() => {
    const timer = window.setInterval(() => { if (shouldAutoEnd(runRef.current.startedAt, Date.now())) finish('timeout'); }, 1000);
    return () => window.clearInterval(timer);
  }, [finish]);

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
    });
    const chosen = selectPing(candidates, data.pingLearning, next.pings.slice(-2).map(p => p.type));
    if (!chosen) return false;
    const shownAt = Date.now();
    const pingRecord = { ...chosen, shownAt, dismissedAt: null };
    const updated = { ...next, lastPingAction: next.actionCount, pings: [...next.pings, pingRecord] };
    setRun(updated); runRef.current = updated;
    updateData(current => {
      const old = current.pingLearning[chosen.type] ?? { shown: 0, exitsAfter: 0 };
      return { ...current, pingLearning: { ...current.pingLearning, [chosen.type]: { ...old, shown: old.shown + 1 } } };
    });
    spinAudio.ping(); setPing(chosen); track('reality_ping', { type: chosen.type, level: chosen.level });
    return true;
  }, [profile]);

  const act = async () => {
    if (animating || ping || ended.current || run.balanceCents < run.stakeCents) return;
    setAnimating(true);
    spinAudio.spin(860);
    const outcome = sampleOutcome(random01(), run.stakeCents);
    const balanceCents = Math.max(0, run.balanceCents + outcome.netCents);
    const next: ActiveRun = {
      ...run,
      previousBalanceCents: run.balanceCents,
      balanceCents,
      previousStakeCents: run.stakeCents,
      actionCount: run.actionCount + 1,
      lastNetCents: outcome.netCents,
      largestLossCents: Math.max(run.largestLossCents, Math.max(0, run.initialBalanceCents - balanceCents)),
      simulatedLossesCents: run.simulatedLossesCents + Math.max(0, -outcome.netCents),
      simulatedRecoveriesCents: run.simulatedRecoveriesCents + Math.max(0, outcome.netCents),
    };
    setRun(next); runRef.current = next;
    const recentPing = lastDismissedPing.current;
    track('run_action', { action: next.actionCount, net: outcome.netCents, balance: balanceCents, stake: next.stakeCents, afterPing: recentPing?.type ?? null, msAfterPing: recentPing ? Math.max(0, Date.now() - recentPing.dismissedAt) : null });
    lastDismissedPing.current = null;
    await game.current?.playOutcome({ ...outcome, balanceCents, actionCount: next.actionCount });
    spinAudio.result(outcome.netCents);
    setAnimating(false);
    if (ended.current) return;
    const showed = showPing(next);
    const minStake = stakes[0];
    if (balanceCents < minStake) {
      if (showed) setPendingBalanceEnd(true);
      else window.setTimeout(() => finish('balance'), reducedMotion ? 0 : 260);
    }
  };

  const setStake = (direction: -1 | 1) => {
    if (animating || ping) return;
    const currentIndex = stakes.indexOf(run.stakeCents as never);
    const index = Math.max(0, Math.min(stakes.length - 1, (currentIndex < 0 ? 1 : currentIndex) + direction));
    const nextStake = stakes[index];
    if (nextStake > run.balanceCents) return;
    spinAudio.click();
    track('stake_changed', { from: run.stakeCents, to: nextStake, balance: run.balanceCents, afterPing: lastDismissedPing.current?.type ?? null });
    setRun(current => ({ ...current, previousStakeCents: current.stakeCents, stakeCents: nextStake }));
  };

  const dismissPing = () => {
    const now = Date.now();
    if (ping) {
      const record = runRef.current.pings[runRef.current.pings.length - 1];
      track('reality_ping_dismissed', { type: ping.type, dwellMs: record ? Math.max(0, now - record.shownAt) : 0 });
      lastDismissedPing.current = { type: ping.type, dismissedAt: now };
    }
    setPing(null);
    setRun(current => ({ ...current, pings: current.pings.map((p, i) => i === current.pings.length - 1 ? { ...p, dismissedAt: now } : p) }));
    if (pendingBalanceEnd) { setPendingBalanceEnd(false); window.setTimeout(() => finish('balance'), 80); }
  };

  const days = daysUntil(profile.nextIncomeDate);
  const obligation = profile.obligationType === 'rent' ? 'RENT' : profile.obligationType === 'car' ? 'CAR PAYMENT' : profile.obligationType === 'none' ? null : profile.obligationType.replace('-', ' ').toUpperCase();

  return (
    <main className="run-shell" style={{ '--reality': intensity } as React.CSSProperties}>
      <div className="reality-background" aria-hidden="true">
        {obligation && profile.obligationAmountCents ? <div className="context-ghost ghost-a"><span>{obligation}</span><strong>{formatMoney(profile.obligationAmountCents)}</strong></div> : null}
        {days != null ? <div className="context-ghost ghost-b"><strong>{days}</strong><span>DAYS UNTIL MONEY</span></div> : null}
        {profile.personalMoneyGoal ? <div className="context-ghost ghost-c"><span>{profile.personalMoneyGoal.toUpperCase()}</span></div> : null}
        {reality.obligationShortfallCents ? <div className="context-ghost ghost-d"><strong>{formatMoney(reality.obligationShortfallCents)}</strong><span>SHORT</span></div> : null}
      </div>

      <section className="run-card" aria-label="Reality Run">
        <div className="run-hud">
          <div><span>Balance</span><strong>{formatMoney(run.balanceCents)}</strong></div>
          <div><span>Stake</span><strong>{formatMoney(run.stakeCents)}</strong></div>
          <div><span>Plays</span><strong>{run.actionCount}</strong></div>
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

        <div className="run-controls">
          <div className="stake-control" aria-label="Practice stake">
            <button type="button" onClick={() => setStake(-1)} aria-label="Lower practice stake" disabled={animating || stakes[0] === run.stakeCents}>−</button>
            <span><small>Practice stake</small>{formatMoney(run.stakeCents)}</span>
            <button type="button" onClick={() => setStake(1)} aria-label="Raise practice stake" disabled={animating || stakes[2] === run.stakeCents || stakes[Math.min(stakes.length-1,stakes.indexOf(run.stakeCents as never)+1)] > run.balanceCents}>+</button>
          </div>
          <button type="button" className="game-action" onClick={act} disabled={animating || Boolean(ping) || run.balanceCents < run.stakeCents}>{animating ? '...' : actionLabel(profile.gamblingType)}</button>
        </div>
        <p className="run-fineprint">Practice only. No real money. Leave whenever you want.</p>
      </section>
    </main>
  );
}
