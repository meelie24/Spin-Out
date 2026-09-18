'use client';

import { useState } from 'react';
import type { PingCandidate } from '@/lib/types';

export function RealityPing({
  ping,
  reducedMotion,
  onDismiss,
  onExit,
}: {
  ping: PingCandidate;
  reducedMotion: boolean;
  onDismiss: () => void;
  onExit: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <section
      className={`reality-ping ${reducedMotion ? 'reduced' : ''} ${ping.requiresChoice ? 'requires-choice' : ''}`}
      style={{ backdropFilter: 'blur(24px) saturate(1.25)', WebkitBackdropFilter: 'blur(24px) saturate(1.25)' }}
      role="dialog"
      aria-label="Reality Ping"
    >
      <span className="ping-glint" aria-hidden="true" />
      <span className="ping-label">Reality Ping</span>
      <span className="ping-message">{ping.message}</span>
      {ping.detail ? <span className="ping-detail">{ping.detail}</span> : null}

      {whyOpen && ping.explanation ? (
        <div className="ping-explanation" role="status">{ping.explanation}</div>
      ) : null}

      <div className="ping-actions">
        {ping.requiresChoice ? (
          <>
            <button type="button" className="ping-continue" onClick={onDismiss}>Keep going</button>
            <button type="button" className="ping-leave" onClick={onExit}>I'm done</button>
          </>
        ) : (
          <button type="button" className="ping-continue" onClick={onDismiss}>Keep going</button>
        )}
        {ping.explanation ? (
          <button type="button" className="ping-why" onClick={() => setWhyOpen(open => !open)}>
            {whyOpen ? 'Close explanation' : 'Why did I do that?'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
