import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function presenceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  const supabase = presenceClient();
  if (!supabase) {
    return NextResponse.json({ available: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
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

  const { data, error } = await supabase.rpc('touch_presence', { p_session_id: id });
  if (error || typeof data !== 'number') {
    console.error('Presence unavailable', error?.message);
    return NextResponse.json({ available: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ available: true, otherCount: Math.max(0, Math.round(data)) }, { headers: { 'Cache-Control': 'no-store' } });
}
