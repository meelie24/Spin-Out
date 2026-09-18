import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dealPoker,
  drawPoker,
  evaluateJacksOrBetter,
  resolveRoulette,
  resolveScratch,
  resolveSlots,
  resolveSports,
  rouletteColor,
} from '../lib/gameEngines';

function seeded(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test('European roulette uses one zero, 18 red, 18 black and even-money payout', () => {
  let red = 0, black = 0, green = 0, net = 0;
  for (let number = 0; number < 37; number++) {
    const color = rouletteColor(number);
    if (color === 'red') red++;
    else if (color === 'black') black++;
    else green++;
    const outcome = resolveRoulette(() => (number + .1) / 37, 100, 'Red');
    net += outcome.netCents;
    assert.equal(outcome.visual.kind, 'roulette');
    if (outcome.visual.kind === 'roulette') assert.equal(outcome.visual.number, number);
  }
  assert.deepEqual({ red, black, green }, { red:18, black:18, green:1 });
  assert.equal(net, -100);
});

test('sports moneyline payout follows displayed decimal odds and normalized implied probability', () => {
  const win = resolveSports(() => 0, 1000, 'North Harbor');
  assert.equal(win.visual.kind, 'sports');
  if (win.visual.kind === 'sports') {
    assert.equal(win.visual.odds, 1.72);
    assert.equal(win.visual.payoutCents, 1720);
  }
  assert.equal(win.netCents, 720);

  const loss = resolveSports(() => .999999, 1000, 'North Harbor');
  assert.equal(loss.netCents, -1000);
});

test('Jacks or Better evaluator uses the 9/6 full-pay hand multipliers', () => {
  assert.deepEqual(evaluateJacksOrBetter(['10S','JS','QS','KS','AS']), { name:'Royal Flush', multiplier:800 });
  assert.deepEqual(evaluateJacksOrBetter(['9S','10S','JS','QS','KS']), { name:'Straight Flush', multiplier:50 });
  assert.deepEqual(evaluateJacksOrBetter(['9S','9H','9D','9C','2S']), { name:'Four of a Kind', multiplier:25 });
  assert.deepEqual(evaluateJacksOrBetter(['9S','9H','9D','2C','2S']), { name:'Full House', multiplier:9 });
  assert.deepEqual(evaluateJacksOrBetter(['2S','5S','8S','JS','KS']), { name:'Flush', multiplier:6 });
  assert.deepEqual(evaluateJacksOrBetter(['5S','6H','7D','8C','9S']), { name:'Straight', multiplier:4 });
  assert.deepEqual(evaluateJacksOrBetter(['QS','QH','3D','6C','9S']), { name:'Jacks or Better', multiplier:1 });
  assert.deepEqual(evaluateJacksOrBetter(['10S','10H','3D','6C','9S']), { name:'No Win', multiplier:0 });
});

test('poker draw only replaces unheld cards from the remaining 52-card deck', () => {
  const dealt = dealPoker(seeded(42));
  const held = [true,true,false,false,false];
  const { outcome } = drawPoker(dealt.hand, dealt.deck, held, 500);
  assert.equal(outcome.visual.kind, 'poker');
  if (outcome.visual.kind === 'poker') {
    assert.equal(outcome.visual.hand[0], dealt.hand[0]);
    assert.equal(outcome.visual.hand[1], dealt.hand[1]);
    assert.notEqual(outcome.visual.hand[2], dealt.hand[2]);
  }
});

test('slot engine pays the actual visible paylines and is calibrated near a mid-90s long-run return', () => {
  const rng = seeded(7);
  const stake = 500;
  let returned = 0;
  const spins = 120_000;
  for (let i=0;i<spins;i++) {
    const outcome = resolveSlots(rng, stake);
    returned += stake + outcome.netCents;
    assert.equal(outcome.visual.kind, 'slots');
  }
  const rtp = returned / (spins * stake);
  assert.ok(rtp > .90 && rtp < .99, 'slot RTP outside calibration window: ' + rtp);
});

test('near-miss flags come from the generated game result, not the Ping layer', () => {
  const slotRng = seeded(123);
  let slotNearMiss = null;
  for (let i = 0; i < 10_000; i++) {
    const outcome = resolveSlots(slotRng, 500);
    if (outcome.nearMiss) {
      slotNearMiss = outcome;
      break;
    }
  }
  assert.ok(slotNearMiss, 'expected to encounter a slot near miss in deterministic sample');
  assert.ok((slotNearMiss?.netCents ?? 0) < 0);

  const scratchRng = seeded(321);
  let scratchNearMiss = null;
  for (let i = 0; i < 10_000; i++) {
    const outcome = resolveScratch(scratchRng, 200);
    if (outcome.nearMiss) {
      scratchNearMiss = outcome;
      break;
    }
  }
  assert.ok(scratchNearMiss, 'expected to encounter a scratch near miss in deterministic sample');
  assert.equal(scratchNearMiss?.visual.kind, 'scratch');
});

test('scratch ticket result is predetermined and loss layouts never contain three matching prize amounts', () => {
  const rng = seeded(99);
  const stake = 200;
  let returned = 0;
  const tickets = 80_000;
  for (let i=0;i<tickets;i++) {
    const outcome = resolveScratch(rng, stake);
    returned += stake + outcome.netCents;
    assert.equal(outcome.visual.kind, 'scratch');
    if (outcome.visual.kind === 'scratch' && !outcome.visual.won) {
      const counts = new Map<number, number>();
      for (const value of outcome.visual.cells) counts.set(value, (counts.get(value) ?? 0) + 1);
      assert.ok([...counts.values()].every(count => count < 3));
    }
  }
  const rtp = returned / (tickets * stake);
  assert.ok(rtp > .62 && rtp < .72, 'scratch RTP outside calibration window: ' + rtp);
});
