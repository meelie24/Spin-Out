'use client';

import { useMemo, useRef, useState } from 'react';
import { PlusPanel } from './PlusPanel';
import { classifyRealWorldOutcome, computeMoneyKept, formatMoney, recentExitAverageSeconds } from '@/lib/engine';
import { currentMonthMoneyKept, loadData, totalMoneyKept, track, updateData } from '@/lib/storage';
import type { RealityProfile, RunRecord } from '@/lib/types';
import type { RunEndData } from './RealityRun';
import { syncProfileIfSignedIn, syncRunIfSignedIn } from '@/lib/sync';

function formatTime(seconds: number | null) {
  if (seconds == null) return '—';
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

export function PostRunFlow({ profile, end, onDone }: { profile: RealityProfile; end: RunEndData; onDone: () => void }) {
  const [initialRuns] = useState<RunRecord[]>(() => loadData().runs);
  const [stage, setStage] = useState<'exit-receipt'|'urge'|'urge-shift'|'outcome'|'amount'|'summary'>('exit-receipt');
  const [endingUrge, setEndingUrge] = useState<number | null>(null);
  const [actualWagerCents, setActualWagerCents] = useState(0);
  const [savedRuns, setSavedRuns] = useState<RunRecord[]>(initialRuns);
  const [plusOpen, setPlusOpen] = useState(false);
  const [extraGoal, setExtraGoal] = useState<string | null>(profile.additionalMoneyGoal ?? null);
  const saved = useRef(false);

  const durationSeconds = Math.max(0, Math.round((end.endedAt - end.run.startedAt) / 1000));
  const lastPing = end.run.pings[end.run.pings.length - 1];
  const exitedAfterPing = end.reason === 'voluntary' && Boolean(lastPing && end.endedAt - lastPing.shownAt <= 60_000);
  const previousComparable = [...initialRuns].reverse().find(run =>
    run.gamblingType === profile.gamblingType && run.timeToExitSeconds != null
  ) ?? null;

  const averageActionIntervalMs = average((end.run.actionIntervalsMs ?? []).filter(ms => Number.isFinite(ms) && ms >= 0));
  const limitExceededByRounds = end.run.chosenLimitRounds == null
    ? 0
    : Math.max(0, end.run.actionCount - end.run.chosenLimitRounds);
  const limitExceededSeconds = end.run.chosenLimitMinutes == null
    ? 0
    : Math.max(0, durationSeconds - end.run.chosenLimitMinutes * 60);

  const finalize = (actual: number) => {
    if (endingUrge == null || saved.current) return;
    saved.current = true;
    setActualWagerCents(actual);
    const math = computeMoneyKept(profile.intendedWagerCents, actual);
    const realWorldOutcome = classifyRealWorldOutcome(profile.intendedWagerCents, actual);

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
      realWorldOutcome,
      context: {
        availableUntilIncomeCents: profile.availableUntilIncomeCents,
        nextIncomeDate: profile.nextIncomeDate,
        obligationType: profile.obligationType,
        obligationAmountCents: profile.obligationAmountCents,
        obligationDueDate: profile.obligationDueDate,
        recentLenderName: profile.recentLenderName,
        recentLenderHelpedRecently: profile.recentLenderHelpedRecently,
        recentLenderAmountCents: profile.recentLenderAmountCents,
        personalMoneyGoal: profile.personalMoneyGoal,
        quitReason: profile.quitReason ?? null,
      },
      pings: end.run.pings,
      timeline: end.run.timeline,
      actions: end.run.actionCount,
      sessionDurationSeconds: durationSeconds,
      totalStakedCents: end.run.totalStakedCents ?? 0,
      averageActionIntervalMs,
      chosenLimitRounds: end.run.chosenLimitRounds ?? null,
      chosenLimitMinutes: end.run.chosenLimitMinutes ?? null,
      limitExceededByRounds,
      limitExceededSeconds,
      exitedAfterPing,
      returnedAfterMs: end.run.returnedAfterMs ?? null,
    };

    const next = updateData(data => ({
      ...data,
      profile,
      runs: [...data.runs, record].slice(-80),
    }));
    setSavedRuns(next.runs);

    track('run_outcome_recorded', {
      outcome: realWorldOutcome,
      actual,
      kept: math.keptCents,
      urgeBefore: profile.startingUrge,
      urgeAfter: endingUrge,
      durationSeconds,
      rounds: end.run.actionCount,
      pingCount: end.run.pings.length,
      exitedAfterPing,
      limitExceededByRounds,
      limitExceededSeconds,
      averageActionIntervalMs,
      returnedAfterMs: end.run.returnedAfterMs ?? null,
    });

    void syncRunIfSignedIn(profile, record);
    setStage('summary');
  };

  const money = useMemo(
    () => computeMoneyKept(profile.intendedWagerCents, actualWagerCents),
    [profile.intendedWagerCents, actualWagerCents],
  );
  const monthKept = useMemo(() => currentMonthMoneyKept(savedRuns), [savedRuns]);
  const allKept = useMemo(() => totalMoneyKept(savedRuns), [savedRuns]);
  const recentExit = useMemo(() => recentExitAverageSeconds(savedRuns), [savedRuns]);

  const finishAndLeave = async () => {
    await fetch('/api/access/consume', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ runId: end.run.id }),
    }).catch(() => null);
    window.dispatchEvent(new Event('spinout:access-changed'));
    onDone();
  };

  return (
    <main className="post-shell">
      <section className="post-card">
        {stage === 'exit-receipt' ? <>
          <p className="kicker">{end.reason === 'voluntary' ? 'You left.' : 'Reality Run ended'}</p>
          <div className="exit-receipt">
            <div><strong>{formatTime(durationSeconds)}</strong><span>session</span></div>
            <div><strong>{end.run.actionCount}</strong><span>{end.run.actionCount === 1 ? 'round' : 'rounds'}</span></div>
            <div><strong>{end.run.pings.length}</strong><span>Reality {end.run.pings.length === 1 ? 'Ping' : 'Pings'}</span></div>
          </div>

          {exitedAfterPing ? <p className="exit-observation">You left after the last Reality Ping.</p> : null}

          {end.reason === 'voluntary' && previousComparable?.timeToExitSeconds != null ? (
            <div className="exit-compare">
              <span>Last comparable run</span>
              <strong>{formatTime(previousComparable.timeToExitSeconds)}</strong>
              {end.timeToExitSeconds != null && end.timeToExitSeconds < previousComparable.timeToExitSeconds
                ? <em>You left sooner.</em>
                : null}
            </div>
          ) : null}

          {limitExceededByRounds > 0 ? (
            <p className="exit-observation">You went {limitExceededByRounds} round{limitExceededByRounds === 1 ? '' : 's'} past the limit you chose.</p>
          ) : null}
          {limitExceededSeconds > 0 ? (
            <p className="exit-observation">You stayed {formatTime(limitExceededSeconds)} past the time you chose.</p>
          ) : null}

          <button className="primary-button" type="button" onClick={() => setStage('urge')}>Continue</button>
        </> : null}

        {stage === 'urge' ? <>
          <p className="kicker">Right now</p>
          <h1>How bad do you want to play now?</h1>
          <div className="urge-scale" role="group" aria-label="Urge from 1 to 10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setEndingUrge(n);
                  setStage('urge-shift');
                  window.setTimeout(() => setStage('outcome'), 620);
                }}
                style={{ '--heat': n / 10 } as React.CSSProperties}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="urge-labels"><span>Low</span><span>High</span></div>
        </> : null}

        {stage === 'urge-shift' && endingUrge != null ? (
          <div className="urge-shift" aria-live="polite">
            <span>{profile.startingUrge}</span><i>→</i><strong>{endingUrge}</strong>
          </div>
        ) : null}

        {stage === 'outcome' ? <>
          <p className="kicker">One more thing</p>
          <h1>Did you end up gambling?</h1>
          <div className="outcome-choices">
            <button type="button" onClick={() => finalize(0)}>No</button>
            <button type="button" onClick={() => setStage('amount')}>Less than I planned</button>
            <button type="button" onClick={() => setStage('amount')}>Yes</button>
          </div>
        </> : null}

        {stage === 'amount' ? <>
          <p className="kicker">What happened</p>
          <h1>How much?</h1>
          <form className="big-money-input" onSubmit={e => {
            e.preventDefault();
            const raw = String(new FormData(e.currentTarget).get('actual') ?? '');
            const n = Number(raw.replace(/[^0-9.]/g,''));
            if (Number.isFinite(n) && n >= 0) finalize(Math.round(n * 100));
          }}>
            <span>$</span><input name="actual" inputMode="decimal" autoFocus placeholder="0"/><button type="submit">Record</button>
          </form>
        </> : null}

        {stage === 'summary' ? <>
          <div className="summary-topline">
            <span>{end.reason === 'voluntary' ? 'You left' : end.reason === 'timeout' ? 'Run ended at 15 minutes' : 'Practice balance ran out'}</span>
            <strong>{formatTime(durationSeconds)}</strong>
          </div>

          {money.overspentCents > 0 ? <>
            <h1>You planned {formatMoney(profile.intendedWagerCents)}.</h1>
            <p className="overspend-line">You spent {formatMoney(actualWagerCents)}. That’s {formatMoney(money.overspentCents)} more than planned.</p>
          </> : <>
            <p className="kicker">Money kept</p>
            <div className="money-kept">{formatMoney(money.keptCents)} <span>KEPT</span></div>
            <div className="money-kept-grid">
              <div><span>This month</span><strong>{formatMoney(monthKept)}</strong></div>
              <div><span>All time</span><strong>{formatMoney(allKept)}</strong></div>
            </div>
          </>}

          {money.keptCents > 0 && profile.obligationAmountCents && profile.obligationType !== 'none' ? (
            <div className="protected-card">
              <span>{profile.obligationType.replace('-', ' ').toUpperCase()}</span>
              <strong>{formatMoney(Math.min(money.keptCents, profile.obligationAmountCents))} / {formatMoney(profile.obligationAmountCents)}</strong>
              <em>PROTECTED</em>
            </div>
          ) : null}

          {recentExit != null ? (
            <div className="exit-metric"><span>Recent exit average</span><strong>{formatTime(recentExit)}</strong></div>
          ) : null}

          {savedRuns.length >= 3 && !extraGoal ? (
            <div className="progressive-card">
              <span>One more thing for next time</span>
              <strong>Anything else you want this money available for?</strong>
              <div className="progressive-choices">
                {['Emergency fund','Family','Debt','Savings'].map(label => (
                  <button key={label} type="button" onClick={() => {
                    setExtraGoal(label);
                    const next = updateData(data => ({
                      ...data,
                      profile: data.profile ? { ...data.profile, additionalMoneyGoal: label } : data.profile,
                    }));
                    void syncProfileIfSignedIn(next.profile);
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="summary-actions">
            <button className="primary-button" type="button" onClick={() => void finishAndLeave()}>Done</button>
            <button className="bare-link" type="button" onClick={() => setPlusOpen(true)}>Spin Out+</button>
          </div>
          {plusOpen ? <PlusPanel onClose={() => setPlusOpen(false)} /> : null}
        </> : null}
      </section>
    </main>
  );
}
