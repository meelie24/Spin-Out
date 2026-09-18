import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_RUN_MS,
  computeMoneyKept,
  computeReality,
  isObligationExpired,
  recentExitAverageSeconds,
  sampleOutcome,
  shouldAutoEnd,
  stakeOptionsFor,
} from '../lib/engine';
import type { RealityProfile, RunRecord } from '../lib/types';

const profile: RealityProfile = {
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
  recentLenderAmountCents: 20_000,
  personalMoneyGoal: "Mom's birthday",
  startingUrge: 8,
  createdAt: '2026-09-18T00:00:00.000Z',
};

test('fixed outcome distribution maps all boundaries without adapting to history', () => {
  assert.deepEqual(sampleOutcome(0, 1000), { band: 'loss', netCents: -1000 });
  assert.deepEqual(sampleOutcome(0.379999, 1000), { band: 'loss', netCents: -1000 });
  assert.deepEqual(sampleOutcome(0.38, 1000), { band: 'partial-loss', netCents: -500 });
  assert.deepEqual(sampleOutcome(0.60, 1000), { band: 'push', netCents: 0 });
  assert.deepEqual(sampleOutcome(0.76, 1000), { band: 'win', netCents: 1000 });
  assert.deepEqual(sampleOutcome(0.94, 1000), { band: 'big-win', netCents: 2500 });
  assert.throws(() => sampleOutcome(1, 1000));
});

test('run ends automatically at 900 seconds without requiring a visible timer', () => {
  assert.equal(MAX_RUN_MS, 900_000);
  assert.equal(shouldAutoEnd(1_000, 900_999), false);
  assert.equal(shouldAutoEnd(1_000, 901_000), true);
});

test('reality math never exaggerates an obligation shortfall', () => {
  const reality1 = computeReality(profile, 10_000);
  assert.equal(reality1.simulatedLossCents, 20_000);
  assert.equal(reality1.availableAfterLossCents, 65_000);
  assert.equal(reality1.obligationShortfallCents, 0);

  const reality2 = computeReality(profile, -10_000);
  assert.equal(reality2.simulatedLossCents, 40_000);
  assert.equal(reality2.availableAfterLossCents, 45_000);
  assert.equal(reality2.obligationShortfallCents, 0);

  const reality3 = computeReality(profile, -13_000);
  assert.equal(reality3.availableAfterLossCents, 42_000);
  assert.equal(reality3.obligationShortfallCents, 1_000);
});

test('money kept and overspend are exact and factual', () => {
  assert.deepEqual(computeMoneyKept(10_000, 0), { keptCents: 10_000, overspentCents: 0 });
  assert.deepEqual(computeMoneyKept(10_000, 6_000), { keptCents: 4_000, overspentCents: 0 });
  assert.deepEqual(computeMoneyKept(10_000, 18_000), { keptCents: 0, overspentCents: 8_000 });
});

test('returning progress uses voluntary exits only and recent five average', () => {
  const mk = (seconds: number | null, reason: RunRecord['exitReason']): RunRecord => ({
    id: crypto.randomUUID(), startedAt: 0, endedAt: 1, exitReason: reason,
    timeToExitSeconds: seconds, intendedWagerCents: 10_000, actualWagerCents: 0,
    moneyKeptCents: 10_000, startingUrge: 8, endingUrge: 4, gamblingType: 'slots',
    triggerType: 'bored', pings: [], actions: 3,
  });
  const runs = [mk(500,'voluntary'),mk(400,'voluntary'),mk(null,'timeout'),mk(300,'voluntary'),mk(200,'voluntary'),mk(100,'voluntary'),mk(50,'voluntary')];
  assert.equal(recentExitAverageSeconds(runs), 210);
});

test('expired obligations are detected from calendar dates', () => {
  assert.equal(isObligationExpired('2026-09-17', '2026-09-18'), true);
  assert.equal(isObligationExpired('2026-09-18', '2026-09-18'), false);
  assert.equal(isObligationExpired(null, '2026-09-18'), false);
});

test('stake options stay bounded and scale with the intended wager', () => {
  assert.deepEqual(stakeOptionsFor(20_00), [100, 200, 400]);
  assert.deepEqual(stakeOptionsFor(100_00), [500, 1000, 2000]);
  assert.deepEqual(stakeOptionsFor(300_00), [1500, 3000, 6000]);
});
