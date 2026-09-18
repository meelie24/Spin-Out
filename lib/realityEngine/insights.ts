import type { RunEvent, RunRecord } from '../types';

export interface RealityInsight {
  key: string;
  title: string;
  detail: string;
  evidenceCount: number;
}

export interface RealityInsights {
  fingerprint: RealityInsight[];
  recovery: RealityInsight[];
}

function actionEvents(run: RunRecord) {
  return (run.timeline ?? []).filter((event): event is RunEvent & { kind:'action' } => event.kind === 'action');
}

function fasterAfterFirstLoss(run: RunRecord) {
  const actions=actionEvents(run).filter(event => event.intervalMs != null);
  const firstLoss=actions.findIndex(event => (event.netCents ?? 0) < 0);
  if (firstLoss < 1 || firstLoss >= actions.length - 2) return false;

  const before=actions.slice(Math.max(0,firstLoss - 2),firstLoss + 1)
    .map(event => event.intervalMs as number);
  const after=actions.slice(firstLoss + 1,firstLoss + 4)
    .map(event => event.intervalMs as number);

  if (before.length < 2 || after.length < 2) return false;
  const beforeAvg=before.reduce((a,b)=>a+b,0)/before.length;
  const afterAvg=after.reduce((a,b)=>a+b,0)/after.length;
  return afterAvg < beforeAvg * .8;
}

function wentPastLimit(run: RunRecord) {
  return (run.limitExceededByRounds ?? 0) > 0 || (run.limitExceededSeconds ?? 0) > 0;
}

function hadChosenLimit(run: RunRecord) {
  return run.chosenLimitRounds != null || run.chosenLimitMinutes != null;
}

function voluntaryExits(runs: RunRecord[]) {
  return runs.filter(run => run.timeToExitSeconds != null);
}

export function buildRealityInsights(runs: RunRecord[]): RealityInsights {
  const fingerprint: RealityInsight[]=[];
  const recovery: RealityInsight[]=[];

  if (runs.length < 3) return { fingerprint, recovery };

  const recent6=runs.slice(-6);
  const limited=recent6.filter(hadChosenLimit);
  const overLimit=limited.filter(wentPastLimit);

  if (limited.length >= 4 && overLimit.length >= 2) {
    fingerprint.push({
      key:'limit-overrun',
      title:'Going past your limit',
      detail:`You've gone past it in ${overLimit.length} of your last ${limited.length} sessions.`,
      evidenceCount:limited.length,
    });
  }

  const paceComparable=runs.slice(-7).filter(run => actionEvents(run).length >= 4);
  const fasterCount=paceComparable.filter(fasterAfterFirstLoss).length;
  if (paceComparable.length >= 3 && fasterCount >= 3) {
    fingerprint.push({
      key:'faster-after-loss',
      title:'After the first loss',
      detail:'You start playing faster.',
      evidenceCount:fasterCount,
    });
  }

  const recentLong=runs.slice(-8).filter(run => (run.sessionDurationSeconds ?? 0) >= 8 * 60);
  const lateNight=recentLong.filter(run => {
    const hour=new Date(run.startedAt).getHours();
    return hour >= 22 || hour < 4;
  });
  if (recentLong.length >= 4 && lateNight.length >= 3 && lateNight.length / recentLong.length >= .6) {
    fingerprint.push({
      key:'late-night',
      title:'Late nights',
      detail:`${lateNight.length} of your last ${recentLong.length} longer sessions started late.`,
      evidenceCount:lateNight.length,
    });
  }

  const recentLimited=runs.filter(hadChosenLimit).slice(-10);
  if (recentLimited.length >= 4) {
    const within=recentLimited.filter(run => !wentPastLimit(run)).length;
    if (within >= Math.ceil(recentLimited.length * .6)) {
      recovery.push({
        key:'within-limit',
        title:'Staying inside your limit',
        detail:`${within} of your last ${recentLimited.length} stayed inside the limit you chose.`,
        evidenceCount:recentLimited.length,
      });
    }
  }

  const exits=voluntaryExits(runs);
  if (exits.length >= 5) {
    const recent=exits.slice(-5).map(run => run.timeToExitSeconds as number);
    let shorter=0;
    for(let i=1;i<recent.length;i++) if(recent[i] < recent[i-1]) shorter++;
    if (shorter >= 4) {
      recovery.push({
        key:'shorter-exits',
        title:'Leaving sooner',
        detail:'Your last five exits kept getting shorter.',
        evidenceCount:5,
      });
    }
  }

  const recentChaseRuns=runs.slice(-10).filter(run =>
    (run.pings ?? []).some(ping => ['stake-up','loss-streak','rapid-loop'].includes(ping.type))
  );
  if (recentChaseRuns.length >= 3) {
    const exitedAfter=recentChaseRuns.filter(run => run.exitedAfterPing).length;
    if (exitedAfter >= 2) {
      recovery.push({
        key:'left-after-chase',
        title:'Noticing the chase',
        detail:`You left after a chase-related Reality Ping in ${exitedAfter} of those ${recentChaseRuns.length} sessions.`,
        evidenceCount:recentChaseRuns.length,
      });
    }
  }

  return {
    fingerprint:fingerprint.slice(0,3),
    recovery:recovery.slice(0,3),
  };
}
