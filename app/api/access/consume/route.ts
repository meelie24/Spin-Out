import { NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const authClient = await createServerSupabase();
  const admin = createAdminSupabase();
  if (!authClient || !admin) return NextResponse.json({ consumed: false, configured: false });
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ consumed: false }, { status: 401 });

  const body = await request.json().catch(() => null) as { runId?: unknown } | null;
  const runId = typeof body?.runId === 'string' ? body.runId : '';
  if (!UUID.test(runId)) return NextResponse.json({ consumed: false }, { status: 400 });

  const now = new Date().toISOString();
  const { error } = await admin.from('user_access').update({ trial_consumed_at: now, updated_at: now })
    .eq('user_id', auth.user.id).eq('trial_run_id', runId).is('trial_consumed_at', null);
  if (error) return NextResponse.json({ consumed: false }, { status: 500 });
  return NextResponse.json({ consumed: true });
}
