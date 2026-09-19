'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RealitySetup } from './RealitySetup';
import { RunIntro } from './RunIntro';
import { RealityRun, type RunEndData } from './RealityRun';
import { PostRunFlow } from './PostRunFlow';
import { clearActiveRun, loadActiveRun, loadData, updateData } from '@/lib/storage';
import { syncProfileIfSignedIn } from '@/lib/sync';
import { shouldAutoEnd } from '@/lib/engine';
import type { ActiveRun, GamblingType, RealityProfile, SessionLimit } from '@/lib/types';

interface ActiveEnvelope { profile: RealityProfile; run: ActiveRun }

type Stage = 'loading' | 'setup' | 'intro' | 'run' | 'post';

export function PlayExperience({ initialGame = null }: { initialGame?: GamblingType | null }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('loading');
  const [profile, setProfile] = useState<RealityProfile | null>(null);
  const [restored, setRestored] = useState<ActiveRun | null>(null);
  const [end, setEnd] = useState<RunEndData | null>(null);
  const [sessionLimit, setSessionLimit] = useState<SessionLimit>({ rounds: null, minutes: null });

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
          setEnd({
            run: active.run,
            reason: 'timeout',
            endedAt: active.run.startedAt + 900_000,
            timeToExitSeconds: null,
          });
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

  const saveProfile = (next: RealityProfile) => {
    setProfile(next);
    updateData(data => ({ ...data, profile: next }));
    void syncProfileIfSignedIn(next);
  };

  if (stage === 'loading') {
    return <main className="loading-page" data-material="casino-loading"><span className="loading-dot" /><strong>Building the table…</strong><small>Reality Run</small></main>;
  }

  if (stage === 'setup') {
    return (
      <RealitySetup
        existing={profile}
        initialGame={initialGame}
        onComplete={(next, limit) => {
          saveProfile(next);
          setSessionLimit(limit);
          setRestored(null);
          setStage('intro');
        }}
      />
    );
  }

  if (stage === 'intro' && profile) {
    return <RunIntro profile={profile} onStart={() => setStage('run')} />;
  }

  if (stage === 'run' && profile) {
    return (
      <RealityRun
        profile={profile}
        restoredRun={restored}
        sessionLimit={sessionLimit}
        onProfileChange={saveProfile}
        onEnd={data => {
          setEnd(data);
          setRestored(null);
          setStage('post');
        }}
      />
    );
  }

  if (stage === 'post' && profile && end) {
    return <PostRunFlow profile={profile} end={end} onDone={() => router.push('/')} />;
  }

  return (
    <main className="plain-page">
      <h1>Couldn’t start the run.</h1>
      <button className="primary-button" type="button" onClick={() => { clearActiveRun(); setStage('setup'); }}>Start over</button>
    </main>
  );
}
