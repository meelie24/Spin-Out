'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { formatMoney } from '@/lib/engine';
import { spinAudio } from '@/lib/audio';

export function FakeDeposit({ amountCents, onComplete }: { amountCents: number; onComplete: () => void }) {
  const amountRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const committing = useRef(false);

  const commit = () => {
    if (committing.current) return;
    committing.current = true;
    spinAudio.click();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !amountRef.current || !trayRef.current) { onComplete(); return; }
    const amount = amountRef.current;
    const tray = trayRef.current;
    const a = amount.getBoundingClientRect();
    const b = tray.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    gsap.timeline({ onComplete })
      .to(amount, { scale: .96, duration: .12, ease: 'power2.out' })
      .to(amount, { x: dx, y: dy, scale: .42, opacity: .25, duration: .42, ease: 'power3.in' })
      .to(tray, { boxShadow: '0 0 0 1px rgba(232,198,137,.85), 0 0 48px rgba(232,198,137,.22)', duration: .18 }, '<.20');
  };

  return (
    <main className="deposit-shell">
      <section className="deposit-terminal">
        <p className="kicker">Practice deposit</p>
        <h1>Load the amount you were about to risk.</h1>
        <div className="deposit-amount" ref={amountRef}>{formatMoney(amountCents)}</div>
        <div className="deposit-tray" ref={trayRef}><span>Reality Run balance</span><strong>{formatMoney(amountCents)}</strong></div>
        <button type="button" className="deposit-button" onClick={commit}>Deposit {formatMoney(amountCents)}</button>
        <p className="deposit-note">No card. No bank. No real money moves.</p>
      </section>
    </main>
  );
}
