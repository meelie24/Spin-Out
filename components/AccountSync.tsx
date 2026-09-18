'use client';

import { useEffect } from 'react';
import { createBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';
import { loadData, saveData } from '@/lib/storage';
import type { RealityProfile, RunRecord } from '@/lib/types';

function mergeRuns(local: RunRecord[], remote: RunRecord[]) {
  const merged = new Map<string, RunRecord>();
  for (const run of remote) if (run?.id) merged.set(run.id, run);
  for (const run of local) if (run?.id) merged.set(run.id, run);
  return [...merged.values()].sort((a,b)=>a.endedAt-b.endedAt).slice(-80);
}

export function AccountSync() {
  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    let cancelled = false;

    const sync = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || cancelled) return;

      const local = loadData();
      await fetch('/api/sync/import', {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body:JSON.stringify({ profile:local.profile, runs:local.runs }),
      }).catch(()=>null);

      const response = await fetch('/api/sync/export', { cache:'no-store' }).catch(()=>null);
      if (!response?.ok || cancelled) return;
      const remote = await response.json().catch(()=>null) as { profile?:RealityProfile|null; runs?:RunRecord[] } | null;
      if (!remote || cancelled) return;

      const next = loadData();
      saveData({
        ...next,
        profile: remote.profile ?? next.profile,
        runs: mergeRuns(next.runs, Array.isArray(remote.runs) ? remote.runs : []),
      });
      window.dispatchEvent(new Event('spinout:data-synced'));
    };

    void sync();
    const { data } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') void sync();
    });
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, []);

  return null;
}
