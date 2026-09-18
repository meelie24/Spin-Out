import { NextResponse } from 'next/server';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE = process.env.PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

function config() {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? '';
  const monthly = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID ?? '';
  const yearly = process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID ?? '';
  return { clientId, secret, monthly, yearly };
}

async function accessToken(clientId: string, secret: string) {
  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('PayPal authentication failed.');
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error('PayPal did not return an access token.');
  return payload.access_token;
}

export async function POST(request: Request) {
  const auth = await createServerSupabase();
  const admin = createAdminSupabase();
  if (!auth || !admin) {
    return NextResponse.json({ verified: false, message: 'Billing is not configured.' }, { status: 503 });
  }

  const { data: userData, error: userError } = await auth.auth.getUser();
  const user = userData.user;
  if (userError || !user) {
    return NextResponse.json({ verified: false, message: 'Sign in before subscribing.' }, { status: 401 });
  }

  const { clientId, secret, monthly, yearly } = config();
  if (!clientId || !secret || !monthly || !yearly) {
    return NextResponse.json({ verified: false, message: 'Billing is not configured.' }, { status: 503 });
  }

  let subscriptionId = '';
  let plan: 'monthly' | 'yearly' | null = null;
  try {
    const body = await request.json() as { subscriptionId?: unknown; plan?: unknown };
    if (typeof body.subscriptionId === 'string') subscriptionId = body.subscriptionId.trim();
    if (body.plan === 'monthly' || body.plan === 'yearly') plan = body.plan;
  } catch {
    return NextResponse.json({ verified: false, message: 'Invalid checkout response.' }, { status: 400 });
  }

  if (!subscriptionId || !plan || subscriptionId.length > 80) {
    return NextResponse.json({ verified: false, message: 'Invalid subscription details.' }, { status: 400 });
  }

  try {
    const token = await accessToken(clientId, secret);
    const response = await fetch(`${API_BASE}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json({ verified: false, message: 'PayPal could not verify this subscription.' }, { status: 400 });
    }

    const subscription = await response.json() as { status?: string; plan_id?: string; id?: string };
    const expectedPlan = plan === 'monthly' ? monthly : yearly;
    const status = (subscription.status ?? 'UNKNOWN').toLowerCase();
    const verified = subscription.plan_id === expectedPlan && ['active', 'approved'].includes(status);

    if (!verified) {
      return NextResponse.json({ verified: false, status, message: 'The subscription is not active yet.' }, { status: 400 });
    }

    const { error: saveError } = await admin.from('entitlements').upsert({
      user_id: user.id,
      provider: 'paypal',
      subscription_id: subscriptionId,
      plan,
      status,
      provider_payload: { id: subscription.id ?? subscriptionId, plan_id: subscription.plan_id ?? expectedPlan },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (saveError) {
      console.error('Entitlement save failed', saveError.message);
      return NextResponse.json({ verified: false, message: 'Subscription was verified but access could not be saved.' }, { status: 500 });
    }

    return NextResponse.json({ verified: true, status, plan });
  } catch (error) {
    console.error('PayPal verification error', error);
    return NextResponse.json({ verified: false, message: 'Subscription verification is temporarily unavailable.' }, { status: 502 });
  }
}
