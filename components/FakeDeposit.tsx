'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { formatMoney } from '@/lib/engine';
import { spinAudio } from '@/lib/audio';
import type { RealityProfile, SessionLimit } from '@/lib/types';

function obligationLabel(profile: RealityProfile) {
  if (profile.obligationType === 'none') return null;
  if (profile.obligationType === 'car') return 'Car';
  if (profile.obligationType === 'rent') return 'Rent';
  return profile.obligationType.replace('-', ' ');
}

const limitChoices: Array<{ label:string; limit:SessionLimit }> = [
  { label:'5 rounds', limit:{ rounds:5, minutes:null } },
  { label:'10 rounds', limit:{ rounds:10, minutes:null } },
  { label:'5 min', limit:{ rounds:null, minutes:5 } },
  { label:'10 min', limit:{ rounds:null, minutes:10 } },
  { label:'No limit', limit:{ rounds:null, minutes:null } },
];

export function FakeDeposit({
  profile,
  onComplete,
}: {
  profile: RealityProfile;
  onComplete: (limit: SessionLimit) => void;
}) {
  const amountRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const committing = useRef(false);
  const [limit, setLimit] = useState<SessionLimit>({ rounds:null, minutes:null });
  const [limitChosen, setLimitChosen] = useState(false);
  const obligation = obligationLabel(profile);

  const commit = () => {
    if (committing.current) return;
    committing.current = true;
    spinAudio.click();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !amountRef.current || !trayRef.current) {
      onComplete(limit);
      return;
    }

    const amount = amountRef.current;
    const tray = trayRef.current;
    const a = amount.getBoundingClientRect();
    const b = tray.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);

    gsap.timeline({ onComplete: () => onComplete(limit) })
      .to(amount, { scale: .96, duration: .11, ease: 'power2.out' })
      .to(amount, { x: dx, y: dy, scale: .38, opacity: .12, duration: .36, ease: 'power3.in' })
      .to(tray, { boxShadow: '0 0 0 1px rgba(232,198,137,.85), 0 0 54px rgba(232,198,137,.22)', duration: .18 }, '<.16');
  };

  const selected = (choice: SessionLimit) =>
    limitChosen && choice.rounds === limit.rounds && choice.minutes === limit.minutes;

  return (
    <main className="deposit-shell">
      <section className="deposit-terminal">
        <p className="kicker">Reality Run</p>
        <div className="deposit-amount" ref={amountRef}>{formatMoney(profile.intendedWagerCents)}</div>
        {obligation && profile.obligationAmountCents ? (
          <div className="deposit-context">
            <span>{obligation}</span>
            <strong>{formatMoney(profile.obligationAmountCents)}</strong>
          </div>
        ) : null}

        <div className="pre-run-limit">
          <span>Before you start</span>
          <strong>Set a stopping point if you want one.</strong>
          <div className="limit-choices" role="group" aria-label="Reality Run stopping point">
            {limitChoices.map(choice => (
              <button
                key={choice.label}
                type="button"
                className={selected(choice.limit) ? 'is-on' : ''}
                onClick={() => {
                  spinAudio.click();
                  setLimit(choice.limit);
                  setLimitChosen(true);
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>

        <div className="deposit-tray" ref={trayRef}>
          <span>Balance</span>
          <strong>{formatMoney(profile.intendedWagerCents)}</strong>
        </div>
        <button type="button" className="deposit-button" onClick={commit}>
          Load {formatMoney(profile.intendedWagerCents)}
        </button>
        <p className="deposit-note">Simulation. No payment details.</p>
      </section>
    </main>
  );
}
