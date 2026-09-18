'use client';

import { useEffect, useRef, useState } from 'react';
import type { PingCandidate } from '@/lib/types';

export function XRayMoment({
  insight,
  onContinue,
  onExit,
  onRunLong,
}: {
  insight: PingCandidate;
  onContinue: () => void;
  onExit: () => void;
  onRunLong?: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <section ref={dialogRef} tabIndex={-1} className="xray-moment" role="dialog" aria-modal="true" aria-label="X-Ray">
      <div className="xray-rule" aria-hidden="true" />
      <span className="xray-label">X-Ray</span>
      <strong>{insight.message}</strong>
      {insight.detail ? <p>{insight.detail}</p> : null}

      {whyOpen && insight.explanation ? (
        <div className="xray-explanation" role="status">{insight.explanation}</div>
      ) : null}

      <div className="xray-actions">
        <button type="button" className="xray-primary" onClick={onContinue}>Got it</button>
        <button type="button" className="xray-leave" onClick={onExit}>{"I'm done"}</button>
        {insight.explanation ? (
          <button type="button" className="xray-link" onClick={() => setWhyOpen(open => !open)}>
            {whyOpen ? 'Close explanation' : 'Why did that feel different?'}
          </button>
        ) : null}
        {onRunLong ? (
          <button type="button" className="xray-link" onClick={onRunLong}>Run 10,000</button>
        ) : null}
      </div>
    </section>
  );
}
