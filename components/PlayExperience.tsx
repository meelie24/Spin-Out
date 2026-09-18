'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RealitySetup } from './RealitySetup';
import { FakeDeposit } from './FakeDeposit';
import { RealityRun, type RunEndData } from './RealityRun';
import { PostRunFlow } from './PostRunFlow';
import { clearActiveRun, loadActiveRun, loadData, updateData } from '@/lib/storage';
import { shouldAutoEnd } from '@/lib/engine';
import type { ActiveRun, RealityProfile } from '@/lib/types';

interface ActiveEnvelope { profile: RealityProfile; run: ActiveRun }

type Stage = 'loading' | 'setup' | 'deposit' | 'run' | 'post';

export function PlayExperience() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('loading');
  const [profile, setProfile] = useState<RealityProfile | null>(null);
  const [restored, setRestored] = useState<ActiveRun | null>(null);
  const [end, setEnd] = useState<RunEndData | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const data = loadData();
      const active = loadActiveRun<ActiveEnvelope>();
      if (active?.profile && active?.run) {
        setProfile(active.profile);
        if (shouldAutoEnd(active.run.startedAt, Date.now())) {
          clearActiveRun();
          setEnd({ run: active.run, reason: 'timeout', endedAt: active.run.startedAt + 900_000, timeToExitSeconds: null });
          setStage('post');
        } else {
          setRestored(active.run);
          setStage('run');
        }
        return;
      }
      setProfile(data.profile);
      setStage('setup');
    });
    return () => { cancelled = true; };
  }, []);

  if (stage === 'loading') return <main className="loading-page"><span className="loading-dot"/>Loading</main>;
  if (stage === 'setup') return <RealitySetup existing={profile} onComplete={next => { setProfile(next); updateData(data => ({ ...data, profile: next })); setStage('deposit'); }} />;
  if (stage === 'deposit' && profile) return <FakeDeposit profile={profile} onComplete={() => setStage('run')} />;
  if (stage === 'run' && profile) return <RealityRun profile={profile} restoredRun={restored} onEnd={data => { setEnd(data); setRestored(null); setStage('post'); }} />;
  if (stage === 'post' && profile && end) return <PostRunFlow profile={profile} end={end} onDone={() => router.push('/')} />;
  return <main className="plain-page"><h1>Couldn’t start the run.</h1><button className="primary-button" type="button" onClick={() => { clearActiveRun(); setStage('setup'); }}>Start over</button></main>;
}
