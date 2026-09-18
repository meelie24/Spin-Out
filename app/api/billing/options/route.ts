import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lemonSqueezy = Boolean(
    process.env.LEMONSQUEEZY_API_KEY
    && process.env.LEMONSQUEEZY_STORE_ID
    && process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID
    && process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID
    && process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  );

  const payPal = Boolean(
    (process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
    && process.env.PAYPAL_CLIENT_SECRET
    && process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID
    && process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID
    && process.env.PAYPAL_WEBHOOK_ID
  );

  return NextResponse.json(
    { lemonSqueezy, payPal },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
