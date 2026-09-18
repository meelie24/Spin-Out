import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isoFromNow(days) {
  const d = new Date(Date.now() + days * 86_400_000);
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function profile(type = 'slots', patch = {}) {
  const now = new Date().toISOString();
  return {
    version: 1,
    intendedWagerCents: 10_000,
    gamblingType: type,
    triggerType: 'win-it-back',
    triggerCustom: null,
    availableUntilIncomeCents: 85_000,
    nextIncomeDate: isoFromNow(7),
    obligationType: 'car',
    obligationAmountCents: 43_000,
    obligationDueDate: isoFromNow(4),
    recentLenderName: null,
    recentLenderHelpedRecently: false,
    recentLenderAmountCents: null,
    personalMoneyGoal: 'Savings',
    additionalMoneyGoal: null,
    startingUrge: 8,
    financialContextUpdatedAt: now,
    createdAt: now,
    ...patch,
  };
}

function runFor(p, patch = {}) {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    initialBalanceCents: p.intendedWagerCents,
    balanceCents: p.intendedWagerCents,
    previousBalanceCents: p.intendedWagerCents,
    stakeCents: 1_000,
    previousStakeCents: 1_000,
    actionCount: 0,
    largestLossCents: 0,
    simulatedLossesCents: 0,
    simulatedRecoveriesCents: 0,
    lastNetCents: 0,
    lastPingAction: -10,
    pings: [],
    timeline: [],
    actionIntervalsMs: [],
    consecutiveLosses: 0,
    consecutiveWins: 0,
    lossesBeforeLastWin: 0,
    lastOutcomeBand: null,
    lastNearMiss: false,
    pingDismissalStreak: 0,
    chosenLimitRounds: null,
    chosenLimitMinutes: null,
    limitExceededAt: null,
    returnedAfterMs: null,
    totalStakedCents: 0,
    ...patch,
  };
}

async function seedActive(context, p, run) {
  await context.addInitScript(({ profile, run }) => {
    localStorage.setItem('spinout.active.v2', JSON.stringify({ profile, run }));
  }, { profile: p, run });
}

async function assertFocusInside(page, selector, label) {
  const ok = await page.locator(selector).evaluate(el => el.contains(document.activeElement));
  assert(ok, `${label}: keyboard focus did not move into the surface`);
}

const browser = await chromium.launch({ headless: true });

try {
  // Low-friction home prompts should stay dismissed for the current browser-tab visit.
  // A refresh or returning from a run should not immediately resurrect what the user just cleared.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const prompt = page.getByRole('button', { name: /What usually happens after “one more”.*Dismiss/i });
    await prompt.waitFor();
    await prompt.click();
    await prompt.waitFor({ state: 'detached' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert(await page.getByRole('button', { name: /What usually happens after “one more”.*Dismiss/i }).count() === 0,
      'dismissed homepage Reality Ping returned immediately after refresh');
    await context.close();
  }

  // Run 10,000 should be educational without telling the user to continue, and its dialog
  // should receive keyboard focus when it opens.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = profile('slots');
    await seedActive(context, p, runFor(p, { actionCount: 2, balanceCents: 8_000 }));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Run 10,000' }).click();
    await page.locator('.longrun-panel').waitFor();
    await assertFocusInside(page, '.longrun-panel', 'Run 10,000');
    await page.waitForTimeout(520);
    const text = await page.locator('.longrun-panel').innerText();
    assert(!/\bkeep going\b/i.test(text), 'Run 10,000 used directive "Keep going" copy');
    await context.close();
  }

  // Ordinary Reality Ping should take focus instead of leaving the keyboard on the disabled game control.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = profile('slots', {
      triggerType: 'other',
      availableUntilIncomeCents: null,
      nextIncomeDate: null,
      obligationType: 'none',
      obligationAmountCents: null,
      obligationDueDate: null,
      personalMoneyGoal: null,
    });
    await seedActive(context, p, runFor(p, {
      actionCount: 2,
      chosenLimitRounds: 3,
      lastPingAction: -10,
    }));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.locator('.game-action').click();
    await page.locator('.reality-ping').waitFor({ timeout: 9_000 });
    await assertFocusInside(page, '.reality-ping', 'Reality Ping');
    await context.close();
  }

  // X-Ray should also take focus when stake escalation interrupts the run.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = profile('slots', {
      triggerType: 'other',
      availableUntilIncomeCents: null,
      nextIncomeDate: null,
      obligationType: 'none',
      obligationAmountCents: null,
      obligationDueDate: null,
      personalMoneyGoal: null,
    });
    await seedActive(context, p, runFor(p, {
      balanceCents: 9_000,
      previousBalanceCents: 10_000,
      stakeCents: 1_000,
      previousStakeCents: 1_000,
      actionCount: 3,
      lastNetCents: -1_000,
      lastPingAction: 0,
      consecutiveLosses: 1,
    }));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Raise practice stake' }).click();
    await page.locator('.xray-moment').waitFor({ timeout: 5_000 });
    await assertFocusInside(page, '.xray-moment', 'X-Ray');
    await context.close();
  }

  // My Reality is a real dialog, so keyboard focus should enter it when opened.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = profile('slots');
    await context.addInitScript(({ profile }) => {
      localStorage.setItem('spinout.v2', JSON.stringify({
        version: 2,
        profile,
        runs: [],
        pingLearning: {},
        events: [],
        account: {},
      }));
    }, { profile: p });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'My reality' }).first().click();
    await page.locator('.reality-context-dialog').waitFor();
    await assertFocusInside(page, '.reality-context-dialog', 'My Reality');
    await context.close();
  }

  // A self-reported "No" can support "money kept", but the product should not claim
  // that money is protected from future gambling.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = profile('slots');
    await seedActive(context, p, runFor(p));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: "I'm done" }).click();
    await page.getByText(/You left\./i).waitFor();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('heading', { name: /Did you end up gambling/i }).waitFor();
    await page.getByRole('button', { name: 'No', exact: true }).click();
    await page.locator('.money-kept').waitFor();
    const summary = await page.locator('.post-card').innerText();
    assert(!/\bPROTECTED\b/.test(summary), 'post-run summary overclaimed that self-reported money was protected');
    assert(/\bAVAILABLE\b/i.test(summary), 'post-run summary did not use truthful availability language');
    await context.close();
  }

  console.log('Round 2 user testing passed.');
} finally {
  await browser.close();
}
