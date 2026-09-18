'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatMoney, recentExitAverageSeconds } from '@/lib/engine';
import { loadData, totalMoneyKept } from '@/lib/storage';
import type { GamblingType } from '@/lib/types';
import { AuthControl } from './AuthControl';
import { JourneyCounter } from './JourneyCounter';
import { AccessStatus } from './AccessStatus';
import { RealityContextPanel } from './RealityContextPanel';
import { buildRealityInsights } from '@/lib/realityEngine/insights';
import type { RealityProfile } from '@/lib/types';

const games: Array<{
  id: GamblingType;
  name: string;
  eyebrow: string;
  description: string;
  purpose: string;
  symbols: string[];
  tone: string;
}> = [
  { id: 'slots', name: 'Slots', eyebrow: '5 reels · 5 lines', description: 'Weighted reel stops, visible paylines and a real paytable.', purpose: 'See what keeps you chasing.', symbols: ['/symbols/seven.svg','/symbols/bar.svg','/symbols/cherry.svg'], tone: 'slots' },
  { id: 'sports', name: 'Sportsbook', eyebrow: 'Moneyline', description: 'Fictional events with real odds, bet-slip math and potential return.', purpose: 'Catch what the odds make you reach for.', symbols: ['/symbols/sports-ticket.svg','/symbols/cash-coin.svg','/symbols/gem.svg'], tone: 'sports' },
  { id: 'casino', name: 'Roulette', eyebrow: 'Single zero', description: 'A 37-pocket European wheel with red and black even-money bets.', purpose: 'Practice leaving while you still want another round.', symbols: ['/symbols/roulette.svg','/symbols/cash-coin.svg','/symbols/gem.svg'], tone: 'casino' },
  { id: 'poker', name: 'Video Poker', eyebrow: 'Jacks or Better', description: 'Deal five, choose individual holds, draw and resolve the hand.', purpose: 'See what a win makes you want to do next.', symbols: ['/symbols/cards.svg','/symbols/bar.svg','/symbols/gem.svg'], tone: 'poker' },
  { id: 'lottery', name: 'Scratch', eyebrow: 'Match 3', description: 'A predetermined nine-panel ticket revealed in sequence.', purpose: 'Catch what “almost” does to you.', symbols: ['/symbols/scratch-ticket.svg','/symbols/seven.svg','/symbols/cash-coin.svg'], tone: 'lottery' },
  { id: 'other', name: 'Something else', eyebrow: 'Reality Run', description: 'Use the slot-style simulation when your real game is not listed.', purpose: 'Practice stopping before one more becomes another.', symbols: ['/symbols/fu.svg','/symbols/sycee.svg','/symbols/cash-coin.svg'], tone: 'other' },
];

const prompts = [
  { id: 'money', label: 'What usually happens after “one more”?', detail: 'Reality Ping · tap to clear' },
  { id: 'chase', label: 'How much are you actually trying to get back?', detail: 'Reality Ping · tap to clear' },
  { id: 'exit', label: 'When do you usually realize you’ve gone too far?', detail: 'Reality Ping · tap to clear' },
  { id: 'one-more', label: 'What made you open this today?', detail: 'Reality Ping · tap to clear' },
];

const motif = [
  { kind: 'word', value: 'QUIT' }, { kind: 'icon', value: '/symbols/seven.svg' },
  { kind: 'icon', value: '/symbols/cherry.svg' }, { kind: 'icon', value: '/symbols/bar.svg' },
  { kind: 'icon', value: '/symbols/fu.svg' }, { kind: 'word', value: 'QUIT' },
  { kind: 'icon', value: '/symbols/cash-coin.svg' }, { kind: 'word', value: '★' },
  { kind: 'word', value: 'QUIT' }, { kind: 'icon', value: '/symbols/sycee.svg' },
  { kind: 'icon', value: '/symbols/roulette.svg' }, { kind: 'icon', value: '/symbols/cards.svg' },
  { kind: 'word', value: 'QUIT' }, { kind: 'word', value: '◆' },
  { kind: 'icon', value: '/symbols/scratch-ticket.svg' }, { kind: 'word', value: 'SPIN' },
];

function formatTime(seconds: number | null) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function PromptCard({
  prompt,
  hidden,
  dismissing,
  onDismiss,
  className = '',
}: {
  prompt: typeof prompts[number];
  hidden: boolean;
  dismissing: boolean;
  onDismiss: () => void;
  className?: string;
}) {
  if (hidden) return null;
  return (
    <button
      className={'home-prompt ' + className + (dismissing ? ' is-dismissing' : '')}
      type="button"
      onClick={onDismiss}
      aria-label={prompt.label + ' Dismiss'}
    >
      <span>{prompt.label}</span>
      <small>{prompt.detail}</small>
      <b className="prompt-close" aria-hidden="true">×</b>
    </button>
  );
}

export function Landing() {
  const [ready, setReady] = useState(false);
  const [runs, setRuns] = useState<ReturnType<typeof loadData>['runs']>([]);
  const [profile, setProfile] = useState<RealityProfile | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [hiddenPrompts, setHiddenPrompts] = useState<string[]>([]);
  const [dismissingPrompts, setDismissingPrompts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const data = loadData();
      setRuns(data.runs);
      setProfile(data.profile);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const kept = useMemo(() => totalMoneyKept(runs), [runs]);
  const recent = useMemo(() => recentExitAverageSeconds(runs), [runs]);
  const exitTrend = useMemo(() => {
    const voluntary = runs
      .filter(run => run.timeToExitSeconds != null)
      .slice(-3)
      .map(run => run.timeToExitSeconds as number);
    if (voluntary.length < 3) return null;
    const improving = voluntary[0] > voluntary[1] && voluntary[1] > voluntary[2];
    return improving ? voluntary : null;
  }, [runs]);
  const realityInsights = useMemo(() => buildRealityInsights(runs), [runs]);
  const returning = runs.length > 0;

  const dismissPrompt = (id: string) => {
    if (dismissingPrompts.includes(id)) return;
    setDismissingPrompts(current => [...current, id]);
    window.setTimeout(() => {
      setHiddenPrompts(current => [...current, id]);
      setDismissingPrompts(current => current.filter(item => item !== id));
    }, 230);
  };

  const promptProps = (id: string) => ({
    hidden: hiddenPrompts.includes(id),
    dismissing: dismissingPrompts.includes(id),
    onDismiss: () => dismissPrompt(id),
  });

  return (
    <main className="home-hub">
      <div className="home-atmosphere" aria-hidden="true">
        <div className="motif-field">
          {motif.concat(motif).map((item, index) => (
            <span className={'motif-item motif-' + (index % 8)} key={index}>
              {item.kind === 'icon'
                ? <Image src={item.value} alt="" width={58} height={58} />
                : item.value}
            </span>
          ))}
        </div>
        <div className="ambient-symbol ambient-seven"><Image src="/symbols/seven.svg" alt="" width={240} height={240} /></div>
        <div className="ambient-symbol ambient-coin"><Image src="/symbols/cash-coin.svg" alt="" width={260} height={260} /></div>
        <div className="ambient-symbol ambient-fu"><Image src="/symbols/fu.svg" alt="" width={220} height={220} /></div>
        <div className="ambient-symbol ambient-bar"><Image src="/symbols/bar.svg" alt="" width={250} height={250} /></div>
        <div className="home-glow home-glow-a" />
        <div className="home-glow home-glow-b" />
      </div>

      <aside className="hub-sidebar" aria-label="Spin Out navigation">
        <div className="sidebar-shine" aria-hidden="true" />
        <div className="hub-brand">
          <span className="hub-brand-mark">S</span>
          <div><strong>Spin Out</strong><small>Reality Run</small></div>
        </div>

        <nav className="hub-nav">
          <a className="is-active" href="#games"><span>01</span>Games</a>
          <button type="button" onClick={() => setContextOpen(true)}><span>02</span>My reality</button>
          <Link href="/plus"><span>03</span>Spin Out+</Link>
          <Link href="/research"><span>04</span>Research</Link>
          <Link href="/help"><span>05</span>Get help</Link>
        </nav>

        <div className="sidebar-summary">
          <p className="kicker">Your signal</p>
          {returning ? <>
            <strong>{formatMoney(kept)}</strong>
            <span>kept across {runs.length} {runs.length === 1 ? 'run' : 'runs'}</span>
            <div className="sidebar-stat"><span>Recent exit</span><b>{formatTime(recent)}</b></div>
            {exitTrend ? <div className="sidebar-exit-trend">
              <span>Your last 3</span>
              <div>{exitTrend.map((seconds, index) => <b key={index}>{formatTime(seconds)}</b>)}</div>
              <em>{"You're leaving sooner."}</em>
            </div> : null}
          </> : <>
            <strong>Run it here first.</strong>
            <span>Practice balance. Real-life context. Leave whenever you want.</span>
          </>}
        </div>

        {(realityInsights.recovery[0] || realityInsights.fingerprint[0]) ? <div className="sidebar-insight">
          <span>{realityInsights.recovery[0] ? 'Progress' : 'What keeps showing up'}</span>
          <strong>{(realityInsights.recovery[0] ?? realityInsights.fingerprint[0]).title}</strong>
          <p>{(realityInsights.recovery[0] ?? realityInsights.fingerprint[0]).detail}</p>
        </div> : null}

        <div className="sidebar-bottom">
          <JourneyCounter />
          <AccessStatus />
          <AuthControl />
        </div>
      </aside>

      <section className="hub-content">
        <header className="hub-mobile-head">
          <div className="hub-brand">
            <span className="hub-brand-mark">S</span>
            <div><strong>Spin Out</strong><small>Reality Run</small></div>
          </div>
          <div className="hub-mobile-actions">
            <button type="button" onClick={() => setContextOpen(true)}>My reality</button>
            <Link href="/help">Get help</Link>
          </div>
        </header>

        <section className="hub-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="kicker">Choose the game. Keep the money real.</p>
            <h1 id="home-title">{returning ? formatMoney(kept) + ' kept. Keep it.' : 'About to gamble?'}</h1>
            <p>{returning
              ? 'Pick what you were about to play. This run keeps watching for the decisions that make stopping harder.'
              : 'Pick the game you were about to open. Spin Out pays attention to how you play and calls out what usually keeps you going.'}</p>
            <div className="hero-actions">
              <a className="primary-cta" href="#games">Choose a game</a>
              <span>Practice only · no cash value</span>
            </div>
          </div>

          <div className="hero-machine" aria-hidden="true">
            <div className="hero-machine-top"><span>Reality Run</span><b>Live practice</b></div>
            <div className="hero-reel-window">
              <div><Image src="/symbols/seven.svg" alt="" width={84} height={84} /></div>
              <div><Image src="/symbols/cherry.svg" alt="" width={84} height={84} /></div>
              <div><Image src="/symbols/gem.svg" alt="" width={84} height={84} /></div>
            </div>
            <div className="hero-machine-bottom">
              <span>Balance</span>
              <strong>{returning ? formatMoney(Math.max(kept, 0)) : '$100'}</strong>
              <i>QUIT stays in view.</i>
            </div>
          </div>

          <PromptCard prompt={prompts[0]} {...promptProps('money')} className="prompt-hero" />
        </section>

        <section className="games-stage" id="games">
          <div className="games-heading">
            <div>
              <p className="kicker">Reality Runs</p>
              <h2>What were you about to play?</h2>
            </div>
            <p>Each simulation is built to catch a different part of the pull. Pick the one you were about to open.</p>
          </div>

          <div className="games-top-prompt">
            <PromptCard prompt={prompts[1]} {...promptProps('chase')} />
          </div>

          <div className="home-game-grid">
            {games.slice(0, 3).map((game, index) => (
              <Link className={'home-game-card game-' + game.tone} href={'/play?game=' + game.id} key={game.id}>
                <div className="game-card-glow" aria-hidden="true" />
                <div className="game-card-top"><span>{game.eyebrow}</span><b>0{index + 1}</b></div>
                <div className="game-symbols" aria-hidden="true">
                  {game.symbols.map((symbol, symbolIndex) => <Image src={symbol} alt="" width={64} height={64} key={symbolIndex} />)}
                </div>
                <div className="game-card-copy"><h3>{game.name}</h3><p>{game.description}</p><small className="game-purpose">{game.purpose}</small></div>
                <div className="game-enter"><span>Enter Reality Run</span><b>↗</b></div>
              </Link>
            ))}
          </div>

          <div className="games-mid-prompt">
            <PromptCard prompt={prompts[2]} {...promptProps('exit')} className="prompt-grid" />
          </div>

          <div className="home-game-grid home-game-grid-second">
            {games.slice(3).map((game, index) => (
              <Link className={'home-game-card game-' + game.tone} href={'/play?game=' + game.id} key={game.id}>
                <div className="game-card-glow" aria-hidden="true" />
                <div className="game-card-top"><span>{game.eyebrow}</span><b>0{index + 4}</b></div>
                <div className="game-symbols" aria-hidden="true">
                  {game.symbols.map((symbol, symbolIndex) => <Image src={symbol} alt="" width={64} height={64} key={symbolIndex} />)}
                </div>
                <div className="game-card-copy"><h3>{game.name}</h3><p>{game.description}</p><small className="game-purpose">{game.purpose}</small></div>
                <div className="game-enter"><span>Enter Reality Run</span><b>↗</b></div>
              </Link>
            ))}
          </div>

          <div className="games-bottom-row">
            <PromptCard prompt={prompts[3]} {...promptProps('one-more')} className="prompt-bottom" />
            <div className="home-safety-note"><span>SIMULATION ONLY</span><p>No deposits. No prizes. No redeemable balance.</p></div>
          </div>
        </section>

        <footer className="hub-footer">
          <span>Spin Out · private by default</span>
          <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/research">Research</Link></div>
        </footer>

        {!ready ? <span className="sr-only">Loading</span> : null}
      </section>

      {contextOpen ? <RealityContextPanel
        profile={profile}
        onClose={() => setContextOpen(false)}
        onSaved={next => setProfile(next)}
      /> : null}
    </main>
  );
}
