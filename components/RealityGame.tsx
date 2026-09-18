'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { GamblingType } from '@/lib/types';
import type { AnimatedOutcome, RealityGameBridge } from '@/lib/phaserGame';

export interface RealityGameHandle {
  playOutcome(outcome: AnimatedOutcome): Promise<void>;
  setBalance(balanceCents: number): void;
}

export const RealityGame = forwardRef<RealityGameHandle, { gameType: GamblingType; reducedMotion: boolean; initialBalanceCents: number }>(
  function RealityGame({ gameType, reducedMotion, initialBalanceCents }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const bridge = useRef<RealityGameBridge | null>(null);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      playOutcome: async outcome => { if (bridge.current) await bridge.current.playOutcome(outcome); },
      setBalance: balanceCents => bridge.current?.setContext(balanceCents),
    }), []);

    useEffect(() => {
      let cancelled = false;
      setReady(false);
      (async () => {
        if (!host.current) return;
        const { mountRealityGame } = await import('@/lib/phaserGame');
        const mounted = await mountRealityGame(host.current, { gameType, reducedMotion, initialBalanceCents });
        if (cancelled) mounted.destroy();
        else { bridge.current = mounted; setReady(true); }
      })();
      return () => { cancelled = true; bridge.current?.destroy(); bridge.current = null; if (host.current) host.current.innerHTML = ''; };
    }, [gameType, reducedMotion, initialBalanceCents]);

    return <div className="phaser-stage" data-ready={ready ? 'true' : 'false'} ref={host}>{!ready ? <div className="game-loading">Building the table…</div> : null}</div>;
  },
);
