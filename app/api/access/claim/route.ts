import { NextResponse } from 'next/server';
import { revenueCatPremiumForUser } from '@/lib/access';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';

const VALID_GAMES = new Set(['slots','sports','casino','poker','lottery','other']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const authClient = await createServerSupabase();
  const admin = createAdminSupabase();
  if (!authClient || !admin) return NextResponse.json({ access: 'core', active: false, configured: false }, { headers: { 'Cache-Control': 'no-store' } });

  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ access: 'core', active: false, authenticated: false }, { status: 401 });

  const body = await request.json().catch(() => null) as { runId?: unknown; game?: unknown } | null;
  const runId = typeof body?.runId === 'string' ? body.runId : '';
  const game = typeof body?.game === 'string' ? body.game : '';
  if (!UUID.test(runId) || !VALID_GAMES.has(game)) return NextResponse.json({ access: 'core', active: false }, { status: 400 });

  const paid = await revenueCatPremiumForUser(auth.user.id);
  if (paid.active) return NextResponse.json({ access: 'paid', active: true, trial: false }, { headers: { 'Cache-Control': 'no-store' } });

  let { data: row } = await admin.from('user_access')
    .select('trial_run_id,trial_game,trial_started_at,trial_ends_at,trial_consumed_at')
    .eq('user_id', auth.user.id).maybeSingle();

  if (!row) {
    const inserted = await admin.from('user_access').insert({ user_id: auth.user.id })
      .select('trial_run_id,trial_game,trial_started_at,trial_ends_at,trial_consumed_at').single();
    row = inserted.data;
  }

  if (!row?.trial_run_id) {
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + 15 * 60 * 1000);
    const claimed = await admin.from('user_access').update({
      trial_run_id: runId,
      trial_game: game,
      trial_started_at: startedAt.toISOString(),
      trial_ends_at: endsAt.toISOString(),
      updated_at: startedAt.toISOString(),
    }).eq('user_id', auth.user.id).is('trial_run_id', null)
      .select('trial_run_id,trial_game,trial_started_at,trial_ends_at,trial_consumed_at').maybeSingle();

    if (claimed.data?.trial_run_id === runId) {
      return NextResponse.json({ access: 'trial', active: true, trial: true, endsAt: claimed.data.trial_ends_at, game }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const refreshed = await admin.from('user_access')
      .select('trial_run_id,trial_game,trial_started_at,trial_ends_at,trial_consumed_at')
      .eq('user_id', auth.user.id).maybeSingle();
    row = refreshed.data;
  }

  if (row) {
    const sameRun = row.trial_run_id === runId;
    const notConsumed = !row.trial_consumed_at;
    const notExpired = Boolean(row.trial_ends_at && Date.parse(row.trial_ends_at) > Date.now());
    if (sameRun && notConsumed && notExpired) {
      return NextResponse.json({ access: 'trial', active: true, trial: true, endsAt: row.trial_ends_at, game: row.trial_game }, { headers: { 'Cache-Control': 'no-store' } });
    }
  }

  return NextResponse.json({ access: 'core', active: false, trial: false }, { headers: { 'Cache-Control': 'no-store' } });
}
