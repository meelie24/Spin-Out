'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RevenueCatCheckout } from './RevenueCatCheckout';
import { createBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';

type AccessPayload = {
  active?: boolean;
  paid?: boolean;
  source?: 'paid' | 'trial' | 'core' | 'signed-out';
  managementUrl?: string | null;
  trial?: { eligible?: boolean; active?: boolean; endsAt?: string | null };
};

export function PlusPanel({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');
  const [message, setMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [access, setAccess] = useState<AccessPayload | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!supabaseConfigured()) { if (!cancelled) setChecked(true); return; }
      const supabase = createBrowserSupabase();
      if (!supabase) { if (!cancelled) setChecked(true); return; }
      const { data } = await supabase.auth.getUser();
      if (!data.user) { if (!cancelled) setChecked(true); return; }

      const response = await fetch('/api/entitlement', { cache: 'no-store' }).catch(() => null);
      const payload = response ? await response.json().catch(() => null) as AccessPayload | null : null;
      if (!cancelled) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
        setAccess(payload);
        setChecked(true);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const node = dialog.current;
    node?.querySelector<HTMLElement>('button,a[href]')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab' || !node) return;
      const focusable = [...node.querySelectorAll<HTMLElement>('button,a[href]')].filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const paid = access?.paid === true;
  const trial = access?.source === 'trial';
  const eligible = access?.trial?.eligible === true;

  const panel = <div className="modal-backdrop plus-backdrop" role="presentation" onMouseDown={onClose}>
    <section ref={dialog} className="glass-dialog plus-dialog" role="dialog" aria-modal="true" aria-labelledby="plus-title" onMouseDown={e => e.stopPropagation()}>
      <p className="kicker">Spin Out+</p>
      <h2 id="plus-title">Full history and trends.</h2>
      <p className="provider-note">Plus adds cross-device history, long-term Money Kept and exit-time trends, weekly readouts, and deeper personalization.</p>

      {!checked ? <p className="provider-note">Checking access…</p> : null}

      {checked && !user ? <>
        <p className="provider-state">Sign in to claim the one-run Plus trial or subscribe.</p>
        <Link className="primary-button" href="/" onClick={onClose}>Go to sign in</Link>
      </> : null}

      {checked && user && trial && !showCheckout ? <>
        <p className="provider-state">Your first Reality Run is using the full Plus feature set.</p>
        <div className="plus-live-actions">
          <Link className="primary-button" href="/plus" onClick={onClose}>Open Plus</Link>
          <button className="soft-button" type="button" onClick={() => setShowCheckout(true)}>Keep Plus after this run</button>
        </div>
      </> : null}

      {checked && user && paid ? <>
        <p className="provider-state">Spin Out+ is active.</p>
        <div className="plus-live-actions">
          <Link className="primary-button" href="/plus" onClick={onClose}>Open Plus</Link>
          {access?.managementUrl ? <a className="soft-button" href={access.managementUrl} target="_blank" rel="noreferrer">Manage subscription</a> : null}
        </div>
      </> : null}

      {checked && user && !paid && (!trial || showCheckout) ? <>
        {eligible && !trial ? <p className="provider-state">Your first Reality Run includes the full Plus feature set automatically. A subscription keeps Plus after that run.</p> : null}
        <div className="plus-prices" role="radiogroup" aria-label="Spin Out Plus plan">
          <button type="button" role="radio" aria-checked={selected === 'monthly'} className={selected === 'monthly' ? 'is-selected' : ''} onClick={() => { setSelected('monthly'); setMessage(null); }}>
            <strong>$4.99</strong><span>month</span>
          </button>
          <button type="button" role="radio" aria-checked={selected === 'yearly'} className={selected === 'yearly' ? 'is-selected' : ''} onClick={() => { setSelected('yearly'); setMessage(null); }}>
            <strong>$29.99</strong><span>year</span><em>Save 50%</em>
          </button>
        </div>
        <ul>
          <li>Full Reality Run history across devices</li>
          <li>Money Kept and time-to-exit trends</li>
          <li>Trigger and Reality Ping patterns</li>
          <li>Weekly readouts and deeper personalization</li>
        </ul>
        {message ? <p className="billing-message" role="status">{message}</p> : null}
        <RevenueCatCheckout
          userId={user.id}
          email={user.email}
          plan={selected}
          onApproved={() => {
            setMessage('Spin Out+ is active.');
            setAccess(current => ({ ...current, active: true, paid: true, source: 'paid' }));
            setShowCheckout(false);
            window.dispatchEvent(new Event('spinout:access-changed'));
          }}
          onError={text => setMessage(text || null)}
        />
      </> : null}

      <button className="bare-link plus-close" type="button" onClick={onClose}>Close</button>
    </section>
  </div>;

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null;
}
