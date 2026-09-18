import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPaydayShield } from '../lib/realityEngine/payday';
import type { RealityProfile } from '../lib/types';

const base:RealityProfile={
  version:1,
  intendedWagerCents:30_000,
  gamblingType:'slots',
  triggerType:'win-it-back',
  availableUntilIncomeCents:85_000,
  nextIncomeDate:'2026-09-19',
  obligationType:'car',
  obligationAmountCents:43_000,
  obligationDueDate:'2026-09-22',
  recentLenderName:null,
  recentLenderHelpedRecently:false,
  recentLenderAmountCents:null,
  personalMoneyGoal:'Savings',
  difficultTimes:['payday'],
  paydayPlanActions:['move-bill-money','open-spinout'],
  startingUrge:8,
  financialContextUpdatedAt:'2026-09-18T00:00:00.000Z',
  createdAt:'2026-09-18T00:00:00.000Z',
};

test('payday shield appears the day before payday only when user marked payday as hard',()=>{
  const shield=buildPaydayShield(base,new Date('2026-09-18T12:00:00'));
  assert.equal(shield?.key,'payday');
  assert.equal(shield?.title,"Payday's tomorrow.");
  assert.equal(shield?.facts[0],'Car: $430');
  assert.equal(shield?.plan.length,2);

  const none=buildPaydayShield({...base,difficultTimes:[]},new Date('2026-09-18T12:00:00'));
  assert.equal(none,null);
});

test('friday night and late night only use timing the system can actually know',()=>{
  const friday=buildPaydayShield({...base,nextIncomeDate:null,difficultTimes:['friday-night']},new Date('2026-09-18T20:00:00'));
  assert.equal(friday?.key,'friday-night');

  const late=buildPaydayShield({...base,nextIncomeDate:null,difficultTimes:['late-night']},new Date('2026-09-18T23:30:00'));
  assert.equal(late?.key,'late-night');

  const stressed=buildPaydayShield({...base,nextIncomeDate:null,difficultTimes:['stressed']},new Date('2026-09-18T12:00:00'));
  assert.equal(stressed,null);
});

test('payday shield never fabricates ledger facts',()=>{
  const shield=buildPaydayShield({...base,obligationType:'none',obligationAmountCents:null,personalMoneyGoal:null},new Date('2026-09-18T12:00:00'));
  assert.deepEqual(shield?.facts,[]);
});
