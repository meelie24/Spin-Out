import { NextResponse } from 'next/server';
import { entitlementIsActive, entitlementManageUrl } from '@/lib/entitlements';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ authenticated: false, active: false }, { status: 503 });
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ authenticated: false, active: false }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('entitlements')
    .select('status,plan,provider,provider_payload,subscription_id,updated_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ authenticated: true, active: false }, { status: 500 });
  }

  return NextResponse.json({
    authenticated: true,
    active: entitlementIsActive(data),
    manageUrl: entitlementManageUrl(data),
    entitlement: data ? {
      status: data.status,
      plan: data.plan,
      provider: data.provider,
      subscription_id: data.subscription_id,
      updated_at: data.updated_at,
    } : null,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
