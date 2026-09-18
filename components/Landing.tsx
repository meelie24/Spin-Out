'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatMoney, recentExitAverageSeconds } from '@/lib/engine';
import { loadData, totalMoneyKept, updateData } from '@/lib/storage';
import { JourneyCounter } from './JourneyCounter';

function formatTime(seconds: number | null) {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Landing() {
  const [ready, setReady] = useState(false);
  const [runs, setRuns] = useState<ReturnType<typeof loadData>['runs']>([]);
  const [account, setAccount] = useState<ReturnType<typeof loadData>['account'] | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const data = loadData();
    setRuns(data.runs);
    setAccount(data.account);
    setReady(true);
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
              <Link href="/play" className="primary-cta">I feel like gambling</Link>
              {account?.billing === 'premium' ? <Link href="/plus" className="bare-link plus-home-link">Open Spin Out+</Link> : null}
            </>
          ) : (
            <>
              <h1 id="home-title">About to gamble?</h1>
              <p className="landing-blurb">Run it here first.</p>
              <Link href="/play" className="primary-cta">Start</Link>
            </>
          )}
          <button className="bare-link" type="button" onClick={() => setSignInOpen(true)}>
            {account?.signedIn ? 'Signed in' : 'Sign in'}
          </button>
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
          <div className="mini-deck"><span>Practice balance</span><b>FAKE</b></div>
        </div>
      </section>

      <JourneyCounter />

      <div className="landing-foot">
        <p>Practice only. No real money moves here.</p>
        <div><Link href="/research">Research</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>

      {signInOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSignInOpen(false)}>
          <section className="glass-dialog" role="dialog" aria-modal="true" aria-labelledby="sign-in-title" onMouseDown={e => e.stopPropagation()}>
            <p className="kicker">Optional</p>
            <h2 id="sign-in-title">Sign in on this device</h2>
            <p>This build keeps the account state in this browser. Nothing is sent anywhere.</p>
            <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com"/></label>
            <div className="modal-actions">
              <button className="soft-button" type="button" onClick={() => setSignInOpen(false)}>Cancel</button>
              <button className="primary-button" type="button" disabled={!email.includes('@')} onClick={() => {
                const next = updateData(data => ({ ...data, account: { ...data.account, signedIn: true, email } }));
                setAccount(next.account); setSignInOpen(false);
              }}>Sign in</button>
            </div>
          </section>
        </div>
      ) : null}
      {!ready ? <span className="sr-only">Loading</span> : null}
    </main>
  );
}
