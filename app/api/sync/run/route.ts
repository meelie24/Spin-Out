import { NextResponse } from 'next/server';
import { resolveAccess } from '@/lib/access';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function validUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ synced: false }, { status: 503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ synced: false }, { status: 401 });
  const body = await request.json().catch(() => null) as { profile?: unknown; record?: any } | null;
  if (!body?.profile || !body.record || !validUuid(body.record.id)) return NextResponse.json({ synced: false }, { status: 400 });

  const access = await resolveAccess(supabase, auth.user.id);
  const trialMatchesRun = access.source === 'trial' && access.trial.runId === body.record.id;
  if (!access.paid && !trialMatchesRun) {
    return NextResponse.json({ synced:false, premiumRequired:true }, { status:403 });
  }

  const serialized = JSON.stringify(body);
  if (serialized.length > 150_000) return NextResponse.json({ synced: false }, { status: 413 });

  const startedAt = new Date(Number(body.record.startedAt));
  const endedAt = new Date(Number(body.record.endedAt));
  if (!Number.isFinite(startedAt.getTime()) || !Number.isFinite(endedAt.getTime())) return NextResponse.json({ synced: false }, { status: 400 });

  const [profileResult, runResult] = await Promise.all([
    supabase.from('user_profiles').upsert({
      user_id: auth.user.id,
      profile: body.profile,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }),
    supabase.from('run_history').upsert({
      id: body.record.id,
      user_id: auth.user.id,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      data: body.record,
    }, { onConflict: 'id' }),
  ]);
  if (profileResult.error || runResult.error) {
    console.error('Run sync failed', profileResult.error?.message, runResult.error?.message);
    return NextResponse.json({ synced: false }, { status: 500 });
  }
  return NextResponse.json({ synced: true });
}
