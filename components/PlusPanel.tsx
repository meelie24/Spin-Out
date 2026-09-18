'use client';

import { useCallback, useMemo, useState } from 'react';
import { PayPalSubscription } from './PayPalSubscription';
import { loadData, updateData, type BillingState } from '@/lib/storage';

export function PlusPanel({ onClose }: { onClose: () => void }) {
  const initial = useMemo(() => loadData().account, []);
  const [state, setState] = useState<BillingState>(initial.billing);
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly');
  const [message, setMessage] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
  const monthlyPlan = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID ?? '';
  const yearlyPlan = process.env.NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID ?? '';
  const configured = Boolean(clientId && monthlyPlan && yearlyPlan);

  const setBilling = useCallback((billing: BillingState, subscriptionId: string | null = null, plan: 'monthly'|'yearly'|null = null) => {
    setState(billing);
    updateData(data => ({
      ...data,
      account: {
        ...data.account,
        billing,
        paypalSubscriptionId: subscriptionId ?? data.account.paypalSubscriptionId,
        paypalPlan: plan ?? data.account.paypalPlan,
      },
    }));
  }, []);

  const approved = useCallback((subscriptionId: string, plan: 'monthly'|'yearly') => {
    setMessage(null);
    setBilling('premium', subscriptionId, plan);
  }, [setBilling]);

  const checkoutError = useCallback((text: string) => {
    setMessage(text);
    if (/could not|failed/i.test(text)) setState('payment-failed');
  }, []);

  const planId = selected === 'monthly' ? monthlyPlan : yearlyPlan;

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="glass-dialog plus-dialog" role="dialog" aria-modal="true" aria-labelledby="plus-title" onMouseDown={e => e.stopPropagation()}>
      <p className="kicker">Spin Out+</p><h2 id="plus-title">Keep the deeper history.</h2>
      <p className="provider-note">Core Reality Runs stay free. Plus is for longer-term patterns and deeper personalization.</p>

      {state === 'free' || state === 'payment-failed' ? <>
        <div className="plus-prices" role="radiogroup" aria-label="Spin Out Plus plan">
          <button type="button" role="radio" aria-checked={selected === 'monthly'} className={selected === 'monthly' ? 'is-selected' : ''} onClick={() => { setSelected('monthly'); setMessage(null); }}>
            <strong>$4.99</strong><span>month</span>
          </button>
          <button type="button" role="radio" aria-checked={selected === 'yearly'} className={selected === 'yearly' ? 'is-selected' : ''} onClick={() => { setSelected('yearly'); setMessage(null); }}>
            <strong>$29.99</strong><span>year</span><em>Save 50%</em>
          </button>
        </div>
        <ul><li>Full Reality Run history</li><li>Money Kept trends</li><li>Time-to-exit trends</li><li>Deeper personalization</li></ul>
        {message ? <p className="billing-message" role="status">{message}</p> : null}
        {configured ? <PayPalSubscription
          clientId={clientId}
          planId={planId}
          plan={selected}
          onApproved={approved}
          onError={checkoutError}
        /> : <p className="provider-note">Secure checkout will appear here after the merchant plan IDs are connected. No fake payment button is shown.</p>}
      </> : null}

      {state === 'premium' ? <>
        <p className="provider-state">Spin Out+ is active on this device.</p>
        <p className="provider-note">Manage or cancel the subscription from your PayPal account. Core Reality Runs remain available if Plus ends.</p>
        <a className="soft-button" href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noreferrer">Manage subscription</a>
      </> : null}

      {state === 'canceled' ? <>
        <p className="provider-state">Spin Out+ is canceled. Your existing run history is still here.</p>
        <button className="soft-button" type="button" onClick={() => { setState('free'); setMessage(null); }}>See plans</button>
      </> : null}

      <button className="bare-link plus-close" type="button" onClick={onClose}>Close</button>
    </section>
  </div>;
}
