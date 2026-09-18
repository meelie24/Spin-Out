import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPingCandidates, selectPing } from '../lib/pings';
import type { PingLearning, RealityProfile, RunSnapshot } from '../lib/types';

const baseProfile: RealityProfile = {
  version: 1,
  intendedWagerCents: 30_000,
  gamblingType: 'slots',
  triggerType: 'win-it-back',
  availableUntilIncomeCents: 85_000,
  nextIncomeDate: '2026-09-25',
  obligationType: 'car',
  obligationAmountCents: 43_000,
  obligationDueDate: '2026-09-22',
  recentLenderName: 'Brian',
  recentLenderHelpedRecently: true,
  recentLenderAmountCents: 20_000,
  personalMoneyGoal: "Mom's birthday",
  startingUrge: 8,
  financialContextUpdatedAt: '2026-09-18T00:00:00.000Z',
  createdAt: '2026-09-18T00:00:00.000Z',
};

function snap(patch: Partial<RunSnapshot> = {}): RunSnapshot {
  return {
    initialBalanceCents: 30_000,
    balanceCents: 21_000,
    previousBalanceCents: 22_000,
    stakeCents: 3_000,
    previousStakeCents: 3_000,
    actionCount: 4,
    lastNetCents: -1_000,
    lastPingAction: 1,
    ...patch,
  };
}

test('shortfall ping states the exact calculated shortfall', () => {
  const p = { ...baseProfile, intendedWagerCents: 60_000, availableUntilIncomeCents: 50_000, obligationAmountCents: 43_000 };
  const candidates = buildPingCandidates(p, snap({ initialBalanceCents: 60_000, balanceCents: 52_000 }));
  const shortfall = candidates.find(c => c.type === 'shortfall');
  if (!shortfall) throw new Error('shortfall ping missing');
  assert.equal(shortfall.message, "You're $10 short on the car payment now. Where's that coming from?");
});

test('goal ping is explicitly hypothetical', () => {
  const candidates = buildPingCandidates(baseProfile, snap({ balanceCents: 20_000 }));
  const goal = candidates.find(c => c.type === 'goal');
  if (!goal) throw new Error('goal ping missing');
  assert.match(goal.message, /could've/i);
});

test('borrowing ping only uses a supplied first name', () => {
  const withName = buildPingCandidates(baseProfile, snap({ balanceCents: 10_000 })).find(c => c.type === 'borrowing');
  assert.ok(withName?.message.includes('Brian'));
  const withoutName = buildPingCandidates({ ...baseProfile, recentLenderName: null }, snap({ balanceCents: 10_000 }));
  assert.equal(withoutName.some(c => c.type === 'borrowing'), false);
  const saidNo = buildPingCandidates({ ...baseProfile, recentLenderHelpedRecently: false }, snap({ balanceCents: 10_000 }));
  assert.equal(saidNo.some(c => c.type === 'borrowing'), false);
});

test('pings are spaced and not shown after every action', () => {
  assert.equal(buildPingCandidates(baseProfile, snap({ actionCount: 5, lastPingAction: 4 })).length, 0);
});

test('simple on-device learning can prioritize categories associated with leaving', () => {
  const candidates = buildPingCandidates(baseProfile, snap({ balanceCents: 10_000 }));
  const learning: PingLearning = {
    obligation: { shown: 10, exitsAfter: 7 },
    generic: { shown: 10, exitsAfter: 0 },
  };
  const picked = selectPing(candidates, learning, []);
  assert.notEqual(picked?.type, 'generic');
});

test('trigger-specific candidates change the conversation without inventing facts', () => {
  const bored = buildPingCandidates({ ...baseProfile, triggerType: 'bored' }, snap({ actionCount: 6, balanceCents: 28_000 }));
  assert.equal(bored.some(c => c.type === 'bored'), true);
  const winMoney = buildPingCandidates({ ...baseProfile, triggerType: 'win-money' }, snap({ actionCount: 5, balanceCents: 33_000, lastNetCents: 3_000 }));
  assert.equal(winMoney.some(c => c.type === 'win-money'), true);
  const habit = buildPingCandidates({ ...baseProfile, triggerType: 'habit' }, snap({ actionCount: 7, balanceCents: 27_000 }));
  assert.equal(habit.some(c => c.type === 'habit'), true);
});


test('generic loss ping never says Down $0', () => {
  const candidates = buildPingCandidates(baseProfile, snap({ balanceCents: 30_000, previousBalanceCents: 30_000, lastNetCents: 0, actionCount: 6 }));
  assert.equal(candidates.some(c => c.type === 'generic'), false);
});

test('recovery ping appears when an obligation shortfall is repaired', () => {
  const p = { ...baseProfile, intendedWagerCents: 60_000, availableUntilIncomeCents: 50_000, obligationAmountCents: 43_000 };
  const candidates = buildPingCandidates(p, snap({ initialBalanceCents: 60_000, previousBalanceCents: 50_000, balanceCents: 60_000, lastNetCents: 10_000, actionCount: 6 }));
  assert.equal(candidates.some(c => c.type === 'recovery'), true);
});
