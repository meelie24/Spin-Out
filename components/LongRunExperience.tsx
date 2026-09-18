'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatMoney } from '@/lib/engine';
import type { LongRunResult } from '@/lib/realityEngine/longRun';

const phases = [1, 100, 1000, 10_000] as const;

export function LongRunExperience({
  result,
  gameLabel,
  onClose,
}: {
  result: LongRunResult;
  gameLabel: string;
  onClose: () => void;
}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const reduced = typeof window !== 'undefined'
    && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (reduced) {
      queueMicrotask(() => setPhaseIndex(3));
      return;
    }
    const timers = [
      window.setTimeout(() => setPhaseIndex(1), 420),
      window.setTimeout(() => setPhaseIndex(2), 900),
      window.setTimeout(() => setPhaseIndex(3), 1550),
    ];
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [reduced]);

  const phase = phases[phaseIndex];
  const sampleCount = phaseIndex === 0 ? 1 : phaseIndex === 1 ? 14 : phaseIndex === 2 ? 30 : 12;
  const samples = useMemo(() => result.samples.slice(0, sampleCount), [result.samples, sampleCount]);

  return (
    <section className="longrun-panel" role="dialog" aria-modal="true" aria-label="10,000 run view">
      <div className="longrun-head">
        <div>
          <span>Long run · {gameLabel}</span>
          <strong>{phase.toLocaleString()} {phase === 1 ? 'run' : 'runs'}</strong>
        </div>
        <button type="button" className="bare-link" onClick={onClose}>Close</button>
      </div>

      <div className={'longrun-stream phase-' + phaseIndex} aria-hidden="true">
        {samples.map((sample,index) => (
          <i
            key={index}
            className={[
              sample.netCents > 0 ? 'is-win' : sample.netCents < 0 ? 'is-loss' : 'is-push',
              sample.nearMiss ? 'is-near' : '',
            ].join(' ')}
          />
        ))}
      </div>

      {phaseIndex < 3 ? (
        <div className="longrun-build">
          <strong>{phaseIndex === 0 ? 'Again.' : phaseIndex === 1 ? 'Keep going.' : 'Now pull back.'}</strong>
          <span>One result can feel huge. This is what happens when the same game keeps running.</span>
        </div>
      ) : (
        <div className="longrun-final" aria-live="polite">
          <div className="longrun-net">
            <span>After 10,000 runs</span>
            <strong className={result.netCents < 0 ? 'is-negative' : ''}>{result.netCents >= 0 ? '+' : ''}{formatMoney(result.netCents)}</strong>
          </div>
          <div className="longrun-stats">
            <div><span>Wins</span><strong>{result.wins.toLocaleString()}</strong></div>
            <div><span>Losses</span><strong>{result.losses.toLocaleString()}</strong></div>
            <div><span>Near misses</span><strong>{result.nearMisses.toLocaleString()}</strong></div>
            <div><span>Longest losing stretch</span><strong>{result.longestLossStreak}</strong></div>
          </div>
          <p>Big wins happened. So did a lot of losing.</p>
          <small>Staked: {formatMoney(result.totalStakedCents)} · Returned: {formatMoney(result.totalReturnedCents)}</small>
          {result.strategyNote ? <small>{result.strategyNote}</small> : null}
        </div>
      )}
    </section>
  );
}
