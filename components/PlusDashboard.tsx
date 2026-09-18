'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatMoney, recentExitAverageSeconds } from '@/lib/engine';
import { currentMonthMoneyKept, loadData, totalMoneyKept } from '@/lib/storage';
import type { RunRecord } from '@/lib/types';
import { PlusPanel } from './PlusPanel';

function fmtTime(seconds: number | null) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((a,b)=>a+b,0) / values.length) : null;
}

function labelTrigger(trigger: RunRecord['triggerType']) {
  return trigger.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function PlusDashboard({ authenticated, premium, serverRuns }: { authenticated: boolean; premium: boolean; serverRuns: RunRecord[] }) {
  const [data, setData] = useState<ReturnType<typeof loadData> | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    const current = loadData();
    const merged = new Map<string, RunRecord>();
    for (const run of serverRuns) merged.set(run.id, run);
    for (const run of current.runs) merged.set(run.id, run);
    setData({ ...current, runs: [...merged.values()].sort((a,b) => a.endedAt - b.endedAt) });
  }, [serverRuns]);

  const runs = data?.runs ?? [];

  const metrics = useMemo(() => {
    const voluntary = runs.filter(r => r.timeToExitSeconds != null).map(r => r.timeToExitSeconds as number);
    const first5 = voluntary.slice(0, 5);
    const recent5 = voluntary.slice(-5);
    const now = Date.now();
    const week = runs.filter(r => now - r.endedAt <= 7 * 24 * 60 * 60 * 1000);
    const urgeDelta = week.length ? average(week.map(r => r.endingUrge - r.startingUrge)) : null;
    const triggerCounts = new Map<string, number>();
    for (const run of runs) triggerCounts.set(run.triggerType, (triggerCounts.get(run.triggerType) ?? 0) + 1);
    const triggers = [...triggerCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);
    const pingStats = new Map<string, { shown:number; exitedSoon:number }>();
    for (const run of runs) {
      for (const ping of run.pings) {
        const item = pingStats.get(ping.type) ?? { shown:0, exitedSoon:0 };
        item.shown += 1;
        if (run.exitReason === 'voluntary' && run.endedAt - ping.shownAt <= 60_000) item.exitedSoon += 1;
        pingStats.set(ping.type, item);
      }
    }
    return {
      firstAvg: average(first5),
      recentAvg: average(recent5),
      monthKept: currentMonthMoneyKept(runs),
      allKept: totalMoneyKept(runs),
      week,
      weekKept: week.reduce((sum,r)=>sum+Math.max(0,r.moneyKeptCents),0),
      weekExit: average(week.filter(r=>r.timeToExitSeconds!=null).map(r=>r.timeToExitSeconds as number)),
      urgeDelta,
      triggers,
      pingStats:[...pingStats.entries()].sort((a,b)=>b[1].shown-a[1].shown).slice(0,4),
    };
  }, [runs]);

  if (!data) return <main className="plus-page"><span className="loading-dot"/>Loading</main>;

  if (!premium) {
    return <main className="plus-page">
      <section className="plus-gate">
        <p className="kicker">Spin Out+</p>
        <h1>Longer-term patterns live here.</h1>
        <p>{authenticated ? 'Core Reality Runs stay free. Plus keeps your full history and trend views.' : 'Sign in to use Plus across devices and keep paid access tied to your account.'}</p>
        {authenticated ? <button className="primary-button" type="button" onClick={() => setUpgradeOpen(true)}>See Plus</button> : <Link className="primary-button" href="/">Sign in</Link>}
        <Link className="bare-link" href="/">Back home</Link>
      </section>
      {authenticated && upgradeOpen ? <PlusPanel onClose={() => setUpgradeOpen(false)} /> : null}
    </main>;
  }

  const maxKept = Math.max(1, ...runs.slice(-12).map(r => Math.max(0,r.moneyKeptCents)));
  return <main className="plus-page">
    <header className="plus-head">
      <div><p className="kicker">Spin Out+</p><h1>Your patterns.</h1></div>
      <Link className="soft-button" href="/play">Start a Reality Run</Link>
    </header>

    <section className="plus-score-grid" aria-label="Plus summary">
      <article><span>Money kept</span><strong>{formatMoney(metrics.allKept)}</strong><small>{formatMoney(metrics.monthKept)} this month</small></article>
      <article><span>Recent exit average</span><strong>{fmtTime(metrics.recentAvg)}</strong><small>{metrics.firstAvg != null ? `First five: ${fmtTime(metrics.firstAvg)}` : 'More runs will build this trend'}</small></article>
      <article><span>Reality Runs</span><strong>{runs.length}</strong><small>{runs.filter(r=>r.exitReason==='voluntary').length} voluntary exits</small></article>
    </section>

    <section className="plus-section">
      <div className="section-title"><div><p className="kicker">Last 7 days</p><h2>Weekly readout</h2></div></div>
      <div className="week-grid">
        <div><span>Runs</span><strong>{metrics.week.length}</strong></div>
        <div><span>Kept</span><strong>{formatMoney(metrics.weekKept)}</strong></div>
        <div><span>Exit average</span><strong>{fmtTime(metrics.weekExit)}</strong></div>
        <div><span>Urge shift</span><strong>{metrics.urgeDelta == null ? '—' : metrics.urgeDelta === 0 ? 'No change' : `${metrics.urgeDelta > 0 ? '+' : ''}${metrics.urgeDelta}`}</strong></div>
      </div>
    </section>

    <section className="plus-section">
      <div className="section-title"><div><p className="kicker">Money kept</p><h2>Recent runs</h2></div></div>
      <div className="kept-bars" aria-label="Money kept across recent runs">
        {runs.slice(-12).map((run, i) => {
          const kept = Math.max(0, run.moneyKeptCents);
          return <div className="kept-column" key={run.id} title={`${formatMoney(kept)} kept`}>
            <span style={{ height: `${Math.max(4, kept / maxKept * 100)}%` }} />
            <small>{i === runs.slice(-12).length - 1 ? 'Now' : ''}</small>
          </div>;
        })}
        {!runs.length ? <p className="empty-note">Your completed runs will appear here.</p> : null}
      </div>
    </section>

    <section className="plus-two-col">
      <article className="plus-section">
        <p className="kicker">Triggers</p><h2>What brought you in</h2>
        <div className="pattern-list">{metrics.triggers.map(([trigger,count]) => <div key={trigger}><span>{labelTrigger(trigger as RunRecord['triggerType'])}</span><strong>{count}</strong></div>)}{!metrics.triggers.length ? <p className="empty-note">No pattern yet.</p> : null}</div>
      </article>
      <article className="plus-section">
        <p className="kicker">Reality Pings</p><h2>What showed up</h2>
        <div className="pattern-list">{metrics.pingStats.map(([type,stat]) => <div key={type}><span>{type.replaceAll('-', ' ')}</span><strong>{stat.exitedSoon}/{stat.shown}</strong></div>)}{!metrics.pingStats.length ? <p className="empty-note">No Ping pattern yet.</p> : null}</div>
        <p className="metric-note">The second number is times shown. The first is voluntary exits within a minute. It does not prove the Ping caused the exit.</p>
      </article>
    </section>

    <section className="plus-section history-section">
      <div className="section-title"><div><p className="kicker">History</p><h2>Every saved run</h2></div></div>
      <div className="run-history">
        {[...runs].reverse().map(run => <article key={run.id}>
          <div><strong>{new Date(run.endedAt).toLocaleDateString()}</strong><span>{labelTrigger(run.triggerType)}</span></div>
          <div><span>Exit</span><strong>{fmtTime(run.timeToExitSeconds)}</strong></div>
          <div><span>Kept</span><strong>{formatMoney(Math.max(0,run.moneyKeptCents))}</strong></div>
          <div><span>Urge</span><strong>{run.startingUrge} → {run.endingUrge}</strong></div>
        </article>)}
        {!runs.length ? <p className="empty-note">Complete a Reality Run to start your history.</p> : null}
      </div>
    </section>

    <footer className="plus-foot"><Link href="/">Back home</Link><a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noreferrer">Manage subscription</a></footer>
  </main>;
}
