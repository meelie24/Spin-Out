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
import { buildPaydayShield, type PaydayShieldCard as PaydayShieldData } from '@/lib/realityEngine/payday';
import { PaydayShieldCard } from './PaydayShieldCard';
import { GameTileArt } from './GameTileArt';
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

const HOME_PROMPT_SESSION_KEY = 'spinout.home-prompts.v1';

const prompts = [
  { id: 'money', label: 'What usually happens after “one more”?', detail: 'Reality Ping · tap to clear' },
  { id: 'chase', label: 'How much are you actually trying to get back?', detail: 'Reality Ping · tap to clear' },
  { id: 'exit', label: 'When do you usually realize you’ve gone too far?', detail: 'Reality Ping · tap to clear' },
  { id: 'one-more', label: 'What made you open this today?', detail: 'Reality Ping · tap to clear' },
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
      className={'lobby-prompt ' + className + (dismissing ? ' is-dismissing' : '')}
      type="button"
      onClick={onDismiss}
      aria-label={prompt.label + ' Dismiss'}
    >
      <span data-type-role="intervention">{prompt.label}</span>
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
  const [paydayShield, setPaydayShield] = useState<PaydayShieldData | null>(null);
  const [hiddenPrompts, setHiddenPrompts] = useState<string[]>([]);
  const [dismissingPrompts, setDismissingPrompts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const data = loadData();
      setRuns(data.runs);
      setProfile(data.profile);
      setPaydayShield(data.profile ? buildPaydayShield(data.profile, new Date()) : null);
      try {
        const stored = JSON.parse(window.sessionStorage.getItem(HOME_PROMPT_SESSION_KEY) ?? '[]') as unknown;
        if (Array.isArray(stored)) {
          setHiddenPrompts(stored.filter((value): value is string => typeof value === 'string'));
        }
      } catch {
        // A blocked/corrupt session store should never block the homepage.
      }
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
      setHiddenPrompts(current => {
        const next = current.includes(id) ? current : [...current, id];
        try {
          window.sessionStorage.setItem(HOME_PROMPT_SESSION_KEY, JSON.stringify(next));
        } catch {
          // Session-only prompt memory is progressive enhancement.
        }
        return next;
      });
      setDismissingPrompts(current => current.filter(item => item !== id));
    }, 230);
  };

  const promptProps = (id: string) => ({
    hidden: !ready || hiddenPrompts.includes(id),
    dismissing: dismissingPrompts.includes(id),
    onDismiss: () => dismissPrompt(id),
  });

  return (
    <main className="casino-home">
      <a className="lobby-skip" href="#games">Skip to games</a>
      <header className="lobby-topbar">
        <Link href="/" className="lobby-brand" aria-label="Spin Out home">
          <span className="lobby-brand-mark" aria-hidden="true">S</span>
          <strong>Spin Out</strong>
        </Link>
        <span className="lobby-mode">Reality Runs <span>Simulation only</span></span>
        <div className="lobby-account"><AccessStatus />{ready ? <AuthControl /> : null}<Link href="/plus">Spin Out+</Link></div>
      </header>

      <aside className="lobby-sidebar" data-material="casino-rail" aria-label="Spin Out navigation">
        <p className="lobby-label">Your space</p>
        <nav className="lobby-nav">
          <a className="is-active" data-nav-state="active" href="#games"><span>01</span>Games</a>
          <button type="button" disabled={!ready} onClick={() => setContextOpen(true)}><span>02</span>My reality</button>
          <Link href="/plus"><span>03</span>Spin Out+</Link>
          <Link href="/research"><span>04</span>Research</Link>
          <Link href="/help"><span>05</span>Get help</Link>
        </nav>
        <div className="lobby-sidebar-games">
          <p className="lobby-label">Reality Runs</p>
          {games.map(game => <Link key={game.id} href={'/play?game=' + game.id}>
            <Image src={game.symbols[0]} alt="" width={22} height={22} /><span>{game.name}</span>
          </Link>)}
        </div>
        <div className="lobby-sidebar-foot"><span>Practice only</span><p>No deposits. No prizes.<br />No redeemable balance.</p><JourneyCounter /></div>
      </aside>

      <section className="lobby-content" aria-label="Choose your Reality Run">
        <nav className="lobby-mobile-nav" aria-label="Your space">
          <a href="#games" aria-current="page">Games</a>
          <button type="button" disabled={!ready} onClick={() => setContextOpen(true)}>My reality</button>
          <Link href="/research">Research</Link><Link href="/help">Get help</Link>
        </nav>
        <section className="lobby-hero" aria-labelledby="home-title">
          <div className="lobby-hero-copy">
            <p className="lobby-label">Choose the game. Keep the money real.</p>
            <h1 id="home-title" data-type-role="display">{returning ? formatMoney(kept) + ' kept. Keep it.' : 'About to gamble?'}</h1>
            <p>{returning
              ? 'Pick what you were about to play. This run keeps watching for the decisions that make stopping harder.'
              : 'Pick the game you were about to open. Spin Out pays attention to how you play and calls out what usually keeps you going.'}</p>
            <div className="lobby-hero-actions"><a href="#games">Choose a game <span aria-hidden="true">↗</span></a><span>Practice only · no cash value</span></div>
            <nav className="mobile-game-quickpick" aria-label="Choose a game">
              {games.map(game => <Link className="lobby-quick-game" href={'/play?game=' + game.id} key={'quick-' + game.id}>
                <Image src={game.symbols[0]} alt="" width={28} height={28} /><span>{game.name}</span>
              </Link>)}
            </nav>
          </div>
          <div className="lobby-hero-art" aria-hidden="true"><Image src="/game-art/slots-scene.webp" alt="" fill priority sizes="(max-width: 700px) 100vw, 50vw" /></div>
        </section>

        <div className="lobby-features">
          <button className="lobby-feature feature-reality" type="button" disabled={!ready} onClick={() => setContextOpen(true)}>
            <Image src="/game-art/casino-scene.webp" alt="" fill sizes="(max-width: 700px) 100vw, 25vw" />
            <span><small>Your context</small><strong>My reality</strong><b>Review <i aria-hidden="true">↗</i></b></span>
          </button>
          <Link className="lobby-feature feature-plus" href="/plus">
            <Image src="/game-art/other-scene.webp" alt="" fill sizes="(max-width: 700px) 100vw, 25vw" />
            <span><small>Go further</small><strong>Spin Out+</strong><b>Explore <i aria-hidden="true">↗</i></b></span>
          </Link>
          <Link className="lobby-feature feature-research" href="/research">
            <Image src="/game-art/poker-scene.webp" alt="" fill sizes="(max-width: 700px) 100vw, 25vw" />
            <span><small>Behind the run</small><strong>The research</strong><b>Read <i aria-hidden="true">↗</i></b></span>
          </Link>
        </div>

        {paydayShield ? <div className="lobby-payday"><PaydayShieldCard card={paydayShield} onReview={() => setContextOpen(true)} onDismiss={() => setPaydayShield(null)} /></div> : null}

        <section className="lobby-games" id="games" tabIndex={-1} aria-labelledby="games-title">
          <div className="lobby-section-heading"><h2 id="games-title">What were you about to play?</h2><span>6 Reality Runs</span></div>
          <div className="lobby-game-grid">
            {games.map((game, index) => <Link className={'lobby-game game-' + game.tone} data-game-layout="poster" href={'/play?game=' + game.id} key={game.id}>
              <GameTileArt game={game.id} sizes="(max-width: 700px) 45vw, (max-width: 1000px) 25vw, 15vw" />
              <span className="lobby-game-number" aria-hidden="true">0{index + 1}</span>
              <div className="lobby-game-meta"><span>{game.eyebrow}</span><h3 data-type-role="game-title">{game.name}</h3><p>{game.description}</p><small className="sr-only">{game.purpose}</small></div>
              <div className="lobby-game-enter"><span>Enter Reality Run</span><b aria-hidden="true">↗</b></div>
            </Link>)}
          </div>
        </section>

        <section className="lobby-how" aria-labelledby="how-title">
          <div className="lobby-section-heading"><h2 id="how-title">Run it here first.</h2><Link href="/help">Get help <span aria-hidden="true">↗</span></Link></div>
          <div className="lobby-how-grid"><div><b>01</b><span><strong>Pick your game</strong><p>The game you were about to open.</p></span></div><div><b>02</b><span><strong>Make it personal</strong><p>Bring your real-life context into the run.</p></span></div><div><b>03</b><span><strong>Leave when you choose</strong><p>Your practice balance has no cash value.</p></span></div></div>
          <p className="lobby-safety-note">Simulation only. No deposits. No prizes. No redeemable balance.</p>
        </section>

        <footer className="lobby-footer"><span>Spin Out · private by default</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/research">Research</Link></div></footer>
        {!ready ? <span className="sr-only">Loading</span> : null}
      </section>

      <aside className="lobby-reality" aria-label="Reality check">
        <div className="lobby-reality-heading"><h2>Reality check</h2><span>Private</span></div>
        <div className="lobby-prompt-list">
          <PromptCard prompt={prompts[0]} {...promptProps('money')} />
          <PromptCard prompt={prompts[1]} {...promptProps('chase')} className="lobby-secondary-prompt" />
          <PromptCard prompt={prompts[3]} {...promptProps('one-more')} className="lobby-secondary-prompt" />
        </div>
        <div className="lobby-signal">
          <p className="lobby-label">Your signal</p>
          {returning ? <><strong>{formatMoney(kept)}</strong><p>kept across {runs.length} {runs.length === 1 ? 'run' : 'runs'}</p><div className="lobby-stat"><span>Recent exit</span><b>{formatTime(recent)}</b></div>{exitTrend ? <div className="sidebar-exit-trend"><span>Your last 3</span><div>{exitTrend.map((seconds, index) => <b key={index}>{formatTime(seconds)}</b>)}</div><em>{"You're leaving sooner."}</em></div> : null}</> : <><strong>Run it here first.</strong><p>Practice balance. Real-life context. Leave whenever you want.</p></>}
        </div>
        {(realityInsights.recovery[0] || realityInsights.fingerprint[0]) ? <div className="lobby-insight"><span>{realityInsights.recovery[0] ? 'Progress' : 'What keeps showing up'}</span><strong>{(realityInsights.recovery[0] ?? realityInsights.fingerprint[0]).title}</strong><p>{(realityInsights.recovery[0] ?? realityInsights.fingerprint[0]).detail}</p></div> : null}
        <button className="lobby-context-link" type="button" disabled={!ready} onClick={() => setContextOpen(true)}>Review my reality <span aria-hidden="true">↗</span></button>
      </aside>

      {contextOpen ? <div className="reference-locked"><RealityContextPanel profile={profile} onClose={() => setContextOpen(false)} onSaved={next => { setProfile(next); setPaydayShield(buildPaydayShield(next, new Date())); }} /></div> : null}
    </main>
  );
}
