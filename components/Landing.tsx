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

const games: Array<{
  id: GamblingType;
  name: string;
  eyebrow: string;
  description: string;
  symbols: string[];
  tone: string;
}> = [
  { id: 'slots', name: 'Slots', eyebrow: 'Spin', description: 'Reels, stakes and the urge to press it again.', symbols: ['/symbols/seven.svg','/symbols/cherry.svg','/symbols/gem.svg'], tone: 'slots' },
  { id: 'sports', name: 'Sports', eyebrow: 'Bet slip', description: 'Odds, picks and the pull to chase the result.', symbols: ['/symbols/bell.svg','/symbols/gem.svg','/symbols/seven.svg'], tone: 'sports' },
  { id: 'casino', name: 'Casino', eyebrow: 'Table', description: 'A polished table run built around live decisions.', symbols: ['/symbols/gem.svg','/symbols/seven.svg','/symbols/plum.svg'], tone: 'casino' },
  { id: 'poker', name: 'Poker', eyebrow: 'Cards', description: 'Pressure, reads and the temptation to stay seated.', symbols: ['/symbols/plum.svg','/symbols/gem.svg','/symbols/bell.svg'], tone: 'poker' },
  { id: 'lottery', name: 'Lottery', eyebrow: 'Scratch', description: 'Fast chances, near misses and one-more energy.', symbols: ['/symbols/lemon.svg','/symbols/cherry.svg','/symbols/seven.svg'], tone: 'lottery' },
  { id: 'other', name: 'Something else', eyebrow: 'Your game', description: 'Start a Reality Run and set the game yourself.', symbols: ['/symbols/cherry.svg','/symbols/bell.svg','/symbols/lemon.svg'], tone: 'other' },
];

const prompts = [
  { id: 'money', label: 'That money already has a job.', detail: 'Tap to clear' },
  { id: 'chase', label: 'If it goes, what replaces it?', detail: 'Tap to clear' },
  { id: 'exit', label: 'You can leave before it starts.', detail: 'Tap to clear' },
  { id: 'one-more', label: '“One more” is still another decision.', detail: 'Tap to clear' },
];

const motif = [
  { kind: 'word', value: 'QUIT' }, { kind: 'icon', value: '/symbols/seven.svg' },
  { kind: 'icon', value: '/symbols/cherry.svg' }, { kind: 'word', value: 'BAR' },
  { kind: 'icon', value: '/symbols/gem.svg' }, { kind: 'word', value: 'QUIT' },
  { kind: 'icon', value: '/symbols/bell.svg' }, { kind: 'word', value: '★' },
  { kind: 'word', value: 'QUIT' }, { kind: 'icon', value: '/symbols/lemon.svg' },
  { kind: 'word', value: '7' }, { kind: 'icon', value: '/symbols/plum.svg' },
  { kind: 'word', value: 'QUIT' }, { kind: 'word', value: '◆' },
  { kind: 'icon', value: '/symbols/cherry.svg' }, { kind: 'word', value: 'SPIN' },
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
    </button>
  );
}

export function Landing() {
  const [ready, setReady] = useState(false);
  const [runs, setRuns] = useState<ReturnType<typeof loadData>['runs']>([]);
  const [hiddenPrompts, setHiddenPrompts] = useState<string[]>([]);
  const [dismissingPrompts, setDismissingPrompts] = useState<string[]>([]);

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
          <Link href="/plus"><span>02</span>Spin Out+</Link>
          <Link href="/research"><span>03</span>Research</Link>
          <Link href="/help"><span>04</span>Get help</Link>
        </nav>

        <div className="sidebar-summary">
          <p className="kicker">Your signal</p>
          {returning ? <>
            <strong>{formatMoney(kept)}</strong>
            <span>kept across {runs.length} {runs.length === 1 ? 'run' : 'runs'}</span>
            <div className="sidebar-stat"><span>Recent exit</span><b>{formatTime(recent)}</b></div>
          </> : <>
            <strong>Run it here first.</strong>
            <span>Practice balance. Real-life context. Leave whenever you want.</span>
          </>}
        </div>

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
          <Link href="/help">Get help</Link>
        </header>

        <section className="hub-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="kicker">Choose the game. Keep the money real.</p>
            <h1 id="home-title">{returning ? formatMoney(kept) + ' kept. Keep it.' : 'About to gamble?'}</h1>
            <p>{returning
              ? 'Pick what you were about to play. Your Reality Run starts with the life around that money.'
              : 'Pick the game you were about to open. Run the pull here first, with your real situation still in the room.'}</p>
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
            <p>Choose it here. We’ll use that choice in setup and take you straight toward the matching run.</p>
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
                <div className="game-card-copy"><h3>{game.name}</h3><p>{game.description}</p></div>
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
                <div className="game-card-copy"><h3>{game.name}</h3><p>{game.description}</p></div>
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
    </main>
  );
}
