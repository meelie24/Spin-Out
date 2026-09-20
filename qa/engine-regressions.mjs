import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });

function profile() {
  const now = new Date().toISOString();
  return {
    version: 1, intendedWagerCents: 10_000, gamblingType: 'casino',
    triggerType: 'other', triggerCustom: null, quitReason: null,
    availableUntilIncomeCents: null, nextIncomeDate: null,
    obligationType: 'none', obligationAmountCents: null, obligationDueDate: null,
    recentLenderName: null, recentLenderHelpedRecently: false, recentLenderAmountCents: null,
    personalMoneyGoal: null, additionalMoneyGoal: null, startingUrge: 5,
    financialContextUpdatedAt: now, createdAt: now,
  };
}

function runFor(p, patch) {
  return {
    id: crypto.randomUUID(), startedAt: Date.now(),
    initialBalanceCents: p.intendedWagerCents, balanceCents: p.intendedWagerCents,
    previousBalanceCents: p.intendedWagerCents, stakeCents: 1_000, previousStakeCents: 1_000,
    actionCount: 0, largestLossCents: 0, simulatedLossesCents: 0, simulatedRecoveriesCents: 0,
    lastNetCents: 0, lastPingAction: -10, pings: [], timeline: [],
    lastActionAt: null, actionIntervalsMs: [], consecutiveLosses: 0, consecutiveWins: 0,
    lossesBeforeLastWin: 0, lastOutcomeBand: null, lastNearMiss: false, pingDismissalStreak: 0,
    chosenLimitRounds: null, chosenLimitMinutes: null, limitExceededAt: null,
    returnedAfterMs: null, totalStakedCents: 0, ...patch,
  };
}

async function check(name, patch, verify) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const p = profile();
    await context.addInitScript(({ profile, run }) => {
      localStorage.setItem('spinout.active.v2', JSON.stringify({ profile, run }));
      // Zero selects roulette's green zero: a deterministic loss on Red or Black.
      // Keep UUID generation intact, including the separate tab lease identity.
      const original = crypto.getRandomValues.bind(crypto);
      crypto.getRandomValues = array => array instanceof Uint32Array && array.length === 1
        ? (array[0] = 0, array)
        : original(array);
    }, { profile: p, run: runFor(p, patch) });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 20_000 });
    await verify(page);
    assert.deepEqual(pageErrors, [], 'engine scenario produced an uncaught browser error');
    console.log('PASS', name);
  } catch (error) {
    console.error('FAIL', name);
    throw error;
  } finally {
    await context.close();
  }
}

try {
  await check('chosen time limit appears without another play', {
    startedAt: Date.now() - 61_000, chosenLimitMinutes: 1, actionCount: 1,
  }, async page => {
    const ping = page.getByRole('dialog', { name: 'Reality Ping', exact: true });
    await ping.waitFor({ timeout: 5_000 });
    assert.match(await ping.innerText(), /You gave this 1 minute|past the 1 minutes/);
    assert.equal(await page.locator('[role="dialog"][aria-modal="true"]:visible').count(), 1);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.active.v2')));
    assert.equal(stored.run.actionCount, 1, 'deadline evaluation must not invent a play');
  });

  await check('clock evaluation preserves a more urgent round-limit choice', {
    startedAt: Date.now() - 61_000, chosenLimitMinutes: 1, chosenLimitRounds: 3, actionCount: 5,
  }, async page => {
    const ping = page.getByRole('dialog', { name: 'Reality Ping', exact: true });
    await ping.waitFor({ timeout: 5_000 });
    assert.match(await ping.innerText(), /You decided on 3\. This is 5\./);
    assert.equal(await page.locator('[role="dialog"][aria-modal="true"]:visible').count(), 1);
  });

  await check('final losing result and limit Ping precede the balance receipt', {
    balanceCents: 500, previousBalanceCents: 1_000, stakeCents: 500, previousStakeCents: 500,
    actionCount: 2, chosenLimitRounds: 3,
  }, async page => {
    await page.locator('.game-action').click();
    // Normal roulette animation lasts 1.5 seconds; the old exhaustion effect ended at 80 ms.
    await page.waitForTimeout(250);
    assert.equal(await page.locator('.post-shell').count(), 0, 'receipt interrupted the final result');
    const ping = page.getByRole('dialog', { name: 'Reality Ping', exact: true });
    await ping.waitFor({ timeout: 8_000 });
    assert.match(await ping.innerText(), /That's the 3 you chose/);
    assert.equal(await page.locator('.post-shell').count(), 0, 'receipt bypassed the final limit Ping');
    assert.equal((await page.locator('.game-action').innerText()).toLowerCase(), 'spin', 'Ping appeared before result settled');
    assert.equal(await page.locator('[role="dialog"][aria-modal="true"]:visible').count(), 1);
    await ping.getByRole('button', { name: 'Got it', exact: true }).click();
    await page.locator('.post-shell[data-stage="exit-receipt"]').waitFor();
    const facts = await page.locator('.exit-receipt').innerText();
    assert.match(facts, /3\s+rounds/i);
    assert.match(facts, /\$0\s+ended/i);
  });

  await check('X-Ray and Run 10000 share one foreground and restore the X-Ray', {
    actionCount: 2, balanceCents: 8_000, previousBalanceCents: 9_000,
    consecutiveLosses: 2, lastNetCents: -1_000,
  }, async page => {
    await page.locator('.game-action').click();
    const xray = page.getByRole('dialog', { name: 'X-Ray', exact: true });
    await xray.waitFor({ timeout: 8_000 });
    const original = await xray.locator('strong').first().innerText();
    await xray.getByRole('button', { name: 'Run 10,000', exact: true }).click();
    const longRun = page.getByRole('dialog', { name: '10,000 run view', exact: true });
    await longRun.waitFor();
    assert.equal(await page.locator('[role="dialog"][aria-modal="true"]:visible').count(), 1,
      'X-Ray remained an active modal behind Run 10000');
    await longRun.getByRole('button', { name: 'Close', exact: true }).click();
    await xray.waitFor();
    assert.equal(await xray.locator('strong').first().innerText(), original);
    assert.equal(await page.locator('[role="dialog"][aria-modal="true"]:visible').count(), 1);
    await xray.getByRole('button', { name: 'Got it', exact: true }).click();
    await xray.waitFor({ state: 'hidden' });
    assert.equal(await page.locator('.game-action').isEnabled(), true);
  });
  console.log('Engine regression browser checks passed.');
} finally {
  await browser.close();
}
