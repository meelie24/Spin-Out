import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ synced: false }, { status: 503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ synced: false }, { status: 401 });

  const body = await request.json().catch(() => null) as { profile?: unknown } | null;
  if (!body?.profile || JSON.stringify(body.profile).length > 30_000) {
    return NextResponse.json({ synced: false }, { status: 400 });
  }

  const { error } = await supabase.from('user_profiles').upsert({
    user_id: auth.user.id,
    profile: body.profile,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ synced: false }, { status: 500 });
  return NextResponse.json({ synced: true });
}
