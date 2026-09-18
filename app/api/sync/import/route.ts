import { NextResponse } from 'next/server';
import { resolveAccess } from '@/lib/access';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ synced:false }, { status:503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ synced:false }, { status:401 });
  const access = await resolveAccess(supabase, auth.user.id);
  if (!access.active) return NextResponse.json({ synced:false, premiumRequired:true }, { status:403 });

  const body = await request.json().catch(() => null) as { profile?: unknown; runs?: any[] } | null;
  if (!body || JSON.stringify(body).length > 750_000) return NextResponse.json({ synced:false }, { status:400 });

  if (body.profile) {
    const { error } = await supabase.from('user_profiles').upsert({
      user_id: auth.user.id,
      profile: body.profile,
      updated_at: new Date().toISOString(),
    }, { onConflict:'user_id' });
    if (error) return NextResponse.json({ synced:false }, { status:500 });
  }

  const runs = Array.isArray(body.runs) ? body.runs.slice(-80) : [];
  if (runs.length) {
    const rows = runs
      .filter(run => run && typeof run.id === 'string' && Number.isFinite(Number(run.startedAt)) && Number.isFinite(Number(run.endedAt)))
      .map(run => ({
        id: run.id,
        user_id: auth.user!.id,
        started_at: new Date(Number(run.startedAt)).toISOString(),
        ended_at: new Date(Number(run.endedAt)).toISOString(),
        data: run,
      }));
    if (rows.length) {
      const { error } = await supabase.from('run_history').upsert(rows, { onConflict:'id' });
      if (error) return NextResponse.json({ synced:false }, { status:500 });
    }
  }
  return NextResponse.json({ synced:true });
}
