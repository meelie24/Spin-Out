import { NextResponse } from 'next/server';
import { resolveAccess, signedOutAccess } from '@/lib/access';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json(signedOutAccess(), { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json(signedOutAccess(), { status: 401 });

  const access = await resolveAccess(supabase, auth.user.id);
  return NextResponse.json(access, { headers: { 'Cache-Control': 'no-store' } });
}
