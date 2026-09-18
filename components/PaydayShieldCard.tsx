'use client';

import type { PaydayShieldCard as PaydayShieldData } from '@/lib/realityEngine/payday';

export function PaydayShieldCard({
  card,
  onReview,
  onDismiss,
}: {
  card: PaydayShieldData;
  onReview?: () => void;
  onDismiss?: () => void;
}) {
  return <section className="payday-shield-card" aria-label="Payday Shield">
    <span className="payday-shield-label">Before you play</span>
    <strong>{card.title}</strong>
    <p>{card.detail}</p>
    {card.facts.length ? <div className="payday-facts">{card.facts.map(fact=><span key={fact}>{fact}</span>)}</div> : null}
    {card.plan.length ? <div className="payday-plan-lines">{card.plan.map(line=><span key={line}>{line}</span>)}</div> : null}
    {(onReview||onDismiss) ? <div className="payday-shield-actions">
      {onReview ? <button type="button" onClick={onReview}>{card.plan.length?'Review plan':'Set my plan'}</button> : null}
      {onDismiss ? <button type="button" className="bare-link" onClick={onDismiss}>I'm good</button> : null}
    </div> : null}
  </section>;
}
