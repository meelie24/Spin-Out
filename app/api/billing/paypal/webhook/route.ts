import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE = process.env.PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

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
  if (!payload.access_token) throw new Error('Missing PayPal access token.');
  return payload.access_token;
}

function mappedStatus(eventType: string, resourceStatus?: string) {
  const explicit = String(resourceStatus ?? '').toLowerCase();
  if (explicit) return explicit;
  if (eventType.includes('CANCELLED') || eventType.includes('CANCELED')) return 'canceled';
  if (eventType.includes('SUSPENDED')) return 'suspended';
  if (eventType.includes('EXPIRED')) return 'expired';
  if (eventType.includes('ACTIVATED')) return 'active';
  if (eventType.includes('PAYMENT.FAILED') || eventType.includes('DENIED')) return 'payment-failed';
  return 'unknown';
}

export async function POST(request: Request) {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? '';
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? '';
  const webhookId = process.env.PAYPAL_WEBHOOK_ID ?? '';
  const admin = createAdminSupabase();
  if (!clientId || !secret || !webhookId || !admin) return new NextResponse(null, { status: 503 });

  const event = await request.json().catch(() => null) as {
    event_type?: string;
    resource?: { id?: string; status?: string; billing_agreement_id?: string; subscription_id?: string };
  } | null;
  if (!event) return new NextResponse(null, { status: 400 });

  const headers = request.headers;
  const token = await accessToken(clientId, secret);
  const verification = await fetch(`${API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    }),
    cache: 'no-store',
  });

  if (!verification.ok) return new NextResponse(null, { status: 401 });
  const proof = await verification.json() as { verification_status?: string };
  if (proof.verification_status !== 'SUCCESS') return new NextResponse(null, { status: 401 });

  const subscriptionId = event.resource?.id
    ?? event.resource?.billing_agreement_id
    ?? event.resource?.subscription_id
    ?? '';
  if (!subscriptionId) return NextResponse.json({ received: true });

  const status = mappedStatus(event.event_type ?? '', event.resource?.status);
  const { error } = await admin.from('entitlements')
    .update({
      status,
      provider_payload: event,
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionId);

  if (error) {
    console.error('PayPal webhook entitlement update failed', error.message);
    return new NextResponse(null, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
