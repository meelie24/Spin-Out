import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json(
      { available: false, configured: false },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let id = '';
  try {
    const body = await request.json() as { id?: unknown };
    if (typeof body.id === 'string') id = body.id.trim();
  } catch {
    return NextResponse.json({ available: false }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  if (id.length < 8 || id.length > 128) {
    return NextResponse.json({ available: false }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - 90_000).toISOString();
  await admin.from('presence_sessions').delete().lt('seen_at', cutoff);

  const { error } = await admin
    .from('presence_sessions')
    .upsert({ session_id: id, seen_at: now.toISOString() }, { onConflict: 'session_id' });

  if (error) {
    console.error('Presence unavailable', error.message);
    return NextResponse.json({ available: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const { count, error: countError } = await admin
    .from('presence_sessions')
    .select('session_id', { head: true, count: 'exact' })
    .gte('seen_at', cutoff);

  if (countError || count == null) {
    console.error('Presence count unavailable', countError?.message);
    return NextResponse.json({ available: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json(
    { available: true, otherCount: Math.max(0, count - 1) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
