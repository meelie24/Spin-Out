'use client';

import { useEffect, useRef, useState } from 'react';

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
        const payload = await response.json() as { available?: unknown; otherCount?: unknown };
        if (!cancelled && payload.available === true && typeof payload.otherCount === 'number' && Number.isFinite(payload.otherCount)) {
          setCount(Math.max(0, Math.round(payload.otherCount)));
        } else if (!cancelled) {
          setCount(null);
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
      {count === 1 ? '1 other person is here right now' : `${count} other people are here right now`}
    </p>
  );
}
