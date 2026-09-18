import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ authenticated:false }, { status:503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ authenticated:false }, { status:401 });

  const [profileResult, runsResult] = await Promise.all([
    supabase.from('user_profiles').select('profile').eq('user_id', auth.user.id).maybeSingle(),
    supabase.from('run_history').select('data').eq('user_id', auth.user.id).order('ended_at', { ascending:true }).limit(200),
  ]);
  if (profileResult.error || runsResult.error) return NextResponse.json({ authenticated:true, synced:false }, { status:500 });

  return NextResponse.json({
    authenticated:true,
    synced:true,
    profile: profileResult.data?.profile ?? null,
    runs: (runsResult.data ?? []).map(row => row.data),
  }, { headers:{ 'Cache-Control':'no-store' } });
}
