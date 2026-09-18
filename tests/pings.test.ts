import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPingCandidates, selectPing } from '../lib/pings';
import type { PingLearning, RealityProfile, RunSnapshot } from '../lib/types';

const baseProfile: RealityProfile = {
  version: 1,
  intendedWagerCents: 30_000,
  gamblingType: 'slots',
  triggerType: 'win-it-back',
  quitReason: "I'm tired of hiding where my money went.",
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
    startedAt: Date.parse('2026-09-18T12:00:00.000Z'),
    lastActionAt: Date.parse('2026-09-18T12:01:00.000Z'),
    actionIntervalsMs: [4_000, 3_500, 3_200],
    consecutiveLosses: 1,
    consecutiveWins: 0,
    lossesBeforeLastWin: 0,
    nearMiss: false,
    pingDismissalStreak: 0,
    chosenLimitRounds: null,
    chosenLimitMinutes: null,
    returnedAfterMs: null,
    totalStakedCents: 12_000,
    ...patch,
  };
}

const NOW = Date.parse('2026-09-18T12:02:00.000Z');

test('shortfall ping states the exact calculated shortfall', () => {
  const p = { ...baseProfile, intendedWagerCents: 60_000, availableUntilIncomeCents: 50_000, obligationAmountCents: 43_000 };
  const candidates = buildPingCandidates(p, snap({ initialBalanceCents: 60_000, balanceCents: 52_000 }), NOW);
  const shortfall = candidates.find(c => c.type === 'shortfall');
  if (!shortfall) throw new Error('shortfall ping missing');
  assert.equal(shortfall.message, "You'd be $10 short on the car payment.");
  assert.equal(shortfall.detail, 'Where would that come from?');
});

test('goal ping remains explicitly hypothetical', () => {
  const candidates = buildPingCandidates(baseProfile, snap({ balanceCents: 20_000 }), NOW);
  const goal = candidates.find(c => c.type === 'goal');
  if (!goal) throw new Error('goal ping missing');
  assert.match(goal.message, /could've/i);
});

test('borrowing ping only uses a supplied first name', () => {
  const withName = buildPingCandidates(baseProfile, snap({ balanceCents: 10_000 }), NOW).find(c => c.type === 'borrowing');
  assert.ok(withName?.message.includes('Brian'));
  const withoutName = buildPingCandidates({ ...baseProfile, recentLenderName: null }, snap({ balanceCents: 10_000 }), NOW);
  assert.equal(withoutName.some(c => c.type === 'borrowing'), false);
  const saidNo = buildPingCandidates({ ...baseProfile, recentLenderHelpedRecently: false }, snap({ balanceCents: 10_000 }), NOW);
  assert.equal(saidNo.some(c => c.type === 'borrowing'), false);
});

test('pings are spaced and not shown after every action', () => {
  const now = Date.parse('2026-09-18T12:02:00.000Z');
  assert.equal(buildPingCandidates(baseProfile, snap({
    actionCount: 5,
    lastPingAction: 4,
    lastPingAt: now - 4_000,
  }), now).length, 0);
});

test('rapid replay is detected from real action intervals', () => {
  const candidates = buildPingCandidates(baseProfile, snap({
    actionCount: 5,
    actionIntervalsMs: [4_000, 3_000, 2_600, 1_200],
  }), NOW);
  assert.equal(candidates.some(c => c.type === 'rapid-replay'), true);
});

test('four rapid rounds create a stronger interruptive Ping', () => {
  const candidates = buildPingCandidates(baseProfile, snap({
    actionCount: 7,
    actionIntervalsMs: [3_000, 2_600, 1_300, 1_200, 1_100, 1_000],
  }), NOW);
  const rapid = candidates.find(c => c.type === 'rapid-loop');
  assert.equal(rapid?.requiresChoice, true);
});

test('loss chasing appears after three losses', () => {
  const candidates = buildPingCandidates(baseProfile, snap({
    actionCount: 6,
    consecutiveLosses: 3,
    balanceCents: 18_000,
  }), NOW);
  const chasing = candidates.find(c => c.type === 'loss-streak');
  assert.ok(chasing);
  assert.match(chasing!.message, /loss|done/i);
});

test('near miss copy only appears when the engine flagged a near miss', () => {
  const without = buildPingCandidates(baseProfile, snap({ nearMiss: false }), NOW);
  assert.equal(without.some(c => c.type === 'near-miss'), false);
  const withNear = buildPingCandidates(baseProfile, snap({ nearMiss: true }), NOW);
  const near = withNear.find(c => c.type === 'near-miss');
  assert.equal(near?.message, "That looked close. It wasn't.");
});

test('a chosen round limit is remembered and compared with actual behavior', () => {
  const atLimit = buildPingCandidates(baseProfile, snap({ actionCount: 5, chosenLimitRounds: 5 }), NOW);
  assert.equal(atLimit.some(c => c.type === 'limit-reached'), true);

  const over = buildPingCandidates(baseProfile, snap({ actionCount: 7, chosenLimitRounds: 5 }), NOW);
  const candidate = over.find(c => c.type === 'limit-exceeded');
  assert.equal(candidate?.requiresChoice, true);
  assert.match(candidate!.message, /This is 7/);
});

test('repeated immediate dismissals become their own observation', () => {
  const candidates = buildPingCandidates(baseProfile, snap({ pingDismissalStreak: 4, actionCount: 7 }), NOW);
  const dismissal = candidates.find(c => c.type === 'dismissals');
  assert.equal(dismissal?.message, "You've closed the last four without reading them.");
});

test('the user supplied quitting reason can appear only after meaningful escalation', () => {
  const early = buildPingCandidates(baseProfile, snap({
    actionCount: 3,
    balanceCents: 29_000,
    chosenLimitRounds: null,
  }), NOW);
  assert.equal(early.some(c => c.type === 'quit-reason'), false);

  const lateNow = Date.parse('2026-09-18T12:10:30.000Z');
  const late = buildPingCandidates(baseProfile, snap({
    actionCount: 8,
    balanceCents: 14_000,
  }), lateNow);
  const reason = late.find(c => c.type === 'quit-reason');
  assert.ok(reason?.message.includes('hiding where my money went'));
});

test('simple on-device learning can prioritize categories associated with leaving', () => {
  const candidates = buildPingCandidates(baseProfile, snap({ balanceCents: 10_000 }), NOW);
  const learning: PingLearning = {
    obligation: { shown: 10, exitsAfter: 7 },
    'loss-total': { shown: 10, exitsAfter: 0 },
  };
  const picked = selectPing(candidates, learning, []);
  assert.notEqual(picked?.type, 'loss-total');
});

test('trigger-specific candidates change the conversation without inventing facts', () => {
  const bored = buildPingCandidates({ ...baseProfile, triggerType: 'bored' }, snap({ actionCount: 6, balanceCents: 28_000 }), NOW);
  assert.equal(bored.some(c => c.type === 'bored'), true);

  const winMoney = buildPingCandidates({ ...baseProfile, triggerType: 'win-money' }, snap({
    actionCount: 5,
    balanceCents: 33_000,
    previousBalanceCents: 30_000,
    lastNetCents: 3_000,
    consecutiveWins: 1,
  }), NOW);
  assert.equal(winMoney.some(c => c.type === 'win-money'), true);

  const habit = buildPingCandidates({ ...baseProfile, triggerType: 'habit' }, snap({ actionCount: 7, balanceCents: 27_000 }), NOW);
  assert.equal(habit.some(c => c.type === 'habit'), true);
});

test('raising the amount after a loss is recognized', () => {
  const candidates = buildPingCandidates(baseProfile, snap({
    previousStakeCents: 3_000,
    stakeCents: 6_000,
    lastNetCents: -3_000,
    balanceCents: 20_000,
  }), NOW);
  const candidate = candidates.find(c => c.type === 'stake-up');
  assert.equal(candidate?.message, 'You lost, then raised it.');
});

test('time-based prompts wait until the session has actually lasted long enough', () => {
  const early = buildPingCandidates(baseProfile, snap({
    actionCount: 7,
    startedAt: NOW - 4 * 60_000,
  }), NOW);
  assert.equal(early.some(c => c.type === 'time-check' || c.type === 'long-session'), false);

  const late = buildPingCandidates(baseProfile, snap({
    actionCount: 7,
    startedAt: NOW - 11 * 60_000,
  }), NOW);
  assert.equal(late.some(c => c.type === 'long-session'), true);
});

test('a win after losses gets interpreted after the win', () => {
  const candidates = buildPingCandidates(baseProfile, snap({
    lastNetCents: 4_000,
    lossesBeforeLastWin: 3,
    consecutiveLosses: 0,
    consecutiveWins: 1,
    balanceCents: 22_000,
  }), NOW);
  const candidate = candidates.find(c => c.type === 'win-after-losses');
  assert.equal(candidate?.message, 'Would this win make you stay longer?');
});

test('recovery ping appears when an obligation shortfall is repaired', () => {
  const p = { ...baseProfile, intendedWagerCents: 60_000, availableUntilIncomeCents: 50_000, obligationAmountCents: 43_000 };
  const candidates = buildPingCandidates(p, snap({
    initialBalanceCents: 60_000,
    previousBalanceCents: 50_000,
    balanceCents: 60_000,
    lastNetCents: 10_000,
    actionCount: 6,
  }), NOW);
  assert.equal(candidates.some(c => c.type === 'recovery'), true);
});
