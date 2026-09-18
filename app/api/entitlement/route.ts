import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ authenticated: false, active: false }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ authenticated: false, active: false }, { status: 401 });

  const { data, error } = await supabase.from('entitlements')
    .select('status,plan,subscription_id,updated_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ authenticated: true, active: false }, { status: 500 });
  const active = Boolean(data && ['active','approved'].includes(String(data.status).toLowerCase()));
  return NextResponse.json({ authenticated: true, active, entitlement: data ?? null }, { headers: { 'Cache-Control': 'no-store' } });
}
