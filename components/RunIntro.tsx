'use client';

import { useEffect, useRef, useState } from 'react';
import { RealityGame } from './RealityGame';
import { formatMoney, stakeOptionsFor } from '@/lib/engine';
import type { RealityProfile } from '@/lib/types';

export function RunIntro({
  profile,
  onStart,
}: {
  profile: RealityProfile;
  onStart: () => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const stake = stakeOptionsFor(profile.intendedWagerCents)[1];

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(Boolean(media?.matches));
    sync();
    media?.addEventListener?.('change', sync);
    const timer = window.setTimeout(() => startButton.current?.focus(), 80);
    return () => {
      window.clearTimeout(timer);
      media?.removeEventListener?.('change', sync);
    };
  }, []);

  return (
    <main className="run-shell run-intro">
      <section className="run-card run-intro-preview" aria-label="Reality Run preview" aria-hidden="true">
        <div className="run-hud">
          <div><span>Balance</span><strong>{formatMoney(profile.intendedWagerCents)}</strong></div>
          <div><span>Stake</span><strong>{formatMoney(stake)}</strong></div>
          <div><span>Plays</span><strong>0</strong></div>
          <div className="run-access"><span>Access</span><strong>Ready</strong></div>
          <button type="button" className="sound-button" tabIndex={-1}>Sound on</button>
        </div>

        <div className="casino-frame">
          <div className="bulbs bulbs-top" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>
          <div className="bulbs bulbs-left" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</div>
          <div className="bulbs bulbs-right" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</div>
          <RealityGame
            gameType={profile.gamblingType}
            reducedMotion={reducedMotion}
            initialBalanceCents={profile.intendedWagerCents}
          />
          <button type="button" className="cashout-button" tabIndex={-1}>{"I'm done"}</button>
        </div>

        <div className="run-controls">
          <div className="stake-control" aria-hidden="true">
            <button type="button" tabIndex={-1}>−</button>
            <span><small>Practice stake</small>{formatMoney(stake)}</span>
            <button type="button" tabIndex={-1}>+</button>
          </div>
          <button type="button" className="game-action" tabIndex={-1}>
            {profile.gamblingType === 'sports' ? 'Place bet' : profile.gamblingType === 'lottery' ? 'Scratch' : profile.gamblingType === 'poker' ? 'Deal' : 'Spin'}
          </button>
        </div>
      </section>

      <div className="run-intro-scrim" aria-hidden="true" />
      <section className="run-intro-dialog" role="dialog" aria-modal="true" aria-labelledby="run-intro-title">
        <span className="run-intro-glint" aria-hidden="true" />
        <p className="run-intro-kicker">Reality Run</p>
        <h1 id="run-intro-title">That’s enough to start.</h1>
        <p className="intro-copy-desktop">
          The rest of your setup will stay beside the game. Answer these whenever you want throughout the gameplay. The more context you add, the more immersive your experience will be.
        </p>
        <p className="intro-copy-mobile">
          The rest of your setup will stay with you while you play. Answer these whenever you want. The more context you add, the more immersive your experience will be.
        </p>
        <button ref={startButton} type="button" className="run-intro-start" onClick={onStart}>Start Reality Run</button>
      </section>
    </main>
  );
}
