import { NextResponse } from 'next/server';
import { PresenceRegistry } from '@/lib/presence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

declare global {
  // eslint-disable-next-line no-var
  var __spinOutPresence: PresenceRegistry | undefined;
}

const registry = globalThis.__spinOutPresence ?? new PresenceRegistry();
if (process.env.NODE_ENV !== 'production') globalThis.__spinOutPresence = registry;

export async function POST(request: Request) {
  let id = '';
  try {
    const body = await request.json() as { id?: unknown };
    if (typeof body.id === 'string') id = body.id;
  } catch {
    return NextResponse.json({ count: registry.count() }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!registry.touch(id)) {
    return NextResponse.json({ count: registry.count() }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ count: registry.count() }, { headers: { 'Cache-Control': 'no-store' } });
}
