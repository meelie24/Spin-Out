'use client';

import { ErrorCode, PurchasesError } from '@revenuecat/purchases-js';
import { useEffect, useState } from 'react';
import { revenueCatForUser } from '@/lib/revenuecatClient';

const PREMIUM = 'premium';

export function RevenueCatCheckout({
  userId,
  email,
  plan,
  onApproved,
  onError,
}: {
  userId: string;
  email: string | null;
  plan: 'monthly' | 'yearly';
  onApproved: () => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const purchases = await revenueCatForUser(userId);
        if (!purchases) { if (!cancelled) setAvailable(false); return; }
        const offerings = await purchases.getOfferings();
        const pkg = plan === 'monthly' ? offerings.current?.monthly : offerings.current?.annual;
        if (!cancelled) setAvailable(Boolean(pkg));
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();
    return () => { cancelled = true; };
  }, [plan, userId]);

  const purchase = async () => {
    if (loading) return;
    setLoading(true);
    onError('');
    try {
      const purchases = await revenueCatForUser(userId);
      if (!purchases) { onError('Subscription checkout is not configured yet.'); return; }

      const offerings = await purchases.getOfferings();
      const pkg = plan === 'monthly' ? offerings.current?.monthly : offerings.current?.annual;
      if (!pkg) { onError('This subscription plan is not available in the current RevenueCat offering.'); return; }

      const result = await purchases.purchase({ rcPackage: pkg, customerEmail: email ?? undefined });
      if (PREMIUM in result.customerInfo.entitlements.active) onApproved();
      else onError('Payment completed, but premium access has not appeared yet. Refresh once RevenueCat finishes syncing.');
    } catch (error) {
      if (error instanceof PurchasesError && error.errorCode === ErrorCode.UserCancelledError) {
        onError('Checkout cancelled. Nothing was charged.');
      } else {
        console.error('RevenueCat purchase failed', error);
        onError('Payment did not complete. You can retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (available === false) {
    return <p className="provider-note">RevenueCat + Paddle checkout is waiting for the Paddle sandbox offering to be connected.</p>;
  }

  return <div className="multi-method-checkout">
    <div className="checkout-methods" aria-label="Paddle checkout"><span>Card</span><span>Paddle</span><span>RevenueCat</span></div>
    <button className="primary-button checkout-primary" type="button" onClick={purchase} disabled={loading || available == null}>
      {loading ? 'Opening checkout…' : available == null ? 'Loading plans…' : 'Continue to secure checkout'}
    </button>
    <p className="checkout-availability">Paddle handles payment and subscription management. RevenueCat controls the premium entitlement.</p>
  </div>;
}
