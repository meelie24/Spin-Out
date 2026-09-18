'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';

export function PlusAccessLink() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    let cancelled = false;

    const refresh = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { if (!cancelled) setActive(false); return; }
      const { data, error } = await supabase.rpc('is_plus_active');
      if (!cancelled) setActive(!error && data === true);
    };

    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => void refresh());
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, []);

  return active ? <Link href="/plus" className="bare-link plus-home-link">Open Spin Out+</Link> : null;
}
