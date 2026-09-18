import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRealityInsights } from '../lib/realityEngine/insights';
import type { RunRecord } from '../lib/types';

function run(id:string, patch:Partial<RunRecord>={}):RunRecord {
  const endedAt = Date.parse('2026-09-18T02:00:00.000Z') + Number(id.replace(/\D/g,'') || 0) * 60_000;
  return {
    id,
    startedAt:endedAt - 6 * 60_000,
    endedAt,
    exitReason:'voluntary',
    timeToExitSeconds:360,
    intendedWagerCents:30_000,
    actualWagerCents:0,
    moneyKeptCents:30_000,
    startingUrge:8,
    endingUrge:5,
    gamblingType:'slots',
    triggerType:'win-it-back',
    realWorldOutcome:'did-not-gamble',
    context:{
      availableUntilIncomeCents:80_000,
      nextIncomeDate:'2026-09-25',
      obligationType:'car',
      obligationAmountCents:43_000,
      obligationDueDate:'2026-09-22',
      recentLenderName:null,
      recentLenderHelpedRecently:false,
      recentLenderAmountCents:null,
      personalMoneyGoal:null,
      quitReason:null,
    },
    pings:[],
    timeline:[],
    actions:6,
    chosenLimitRounds:5,
    limitExceededByRounds:0,
    ...patch,
  };
}

test('historical runs without newer arrays do not break insight analysis', () => {
  const legacy = run('legacy') as RunRecord & { timeline?: RunRecord['timeline']; pings?: RunRecord['pings'] };
  delete legacy.timeline;
  delete legacy.pings;
  assert.doesNotThrow(() => buildRealityInsights([legacy, legacy, legacy]));
});

test('one session never becomes a Trigger Fingerprint', () => {
  const insights=buildRealityInsights([run('1')]);
  assert.equal(insights.fingerprint.length,0);
  assert.equal(insights.recovery.length,0);
});

test('limit overrun observation requires repeated evidence', () => {
  const runs=[
    run('1',{limitExceededByRounds:2}),
    run('2',{limitExceededByRounds:1}),
    run('3',{limitExceededByRounds:0}),
    run('4',{limitExceededByRounds:3}),
    run('5',{limitExceededByRounds:0}),
    run('6',{limitExceededByRounds:1}),
  ];
  const insights=buildRealityInsights(runs);
  const limit=insights.fingerprint.find(item=>item.key==='limit-overrun');
  assert.equal(limit?.title,'Going past your limit');
  assert.equal(limit?.detail,"You've gone past it in 4 of your last 6 sessions.");
});

test('recovery can show staying within a chosen limit without streak gamification', () => {
  const runs=[
    run('1',{limitExceededByRounds:0}),
    run('2',{limitExceededByRounds:0}),
    run('3',{limitExceededByRounds:1}),
    run('4',{limitExceededByRounds:0}),
    run('5',{limitExceededByRounds:0}),
  ];
  const insights=buildRealityInsights(runs);
  const item=insights.recovery.find(value=>value.key==='within-limit');
  assert.equal(item?.detail,'4 of your last 5 stayed inside the limit you chose.');
});

test('faster-after-loss needs multiple comparable sessions', () => {
  const timeline=[
    {kind:'action' as const,at:1,balanceCents:29000,stakeCents:1000,netCents:1000,intervalMs:4200},
    {kind:'action' as const,at:2,balanceCents:28000,stakeCents:1000,netCents:-1000,intervalMs:4000},
    {kind:'action' as const,at:3,balanceCents:27000,stakeCents:1000,netCents:-1000,intervalMs:1800},
    {kind:'action' as const,at:4,balanceCents:26000,stakeCents:1000,netCents:-1000,intervalMs:1500},
    {kind:'action' as const,at:5,balanceCents:25000,stakeCents:1000,netCents:-1000,intervalMs:1600},
  ];
  const runs=[run('1',{timeline}),run('2',{timeline}),run('3',{timeline}),run('4')];
  const insights=buildRealityInsights(runs);
  assert.equal(insights.fingerprint.some(item=>item.key==='faster-after-loss'),true);
});

test('shorter exit progress only appears from a real multi-session pattern', () => {
  const improving=[
    run('1',{timeToExitSeconds:700}),
    run('2',{timeToExitSeconds:610}),
    run('3',{timeToExitSeconds:520}),
    run('4',{timeToExitSeconds:430}),
    run('5',{timeToExitSeconds:340}),
  ];
  const insights=buildRealityInsights(improving);
  assert.equal(insights.recovery.some(item=>item.key==='shorter-exits'),true);

  const mixed=[
    run('1',{timeToExitSeconds:500}),
    run('2',{timeToExitSeconds:620}),
    run('3',{timeToExitSeconds:430}),
    run('4',{timeToExitSeconds:560}),
    run('5',{timeToExitSeconds:450}),
  ];
  assert.equal(buildRealityInsights(mixed).recovery.some(item=>item.key==='shorter-exits'),false);
});
