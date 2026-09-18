import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LemonEvent = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: unknown;
      plan?: unknown;
    };
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      status?: string;
      variant_id?: number | string;
      ends_at?: string | null;
      renews_at?: string | null;
      urls?: {
        customer_portal?: string;
        update_payment_method?: string;
      };
    };
  };
};

function signaturesMatch(expected: string, actual: string) {
  if (!expected || !actual || expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(actual, 'utf8'));
}

function planForVariant(variantId: unknown) {
  const value = String(variantId ?? '');
  if (value && value === String(process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID ?? '')) return 'monthly';
  if (value && value === String(process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID ?? '')) return 'yearly';
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '';
  const admin = createAdminSupabase();
  if (!secret || !admin) return new NextResponse(null, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-signature') ?? '';
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  if (!signaturesMatch(digest, signature)) {
    return new NextResponse(null, { status: 401 });
  }

  let event: LemonEvent;
  try {
    event = JSON.parse(rawBody) as LemonEvent;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (event.data?.type !== 'subscriptions' || !event.data.id) {
    return NextResponse.json({ received: true });
  }

  const subscriptionId = String(event.data.id);
  const status = String(event.data.attributes?.status ?? 'unknown').toLowerCase();
  const rawUserId = event.meta?.custom_data?.user_id;
  const userId = typeof rawUserId === 'string' ? rawUserId : '';
  const customPlan = event.meta?.custom_data?.plan;
  const plan = customPlan === 'monthly' || customPlan === 'yearly'
    ? customPlan
    : planForVariant(event.data.attributes?.variant_id);

  const update = {
    provider: 'lemonsqueezy',
    subscription_id: subscriptionId,
    plan: plan ?? 'monthly',
    status,
    provider_payload: event,
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    const { error } = await admin.from('entitlements').upsert(
      { user_id: userId, ...update },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error('Lemon Squeezy entitlement upsert failed', error.message);
      return new NextResponse(null, { status: 500 });
    }
  } else {
    const { error } = await admin.from('entitlements')
      .update(update)
      .eq('subscription_id', subscriptionId);

    if (error) {
      console.error('Lemon Squeezy entitlement update failed', error.message);
      return new NextResponse(null, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
