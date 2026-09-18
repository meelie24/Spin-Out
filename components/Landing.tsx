'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatMoney, recentExitAverageSeconds } from '@/lib/engine';
import { loadData, totalMoneyKept } from '@/lib/storage';
import { JourneyCounter } from './JourneyCounter';
import { AuthControl } from './AuthControl';
import { PlusAccessLink } from './PlusAccessLink';

function formatTime(seconds: number | null) {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Landing() {
  const [ready, setReady] = useState(false);
  const [runs, setRuns] = useState<ReturnType<typeof loadData>['runs']>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const data = loadData();
      setRuns(data.runs);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const kept = useMemo(() => totalMoneyKept(runs), [runs]);
  const recent = useMemo(() => recentExitAverageSeconds(runs), [runs]);
  const returning = runs.length > 0;

  return (
    <main className="landing-shell">
      <section className="landing-card" aria-labelledby="home-title">
        <div className="landing-copy">
          <p className="kicker">Spin Out</p>
          {returning ? (
            <>
              <h1 id="home-title">{formatMoney(kept)} kept.</h1>
              {recent != null ? <p className="subtle-metric">Recent exit average <strong>{formatTime(recent)}</strong></p> : null}
              <Link href="/play" className="primary-cta">I feel like gambling</Link>              <PlusAccessLink />
            </>
          ) : (
            <>
              <h1 id="home-title">About to gamble?</h1>
              <p className="landing-blurb">Run it here first.</p>
              <Link href="/play" className="primary-cta">Start</Link>
            </>
          )}          <AuthControl />
        </div>
        <div className="landing-visual" aria-hidden="true">
          <div className="light-arch"><i/><i/><i/><i/><i/><i/><i/></div>
          <div className="mini-reels">
            <div><img src="/symbols/cherry.svg" alt=""/><img src="/symbols/bell.svg" alt=""/><img src="/symbols/gem.svg" alt=""/></div>
            <div><img src="/symbols/plum.svg" alt=""/><img src="/symbols/seven.svg" alt=""/><img src="/symbols/lemon.svg" alt=""/></div>
            <div><img src="/symbols/bell.svg" alt=""/><img src="/symbols/cherry.svg" alt=""/><img src="/symbols/plum.svg" alt=""/></div>
            <div><img src="/symbols/gem.svg" alt=""/><img src="/symbols/lemon.svg" alt=""/><img src="/symbols/bell.svg" alt=""/></div>
            <div><img src="/symbols/seven.svg" alt=""/><img src="/symbols/plum.svg" alt=""/><img src="/symbols/cherry.svg" alt=""/></div>
          </div>
          <div className="mini-deck"><span>Balance</span></div>
        </div>
      </section>

      <JourneyCounter />

      <div className="landing-foot">
        <p>Simulated balance. Nothing can be withdrawn or redeemed.</p>
        <div><Link href="/research">Research</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>

      {!ready ? <span className="sr-only">Loading</span> : null}
    </main>
  );
}
