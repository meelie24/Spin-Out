'use client';

import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';

export function AuthControl() {
  const configured = supabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const dialog = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [configured]);

  const closeDialog = () => {
    trigger.current?.focus();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const first = node?.querySelector<HTMLElement>('input,button,a[href]');
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const focusable = [...node.querySelectorAll<HTMLElement>('input,button,a[href]')].filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) { event.preventDefault(); lastEl.focus(); }
      else if (!event.shiftKey && document.activeElement === lastEl) { event.preventDefault(); firstEl.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!configured) return null;

  const signIn = async () => {
    const supabase = createBrowserSupabase();
    if (!supabase || !email.includes('@')) return;
    setStatus('Sending…');
    const redirectTo = window.location.origin + '/auth/callback';
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setStatus(error ? 'Couldn’t send the sign-in link.' : 'Check your email for the sign-in link.');
  };

  const signOut = async () => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return <button className="bare-link" type="button" onClick={signOut}>Sign out</button>;
  }

  return <>
    <button ref={trigger} className="bare-link" type="button" onClick={() => { setStatus(null); setOpen(true); }}>Sign in</button>
    {open ? <div className="modal-backdrop" role="presentation" onMouseDown={closeDialog}>
      <section ref={dialog} className="glass-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={e => e.stopPropagation()}>
        <p className="kicker">Account</p>
        <h2 id="auth-title">Sign in</h2>
        <p>We’ll email you a secure sign-in link.</p>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com"/></label>
        {status ? <p role="status" className="provider-note">{status}</p> : null}
        <div className="modal-actions">
          <button className="soft-button" type="button" onClick={closeDialog}>Cancel</button>
          <button className="primary-button" type="button" disabled={!email.includes('@')} onClick={signIn}>Send me the link</button>
        </div>
      </section>
    </div> : null}
  </>;
}
