'use client';

import { useEffect, useState } from 'react';

type AccessPayload = {
  authenticated?: boolean;
  paid?: boolean;
  source?: 'paid' | 'trial' | 'core' | 'signed-out';
  trial?: { eligible?: boolean; active?: boolean; endsAt?: string | null };
};

export function AccessStatus() {
  const [access, setAccess] = useState<AccessPayload | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const response = await fetch('/api/entitlement', { cache: 'no-store' }).catch(() => null);
      if (!response) return;
      const payload = await response.json().catch(() => null) as AccessPayload | null;
      if (!cancelled) setAccess(payload);
    };
    void refresh();
    queueMicrotask(() => { if (!cancelled) setNow(Date.now()); });
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    window.addEventListener('spinout:access-changed', refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('spinout:access-changed', refresh);
    };
  }, []);

  if (!access?.authenticated) return null;
  if (access.paid) return <div className="access-status is-paid"><span>Spin Out+</span><strong>Active</strong></div>;

  if (access.source === 'trial' && access.trial?.endsAt) {
    const minutes = Math.max(0, Math.ceil((Date.parse(access.trial.endsAt) - now) / 60_000));
    return <div className="access-status is-trial"><span>Plus trial</span><strong>{minutes} min left</strong></div>;
  }

  if (access.trial?.eligible) return <div className="access-status"><span>First Reality Run</span><strong>Includes Plus</strong></div>;
  return <div className="access-status"><span>Access</span><strong>Core</strong></div>;
}
