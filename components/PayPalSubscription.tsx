'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, unknown>;
        createSubscription: (_data: unknown, actions: { subscription: { create: (input: { plan_id: string }) => Promise<string> } }) => Promise<string>;
        onApprove: (data: { subscriptionID?: string }) => void | Promise<void>;
        onError?: (error: unknown) => void;
        onCancel?: () => void;
      }) => { render: (target: HTMLElement) => Promise<void> };
    };
  }
}

const SCRIPT_ID = 'spinout-paypal-sdk';

function loadPayPal(clientId: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.paypal) { resolve(); return; }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('PayPal checkout failed to load.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&components=buttons&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayPal checkout failed to load.'));
    document.head.appendChild(script);
  });
}

export function PayPalSubscription({
  clientId,
  planId,
  plan,
  onApproved,
  onError,
}: {
  clientId: string;
  planId: string;
  plan: 'monthly' | 'yearly';
  onApproved: (subscriptionId: string, plan: 'monthly' | 'yearly') => void;
  onError: (message: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let rendered = false;
    const node = host.current;

    (async () => {
      try {
        await loadPayPal(clientId);
        if (cancelled || !node || !window.paypal) return;
        node.innerHTML = '';
        await window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'subscribe', height: 44 },
          createSubscription: (_data, actions) => actions.subscription.create({ plan_id: planId }),
          onApprove: async data => {
            const subscriptionId = data.subscriptionID;
            if (!subscriptionId) {
              onError('PayPal did not return a subscription ID.');
              return;
            }
            const response = await fetch('/api/billing/paypal/verify', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ subscriptionId, plan }),
            });
            const payload = await response.json().catch(() => ({})) as { verified?: boolean; message?: string };
            if (!response.ok || !payload.verified) {
              onError(payload.message || 'Could not verify the subscription.');
              return;
            }
            onApproved(subscriptionId, plan);
          },
          onCancel: () => onError('Checkout was canceled. Nothing was charged.'),
          onError: error => {
            console.error('PayPal checkout error', error);
            onError('Checkout could not be completed.');
          },
        }).render(node);
        rendered = true;
      } catch (error) {
        if (!cancelled) onError(error instanceof Error ? error.message : 'Checkout could not load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (rendered && node) node.innerHTML = '';
    };
  }, [clientId, planId, plan, onApproved, onError]);

  return <div className="paypal-host" aria-busy={loading}>{loading ? <p className="provider-note">Loading secure checkout…</p> : null}<div ref={host}/></div>;
}
