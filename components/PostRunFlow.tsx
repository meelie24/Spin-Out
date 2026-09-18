'use client';

import { useMemo, useRef, useState } from 'react';
import { PlusPanel } from './PlusPanel';
import { computeMoneyKept, formatMoney, recentExitAverageSeconds } from '@/lib/engine';
import { currentMonthMoneyKept, loadData, totalMoneyKept, track, updateData } from '@/lib/storage';
import type { RealityProfile, RunRecord } from '@/lib/types';
import type { RunEndData } from './RealityRun';

function formatTime(seconds: number | null) {
  if (seconds == null) return 'Run ended';
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function PostRunFlow({ profile, end, onDone }: { profile: RealityProfile; end: RunEndData; onDone: () => void }) {
  const [stage, setStage] = useState<'urge'|'urge-shift'|'outcome'|'amount'|'summary'>('urge');
  const [endingUrge, setEndingUrge] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'no'|'yes'|'less'|null>(null);
  const [actualWagerCents, setActualWagerCents] = useState(0);
  const [savedRuns, setSavedRuns] = useState<RunRecord[]>(() => loadData().runs);
  const [plusOpen, setPlusOpen] = useState(false);
  const saved = useRef(false);

  const finalize = (actual: number, answer = outcome) => {
    if (endingUrge == null || saved.current) return;
    saved.current = true;
    setActualWagerCents(actual);
    const math = computeMoneyKept(profile.intendedWagerCents, actual);
    const record: RunRecord = {
      id: end.run.id,
      startedAt: end.run.startedAt,
      endedAt: end.endedAt,
      exitReason: end.reason,
      timeToExitSeconds: end.timeToExitSeconds,
      intendedWagerCents: profile.intendedWagerCents,
      actualWagerCents: actual,
      moneyKeptCents: math.keptCents,
      startingUrge: profile.startingUrge,
      endingUrge,
      gamblingType: profile.gamblingType,
      triggerType: profile.triggerType,
      pings: end.run.pings,
      actions: end.run.actionCount,
    };
    const next = updateData(data => ({ ...data, profile, runs: [...data.runs, record].slice(-80) }));
    setSavedRuns(next.runs);
    track('run_outcome_recorded', { outcome: answer ?? 'unknown', actual, kept: math.keptCents, urgeBefore: profile.startingUrge, urgeAfter: endingUrge });
    setStage('summary');
  };

  const money = useMemo(() => computeMoneyKept(profile.intendedWagerCents, actualWagerCents), [profile.intendedWagerCents, actualWagerCents]);
  const monthKept = useMemo(() => currentMonthMoneyKept(savedRuns), [savedRuns]);
  const allKept = useMemo(() => totalMoneyKept(savedRuns), [savedRuns]);
  const recentExit = useMemo(() => recentExitAverageSeconds(savedRuns), [savedRuns]);

  return (
    <main className="post-shell">
      <section className="post-card">
        {stage === 'urge' ? <>
          <p className="kicker">Reality Run ended</p>
          <h1>How bad do you want to play now?</h1>
          <div className="urge-scale" role="group" aria-label="Urge from 1 to 10">{Array.from({ length: 10 }, (_, i) => i + 1).map(n => <button key={n} type="button" onClick={() => { setEndingUrge(n); setStage('urge-shift'); window.setTimeout(() => setStage('outcome'), 620); }} style={{ '--heat': n / 10 } as React.CSSProperties}>{n}</button>)}</div>
          <div className="urge-labels"><span>Low</span><span>High</span></div>
        </> : null}

        {stage === 'urge-shift' && endingUrge != null ? <div className="urge-shift" aria-live="polite"><span>{profile.startingUrge}</span><i>→</i><strong>{endingUrge}</strong></div> : null}

        {stage === 'outcome' ? <>
          <p className="kicker">One more thing</p><h1>Did you end up gambling?</h1>
          <div className="outcome-choices">
            <button type="button" onClick={() => { setOutcome('no'); finalize(0, 'no'); }}>No</button>
            <button type="button" onClick={() => { setOutcome('less'); setStage('amount'); }}>Less than I planned</button>
            <button type="button" onClick={() => { setOutcome('yes'); setStage('amount'); }}>Yes</button>
          </div>
        </> : null}

        {stage === 'amount' ? <>
          <p className="kicker">What happened</p><h1>How much?</h1>
          <form className="big-money-input" onSubmit={e => { e.preventDefault(); const raw = String(new FormData(e.currentTarget).get('actual') ?? ''); const n = Number(raw.replace(/[^0-9.]/g,'')); if (Number.isFinite(n) && n >= 0) finalize(Math.round(n * 100)); }}>
            <span>$</span><input name="actual" inputMode="decimal" autoFocus placeholder="0"/><button type="submit">Record</button>
          </form>
          <p className="setup-note">Just the number. No judgment.</p>
        </> : null}

        {stage === 'summary' ? <>
          <div className="summary-topline"><span>{end.reason === 'voluntary' ? 'You left' : end.reason === 'timeout' ? 'Run ended at 15 minutes' : 'Practice balance ran out'}</span>{end.timeToExitSeconds != null ? <strong>{formatTime(end.timeToExitSeconds)}</strong> : null}</div>
          {money.overspentCents > 0 ? <>
            <h1>You planned {formatMoney(profile.intendedWagerCents)}.</h1>
            <p className="overspend-line">You spent {formatMoney(actualWagerCents)}. That’s {formatMoney(money.overspentCents)} more than planned.</p>
          </> : <>
            <p className="kicker">Money kept</p><div className="money-kept">{formatMoney(money.keptCents)} <span>KEPT</span></div>
            <div className="money-kept-grid"><div><span>This month</span><strong>{formatMoney(monthKept)}</strong></div><div><span>All time</span><strong>{formatMoney(allKept)}</strong></div></div>
          </>}

          {money.keptCents > 0 && profile.obligationAmountCents && profile.obligationType !== 'none' ? <div className="protected-card"><span>{profile.obligationType.replace('-', ' ').toUpperCase()}</span><strong>{formatMoney(Math.min(money.keptCents, profile.obligationAmountCents))} / {formatMoney(profile.obligationAmountCents)}</strong><em>PROTECTED</em></div> : null}
          {recentExit != null ? <div className="exit-metric"><span>Recent exit average</span><strong>{formatTime(recentExit)}</strong></div> : null}
          <div className="summary-actions"><button className="primary-button" type="button" onClick={onDone}>Done</button><button className="bare-link" type="button" onClick={() => setPlusOpen(true)}>Spin Out+</button></div>{plusOpen ? <PlusPanel onClose={() => setPlusOpen(false)} /> : null}
        </> : null}
      </section>
    </main>
  );
}
