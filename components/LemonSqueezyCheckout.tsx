'use client';

import { useState } from 'react';

export function LemonSqueezyCheckout({
  plan,
  onError,
}: {
  plan: 'monthly' | 'yearly';
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const beginCheckout = async () => {
    if (loading) return;
    setLoading(true);
    onError('');

    try {
      const response = await fetch('/api/billing/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const payload = await response.json().catch(() => ({})) as {
        url?: string;
        message?: string;
      };

      if (!response.ok || !payload.url) {
        onError(payload.message || 'Secure checkout is temporarily unavailable.');
        return;
      }

      window.location.assign(payload.url);
    } catch {
      onError('Secure checkout is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="multi-method-checkout">
      <div className="checkout-methods" aria-label="Supported subscription payment methods">
        <span>Card</span>
        <span>Apple Pay</span>
        <span>Google Pay</span>
        <span>PayPal</span>
      </div>
      <button className="primary-button checkout-primary" type="button" onClick={beginCheckout} disabled={loading}>
        {loading ? 'Opening secure checkout…' : 'Continue to secure checkout'}
      </button>
      <p className="checkout-availability">Available methods are shown based on device and location.</p>
    </div>
  );
}
