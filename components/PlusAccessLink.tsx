'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function PlusAccessLink() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const response = await fetch('/api/entitlement', { cache: 'no-store' }).catch(() => null);
      const payload = response?.ok ? await response.json().catch(() => ({})) as { active?: boolean } : {};
      if (!cancelled) setActive(payload.active === true);
    };
    void refresh();
    window.addEventListener('spinout:access-changed', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('spinout:access-changed', refresh);
    };
  }, []);

  return active ? <Link href="/plus" className="bare-link plus-home-link">Open Spin Out+</Link> : null;
}
