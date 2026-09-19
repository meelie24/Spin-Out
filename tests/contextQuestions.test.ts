import test from 'node:test';
import assert from 'node:assert/strict';
import type { RealityProfile } from '../lib/types';
import {
  completedContextKeys,
  getAutomaticInRunContextKeys,
  getManualContextKeys,
  nextPostRunContextQuestion,
} from '../lib/contextQuestions';

function profile(patch: Partial<RealityProfile> = {}): RealityProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    intendedWagerCents: 10_000,
    gamblingType: 'slots',
    triggerType: 'win-it-back',
    triggerCustom: null,
    quitReason: null,
    availableUntilIncomeCents: null,
    nextIncomeDate: null,
    obligationType: 'car',
    obligationAmountCents: null,
    obligationDueDate: null,
    recentLenderName: null,
    recentLenderHelpedRecently: false,
    recentLenderAmountCents: null,
    personalMoneyGoal: null,
    additionalMoneyGoal: null,
    difficultTimes: [],
    difficultTimeCustom: null,
    paydayPlanActions: [],
    paydayPlanCustom: null,
    onboardingCompleted: [],
    startingUrge: 8,
    financialContextUpdatedAt: now,
    createdAt: now,
    ...patch,
  };
}

test('automatic in-run context is limited to immediately useful financial facts', () => {
  assert.deepEqual(getAutomaticInRunContextKeys(profile()), [
    'income-date',
    'available-money',
    'obligation-amount',
    'obligation-date',
  ]);
});

test('manual immersive context can continue into deeper unanswered questions', () => {
  const p = profile({
    nextIncomeDate: '2026-09-25',
    availableUntilIncomeCents: 85_000,
    obligationAmountCents: 43_000,
    obligationDueDate: '2026-09-23',
    onboardingCompleted: ['income-date','available-money','obligation-amount','obligation-date'],
  });
  assert.deepEqual(getAutomaticInRunContextKeys(p), []);
  assert.deepEqual(getManualContextKeys(p).slice(0, 5), [
    'quit-reason',
    'money-goal',
    'difficult-times',
    'lender-name',
    'payday-plan',
  ]);
});

test('nothing-specific obligation never asks for bill amount or due date', () => {
  const keys = getAutomaticInRunContextKeys(profile({ obligationType: 'none' }));
  assert.deepEqual(keys, ['income-date','available-money']);
});

test('an honest null answer stays completed when the marker exists', () => {
  const p = profile({
    nextIncomeDate: null,
    onboardingCompleted: ['income-date'],
  });
  assert(completedContextKeys(p).has('income-date'));
  assert(!getAutomaticInRunContextKeys(p).includes('income-date'));
});

test('post-run earns the money-goal ask only while it is genuinely unanswered', () => {
  assert.equal(nextPostRunContextQuestion(profile()), 'money-goal');

  const answered = profile({
    personalMoneyGoal: 'Savings',
    onboardingCompleted: ['money-goal'],
  });
  assert.equal(nextPostRunContextQuestion(answered), null);

  const honestlyUnsure = profile({
    personalMoneyGoal: null,
    onboardingCompleted: ['money-goal'],
  });
  assert.equal(nextPostRunContextQuestion(honestlyUnsure), null);
});
