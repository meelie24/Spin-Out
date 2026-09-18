'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { GamblingType } from '@/lib/types';
import type { AnimatedOutcome, RealityGameBridge } from '@/lib/phaserGame';

export interface RealityGameHandle {
  playOutcome(outcome: AnimatedOutcome): Promise<void>;
  setBalance(balanceCents: number): void;
  setPokerHand(hand: string[], held: boolean[]): void;
}

export const RealityGame = forwardRef<RealityGameHandle, { gameType: GamblingType; reducedMotion: boolean; initialBalanceCents: number }>(
  function RealityGame({ gameType, reducedMotion, initialBalanceCents }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const bridge = useRef<RealityGameBridge | null>(null);
    const initialBalance = useRef(initialBalanceCents);
    const pendingPoker = useRef<{ hand:string[]; held:boolean[] } | null>(null);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      playOutcome: async outcome => { if (bridge.current) await bridge.current.playOutcome(outcome); },
      setBalance: balanceCents => bridge.current?.setContext(balanceCents),
      setPokerHand: (hand, held) => {
        pendingPoker.current = { hand:[...hand], held:[...held] };
        bridge.current?.setPokerHand(hand, held);
      },
    }), []);

    useEffect(() => {
      let cancelled = false;
      const node = host.current;
      queueMicrotask(() => { if (!cancelled) setReady(false); });
      (async () => {
        if (!node) return;
        const { mountRealityGame } = await import('@/lib/phaserGame');
        const mounted = await mountRealityGame(node, { gameType, reducedMotion, initialBalanceCents: initialBalance.current });
        if (cancelled) mounted.destroy();
        else {
          bridge.current = mounted;
          if (pendingPoker.current) mounted.setPokerHand(pendingPoker.current.hand, pendingPoker.current.held);
          setReady(true);
        }
      })();
      return () => {
        cancelled = true;
        bridge.current?.destroy();
        bridge.current = null;
        if (node) node.innerHTML = '';
      };
    }, [gameType, reducedMotion]);

    useEffect(() => {
      bridge.current?.setContext(initialBalanceCents);
    }, [initialBalanceCents]);

    return <div className="phaser-stage" data-ready={ready ? 'true' : 'false'} ref={host}>
      {!ready ? <div className="game-loading">Building the table…</div> : null}
    </div>;
  },
);
