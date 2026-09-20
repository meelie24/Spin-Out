import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRealityReceipt } from '../lib/realityEngine/receipt';
import type { ActiveRun, RealityProfile } from '../lib/types';

const profile:RealityProfile={
  version:1,
  intendedWagerCents:30_000,
  gamblingType:'slots',
  triggerType:'win-it-back',
  quitReason:null,
  availableUntilIncomeCents:85_000,
  nextIncomeDate:'2026-09-25',
  obligationType:'car',
  obligationAmountCents:43_000,
  obligationDueDate:'2026-09-22',
  recentLenderName:null,
  recentLenderHelpedRecently:false,
  recentLenderAmountCents:null,
  personalMoneyGoal:null,
  startingUrge:8,
  financialContextUpdatedAt:'2026-09-18T00:00:00.000Z',
  createdAt:'2026-09-18T00:00:00.000Z',
};

function run(patch:Partial<ActiveRun>={}):ActiveRun{
  return {
    id:'11111111-1111-4111-8111-111111111111',
    startedAt:0,
    initialBalanceCents:30_000,
    balanceCents:17_000,
    previousBalanceCents:18_000,
    stakeCents:3_000,
    previousStakeCents:3_000,
    actionCount:8,
    largestLossCents:13_000,
    simulatedLossesCents:18_000,
    simulatedRecoveriesCents:5_000,
    lastNetCents:-1_000,
    lastPingAction:6,
    pings:[],
    timeline:[],
    chosenLimitRounds:5,
    chosenLimitMinutes:null,
    totalStakedCents:24_000,
    ...patch,
  };
}

test('receipt keeps the core session facts',()=>{
  const receipt=buildRealityReceipt(profile,run(),6*60_000+41_000);
  assert.equal(receipt.durationSeconds,401);
  assert.equal(receipt.rounds,8);
  assert.equal(receipt.startedCents,30_000);
  assert.equal(receipt.endedCents,17_000);
});

test('limit overrun outranks weaker behavior observations',()=>{
  const receipt=buildRealityReceipt(profile,run({
    chosenLimitRounds:5,
    actionCount:8,
    actionIntervalsMs:[1200,1100,1000,900],
  }),400_000);
  assert.equal(receipt.behavior,'You went 3 rounds past the limit you chose.');
});

test('stake escalation after a loss is selected when there is no limit overrun',()=>{
  const receipt=buildRealityReceipt(profile,run({
    chosenLimitRounds:null,
    actionCount:4,
    timeline:[
      {kind:'action',at:1,balanceCents:25_000,stakeCents:2_000,netCents:-2_000},
      {kind:'stake',at:2,balanceCents:25_000,stakeCents:4_000},
    ],
  }),200_000);
  assert.equal(receipt.behavior,'You raised the amount after a loss.');
});

test('real-life translation uses only entered obligation numbers',()=>{
  const receipt=buildRealityReceipt(profile,run({balanceCents:17_000}),300_000);
  assert.equal(receipt.translation,'$130 is about 30% of the car payment you entered.');
});

test('lowering or keeping a stake after a loss is not reported as raising it',()=>{
  for (const stakeCents of [1_000, 2_000]) {
    const receipt=buildRealityReceipt(profile,run({
      chosenLimitRounds:null,
      timeline:[
        {kind:'action',at:1,stakeCents:2_000,netCents:-2_000},
        {kind:'stake',at:2,stakeCents},
      ],
    }),200_000);
    assert.equal(receipt.behavior,null);
  }
});

test('receipt compares consecutive stake changes and requires known amounts',()=>{
  const timeline:ActiveRun['timeline']=[
    {kind:'action',at:1,stakeCents:4_000,netCents:-4_000},
    {kind:'stake',at:2,stakeCents:1_000},
    {kind:'stake',at:3,stakeCents:2_000},
  ];
  assert.equal(buildRealityReceipt(profile,run({chosenLimitRounds:null,timeline}),200_000).behavior,
    'You raised the amount after a loss.');
  assert.equal(buildRealityReceipt(profile,run({chosenLimitRounds:null,timeline:[
    {kind:'action',at:1,netCents:-2_000},
    {kind:'stake',at:2,stakeCents:4_000},
  ]}),200_000).behavior,null);
});

test('receipt omits real-life translation without a meaningful loss or obligation',()=>{
  const noBill={...profile,obligationType:'none' as const,obligationAmountCents:null};
  const receipt=buildRealityReceipt(noBill,run({balanceCents:30_000}),200_000);
  assert.equal(receipt.translation,null);
});

test('automatic endings are not described as choosing to leave after a Ping',()=>{
  const current=run({chosenLimitRounds:null,pings:[{
    id:'ping',type:'obligation',level:2,message:'Bill',shownAt:190_000,dismissedAt:null,
  }]});
  assert.equal(buildRealityReceipt(profile,current,200_000,'timeout').behavior,null);
  assert.equal(buildRealityReceipt(profile,current,200_000,'balance').behavior,null);
  assert.equal(buildRealityReceipt(profile,current,200_000,'voluntary').behavior,'You left after the last Reality Ping.');
});
