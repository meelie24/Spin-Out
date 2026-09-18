'use client';

import { useState } from 'react';
import { loadData, updateData, type BillingState } from '@/lib/storage';

export function PlusPanel({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<BillingState>(() => loadData().account.billing);
  const setBilling = (billing: BillingState) => {
    setState(billing);
    updateData(data => ({ ...data, account: { ...data.account, billing } }));
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="glass-dialog plus-dialog" role="dialog" aria-modal="true" aria-labelledby="plus-title" onMouseDown={e => e.stopPropagation()}>
      <p className="kicker">Spin Out+</p><h2 id="plus-title">Deeper history, when you want it.</h2>
      {state === 'free' ? <>
        <div className="plus-prices"><div><strong>$4.99</strong><span>month</span></div><div><strong>$29.99</strong><span>year</span></div></div>
        <ul><li>Full Reality Run history</li><li>Money Kept trends</li><li>Time-to-exit trends</li><li>Deeper personalization</li></ul>
        <p className="provider-note">Billing is not connected in this public build. Core Reality Runs stay free.</p>
        <button className="soft-button" type="button" onClick={() => setBilling('premium')}>Preview Plus on this device</button>
      </> : null}
      {state === 'premium' ? <><p className="provider-state">Plus preview is active on this device.</p><button className="soft-button" type="button" onClick={() => setBilling('canceled')}>Cancel preview</button></> : null}
      {state === 'canceled' ? <><p className="provider-state">Plus preview canceled. Your run history is still here.</p><button className="soft-button" type="button" onClick={() => setBilling('premium')}>Restore preview</button></> : null}
      {state === 'payment-failed' ? <><p className="provider-state">Payment couldn’t be completed. Nothing was charged.</p><button className="soft-button" type="button" onClick={() => setBilling('free')}>Back</button></> : null}
      <button className="bare-link plus-close" type="button" onClick={onClose}>Close</button>
    </section>
  </div>;
}
