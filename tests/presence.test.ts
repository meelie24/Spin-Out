import test from 'node:test';
import assert from 'node:assert/strict';
import { PresenceRegistry } from '../lib/presence';

test('presence counts unique live anonymous sessions', () => {
  const p = new PresenceRegistry(60_000);
  p.touch('a', 1_000);
  p.touch('b', 1_001);
  p.touch('a', 1_002);
  assert.equal(p.count(1_002), 2);
});

test('presence expires stale sessions', () => {
  const p = new PresenceRegistry(60_000);
  p.touch('a', 1_000);
  p.touch('b', 40_000);
  assert.equal(p.count(60_999), 2);
  assert.equal(p.count(61_001), 1);
});

test('presence rejects empty or unreasonably long ids', () => {
  const p = new PresenceRegistry(60_000);
  assert.equal(p.touch('', 1_000), false);
  assert.equal(p.touch('x'.repeat(129), 1_000), false);
  assert.equal(p.count(1_000), 0);
});

test('companion count excludes the current visitor', async () => {
  const { companionCount } = await import('../lib/presence');
  assert.equal(companionCount(1), 0);
  assert.equal(companionCount(6), 5);
  assert.equal(companionCount(0), 0);
});
