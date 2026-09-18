'use client';

import type { PingCandidate } from '@/lib/types';

export function RealityPing({ ping, reducedMotion, onDismiss }: { ping: PingCandidate; reducedMotion: boolean; onDismiss: () => void }) {
  return (
    <button
      type="button"
      className={`reality-ping ${reducedMotion ? 'reduced' : ''}`}
      style={{ backdropFilter: 'blur(24px) saturate(1.25)', WebkitBackdropFilter: 'blur(24px) saturate(1.25)' }}
      onClick={onDismiss}
      aria-label={`${ping.message} Tap to dismiss`}
    >
      <span className="ping-glint" aria-hidden="true" />
      <span className="ping-label">Reality</span>
      <span className="ping-message">{ping.message}</span>
      <span className="ping-dismiss">Tap anywhere</span>
    </button>
  );
}
