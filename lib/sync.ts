'use client';

import { createBrowserSupabase, supabaseConfigured } from '@/lib/supabase/client';

async function hasSignedInUser() {
  if (!supabaseConfigured()) return false;
  const supabase = createBrowserSupabase();
  if (!supabase) return false;
  const { data, error } = await supabase.auth.getUser();
  return !error && Boolean(data.user);
}

export async function syncRunIfSignedIn(profile: unknown, record: unknown) {
  if (!(await hasSignedInUser())) return false;
  const response = await fetch('/api/sync/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profile, record }),
  }).catch(() => null);
  return Boolean(response?.ok);
}

export async function syncProfileIfSignedIn(profile: unknown) {
  if (!(await hasSignedInUser())) return false;
  const response = await fetch('/api/sync/profile', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profile }),
  }).catch(() => null);
  return Boolean(response?.ok);
}
