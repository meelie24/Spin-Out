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

type PostRunContext = {
  runCount: number;
  moneyKeptCents: number;
  exitedAfterPing: boolean;
  limitExceeded: boolean;
  financialPressure: boolean;
  paydaySoon: boolean;
};

const routePostRunContextQuestion = nextPostRunContextQuestion as unknown as (
  profile: RealityProfile,
  context: PostRunContext,
) => string | null;


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

test('post-run earns one deeper question from the moment that gives it a job', () => {
  const base = {
    runCount: 1,
    moneyKeptCents: 6_000,
    exitedAfterPing: false,
    limitExceeded: false,
    financialPressure: false,
    paydaySoon: false,
  };

  assert.equal(routePostRunContextQuestion(profile(), base), 'money-goal');

  const goalAnswered = profile({
    personalMoneyGoal: 'Savings',
    onboardingCompleted: ['money-goal'],
  });
  assert.equal(routePostRunContextQuestion(goalAnswered, { ...base, runCount: 2 }), 'difficult-times');

  const patternAnswered = profile({
    personalMoneyGoal: 'Savings',
    difficultTimes: ['late-night'],
    onboardingCompleted: ['money-goal','difficult-times'],
  });
  assert.equal(routePostRunContextQuestion(patternAnswered, {
    ...base,
    runCount: 3,
    exitedAfterPing: true,
  }), 'quit-reason');

  const reasonAnswered = profile({
    personalMoneyGoal: 'Savings',
    difficultTimes: ['late-night'],
    quitReason: 'Stop taking bill money',
    onboardingCompleted: ['money-goal','difficult-times','quit-reason'],
  });
  assert.equal(routePostRunContextQuestion(reasonAnswered, {
    ...base,
    runCount: 3,
    paydaySoon: true,
  }), 'payday-plan');
});

test('post-run sensitive lender questions only appear when financially relevant', () => {
  const p = profile({
    personalMoneyGoal: 'Savings',
    difficultTimes: ['late-night'],
    quitReason: 'Stop taking bill money',
    paydayPlanActions: ['move-bill-money'],
    onboardingCompleted: ['money-goal','difficult-times','quit-reason','payday-plan'],
  });

  assert.equal(routePostRunContextQuestion(p, {
    runCount: 4,
    moneyKeptCents: 0,
    exitedAfterPing: false,
    limitExceeded: false,
    financialPressure: false,
    paydaySoon: false,
  }), null);

  assert.equal(routePostRunContextQuestion(p, {
    runCount: 4,
    moneyKeptCents: 0,
    exitedAfterPing: false,
    limitExceeded: false,
    financialPressure: true,
    paydaySoon: false,
  }), 'lender-name');
});

test('an honest completed post-run answer is never asked again', () => {
  const honestlyUnsure = profile({
    personalMoneyGoal: null,
    onboardingCompleted: ['money-goal'],
  });
  assert.equal(routePostRunContextQuestion(honestlyUnsure, {
    runCount: 1,
    moneyKeptCents: 6_000,
    exitedAfterPing: false,
    limitExceeded: false,
    financialPressure: false,
    paydaySoon: false,
  }), null);
});
