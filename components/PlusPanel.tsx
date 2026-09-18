'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PayPalSubscription } from './PayPalSubscription';
import { createBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';

export function PlusPanel({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');
  const [message, setMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [active, setActive] = useState(false);
  const dialog = useRef<HTMLElement>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
  const monthlyPlan = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID ?? '';
  const yearlyPlan = process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID ?? '';
  const billingConfigured = Boolean(clientId && monthlyPlan && yearlyPlan);
  const backendConfigured = supabaseConfigured();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!backendConfigured) { setChecked(true); return; }
      const supabase = createBrowserSupabase();
      if (!supabase) { setChecked(true); return; }
      const { data } = await supabase.auth.getUser();
      const hasUser = Boolean(data.user);
      if (!cancelled) setSignedIn(hasUser);
      if (hasUser) {
        const response = await fetch('/api/entitlement', { cache: 'no-store' }).catch(() => null);
        const payload = response ? await response.json().catch(() => ({})) as { active?: boolean } : {};
        if (!cancelled) setActive(payload.active === true);
      }
      if (!cancelled) setChecked(true);
    };
    void load();
    return () => { cancelled = true; };
  }, [backendConfigured]);

  useEffect(() => {
    const node = dialog.current;
    const first = node?.querySelector<HTMLElement>('button,a[href]');
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab' || !node) return;
      const focusable = [...node.querySelectorAll<HTMLElement>('button,a[href]')].filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) { event.preventDefault(); lastEl.focus(); }
      else if (!event.shiftKey && document.activeElement === lastEl) { event.preventDefault(); firstEl.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const approved = useCallback(() => {
    setMessage(null);
    setActive(true);
  }, []);

  const checkoutError = useCallback((text: string) => setMessage(text), []);
  const planId = selected === 'monthly' ? monthlyPlan : yearlyPlan;

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section ref={dialog} className="glass-dialog plus-dialog" role="dialog" aria-modal="true" aria-labelledby="plus-title" onMouseDown={e => e.stopPropagation()}>
      <p className="kicker">Spin Out+</p>
      <h2 id="plus-title">Keep the history that matters.</h2>
      <p className="provider-note">Reality Runs stay free. Plus adds full history, Money Kept trends, time-to-exit trends and weekly readouts.</p>

      {!checked ? <p className="provider-note">Checking access…</p> : null}

      {checked && !signedIn ? <>
        <p className="provider-state">Sign in before subscribing so access stays tied to your account.</p>
        <Link className="primary-button" href="/" onClick={onClose}>Go to sign in</Link>
      </> : null}

      {checked && signedIn && !active ? <>
        <div className="plus-prices" role="radiogroup" aria-label="Spin Out Plus plan">
          <button type="button" role="radio" aria-checked={selected === 'monthly'} className={selected === 'monthly' ? 'is-selected' : ''} onClick={() => { setSelected('monthly'); setMessage(null); }}>
            <strong>$4.99</strong><span>month</span>
          </button>
          <button type="button" role="radio" aria-checked={selected === 'yearly'} className={selected === 'yearly' ? 'is-selected' : ''} onClick={() => { setSelected('yearly'); setMessage(null); }}>
            <strong>$29.99</strong><span>year</span><em>Save 50%</em>
          </button>
        </div>
        <ul><li>Full Reality Run history</li><li>Money Kept trends</li><li>Time-to-exit trends</li><li>Weekly readouts</li></ul>
        {message ? <p className="billing-message" role="status">{message}</p> : null}
        {billingConfigured ? <PayPalSubscription clientId={clientId} planId={planId} plan={selected} onApproved={approved} onError={checkoutError} /> : <p className="provider-note">Checkout is unavailable until the merchant account is connected.</p>}
      </> : null}

      {checked && signedIn && active ? <>
        <p className="provider-state">Spin Out+ is active.</p>
        <div className="plus-live-actions">
          <Link className="primary-button" href="/plus" onClick={onClose}>Open Plus</Link>
          <a className="soft-button" href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noreferrer">Manage subscription</a>
        </div>
      </> : null}

      <button className="bare-link plus-close" type="button" onClick={onClose}>Close</button>
    </section>
  </div>;
}
