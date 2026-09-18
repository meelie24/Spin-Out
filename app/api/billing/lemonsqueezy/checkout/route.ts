import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function billingConfig() {
  return {
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? '',
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? '',
    monthlyVariant: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID ?? '',
    yearlyVariant: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID ?? '',
    testMode: process.env.LEMONSQUEEZY_TEST_MODE === 'true',
  };
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ message: 'Billing is not configured.' }, { status: 503 });
  }

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) {
    return NextResponse.json({ message: 'Sign in before subscribing.' }, { status: 401 });
  }

  let plan: 'monthly' | 'yearly' | null = null;
  try {
    const body = await request.json() as { plan?: unknown };
    if (body.plan === 'monthly' || body.plan === 'yearly') plan = body.plan;
  } catch {
    return NextResponse.json({ message: 'Invalid checkout request.' }, { status: 400 });
  }

  if (!plan) {
    return NextResponse.json({ message: 'Choose a valid plan.' }, { status: 400 });
  }

  const { apiKey, storeId, monthlyVariant, yearlyVariant, testMode } = billingConfig();
  if (!apiKey || !storeId || !monthlyVariant || !yearlyVariant) {
    return NextResponse.json({ message: 'Billing is not configured.' }, { status: 503 });
  }

  const variantId = plan === 'monthly' ? monthlyVariant : yearlyVariant;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            test_mode: testMode,
            product_options: {
              enabled_variants: [Number(variantId)],
              redirect_url: origin + '/plus?checkout=success',
              receipt_button_text: 'Open Spin Out+',
              receipt_link_url: origin + '/plus',
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
              desc: true,
              discount: false,
              subscription_preview: true,
              background_color: '#17100d',
              headings_color: '#f6e7d0',
              primary_text_color: '#e2ccb0',
              secondary_text_color: '#9c8675',
              links_color: '#d3aa70',
              borders_color: '#594034',
              checkbox_color: '#b7834d',
              active_state_color: '#c99b62',
              button_color: '#6a4330',
              button_text_color: '#fff3df',
              terms_privacy_color: '#8d7868',
            },
            checkout_data: {
              email: user.email ?? undefined,
              custom: {
                user_id: user.id,
                plan,
              },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: String(storeId) } },
            variant: { data: { type: 'variants', id: String(variantId) } },
          },
        },
      }),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null) as {
      data?: { attributes?: { url?: string } };
      errors?: Array<{ detail?: string }>;
    } | null;

    const url = payload?.data?.attributes?.url;
    if (!response.ok || !url) {
      console.error('Lemon Squeezy checkout creation failed', payload?.errors ?? response.status);
      return NextResponse.json({ message: 'Secure checkout could not be created.' }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Lemon Squeezy checkout error', error);
    return NextResponse.json({ message: 'Secure checkout is temporarily unavailable.' }, { status: 502 });
  }
}
