'use client';

import { useEffect, useRef, useState } from 'react';
import { companionCount } from '@/lib/presence';

const SESSION_KEY = 'spinout.presence.id';

function presenceId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function JourneyCounter() {
  const [count, setCount] = useState<number | null>(null);
  const id = useRef<string | null>(null);

  useEffect(() => {
    id.current = presenceId();
    let cancelled = false;

    const heartbeat = async () => {
      if (!id.current) return;
      try {
        const response = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: id.current }),
          cache: 'no-store',
        });
        if (!response.ok) return;
        const payload = await response.json() as { count?: unknown };
        if (!cancelled && typeof payload.count === 'number' && Number.isFinite(payload.count)) {
          setCount(companionCount(payload.count));
        }
      } catch {
        // Presence is supplemental. The product remains fully usable if it is unavailable.
      }
    };

    void heartbeat();
    const timer = window.setInterval(() => void heartbeat(), 25_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  if (count == null || count < 1) return null;
  return (
    <p className="journey-counter" aria-live="polite">
      <span className="journey-pulse" aria-hidden="true" />
      {count === 1 ? '1 person is on this journey with you' : `${count} people are on this journey with you`}
    </p>
  );
}
