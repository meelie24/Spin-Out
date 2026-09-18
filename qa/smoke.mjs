import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const out = 'qa-artifacts';
await fs.mkdir(out, { recursive: true });

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
    stakeCents: Math.max(100, Math.round(p.intendedWagerCents * .1 / 100) * 100),
    previousStakeCents: Math.max(100, Math.round(p.intendedWagerCents * .1 / 100) * 100),
    actionCount: 0,
    largestLossCents: 0,
    simulatedLossesCents: 0,
    simulatedRecoveriesCents: 0,
    lastNetCents: 0,
    lastPingAction: -10,
    pings: [],
    timeline: [],
    ...patch,
  };
}

async function seedActive(context, p, run) {
  await context.addInitScript(({ profile, run }) => {
    localStorage.setItem('spinout.active.v2', JSON.stringify({ profile, run }));
  }, { profile: p, run });
}

async function noHorizontalOverflow(page, label) {
  const ok = await page.locator('body').evaluate(el => el.scrollWidth <= window.innerWidth + 1);
  assert(ok, `${label}: horizontal overflow`);
}

async function waitActionReady(page) {
  await page.waitForFunction(() => {
    const button = document.querySelector('.game-action');
    return button instanceof HTMLButtonElement && !button.disabled;
  }, null, { timeout: 7000 });
}

async function assertA11y(page, label) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  assert(serious.length === 0, `${label}: axe violations ${JSON.stringify(serious.map(v => ({ id:v.id, impact:v.impact, nodes:v.nodes.length })))}`);
}

const browser = await chromium.launch({ headless: true });
try {
  // Shared anonymous presence is verified when the production server secret is configured.
  // CI intentionally has no service-role secret, so an unconfigured response must fail closed.
  const presenceProbe = await fetch(`${base}/api/presence`, {
    method: 'POST',
    headers: { 'content-type':'application/json' },
    body: JSON.stringify({ id: 'qa-presence-probe-0001' }),
  }).catch(() => null);
  const presencePayload = presenceProbe ? await presenceProbe.json().catch(() => null) : null;

  if (presencePayload?.available === true) {
    const counterContexts = [];
    for (let i = 0; i < 6; i++) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      counterContexts.push(context);
    }
    const firstCounterPage = counterContexts[0].pages()[0];
    let counterText = '';
    for (let i = 0; i < 12; i++) {
      await firstCounterPage.reload({ waitUntil: 'domcontentloaded' });
      counterText = await firstCounterPage.locator('.journey-counter').textContent().catch(() => '') || '';
      if (/other people? (?:are|is) here right now/i.test(counterText)) break;
      await firstCounterPage.waitForTimeout(500);
    }
    assert(/other people? (?:are|is) here right now/i.test(counterText), `shared presence missing: ${counterText}`);
    const count = Number(counterText.match(/\d+/)?.[0] ?? 0);
    assert(count >= 5, `shared presence undercounted six sessions: ${counterText}`);
    for (const c of counterContexts) await c.close();
  } else {
    assert(presencePayload?.configured === false, 'presence failed for an unexpected reason');
  }

  // Presence failure must hide the number rather than invent one.
  const noPresence = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const np = await noPresence.newPage();
  await np.route('**/api/presence', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"available":false}' }));
  await np.goto(base, { waitUntil: 'domcontentloaded' });
  await np.waitForTimeout(250);
  assert(await np.locator('.journey-counter').count() === 0, 'presence failure displayed a count');
  await noPresence.close();

  // Required responsive matrix.
  const sizes = [
    ['mobile-320', 320, 568],
    ['mobile-375', 375, 667],
    ['mobile-390', 390, 844],
    ['mobile-430', 430, 932],
    ['tablet-768', 768, 1024],
    ['laptop-1024', 1024, 768],
    ['desktop-1440', 1440, 900],
  ];
  for (const [name, width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /Enter Reality Run/i }).first().waitFor();
    assert(await page.getByRole('link', { name: /Enter Reality Run/i }).count() === 6, `${name}: homepage did not expose all six game choices`);
    await noHorizontalOverflow(page, name);
    await page.screenshot({ path: `${out}/home-${name}.png`, fullPage: true });
    if (name === 'desktop-1440' || name === 'mobile-390') await assertA11y(page, name);
    await context.close();
  }

  // Homepage hub behavior: intervention cards dismiss and game tiles preselect the run type.
  const hubContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const hubPage = await hubContext.newPage();
  await hubPage.goto(base, { waitUntil: 'domcontentloaded' });
  const moneyPrompt = hubPage.getByRole('button', { name: /That money already has a job/i });
  await moneyPrompt.waitFor();
  await moneyPrompt.click();
  await hubPage.waitForTimeout(300);
  assert(await moneyPrompt.count() === 0, 'homepage intervention did not dismiss');
  await hubPage.locator('a[href="/play?game=slots"]').click();
  await hubPage.getByRole('heading', { name: /How much were you about to put in/i }).waitFor();
  await hubPage.getByRole('button', { name: '$100' }).click();
  await hubPage.getByRole('heading', { name: /What’s pulling you in/i }).waitFor();
  assert(await hubPage.getByRole('button', { name: /Slots/i }).count() === 0, 'homepage game preselection did not skip the redundant game question');
  await hubContext.close();

  // Real auth UI: keyboard focus, Escape, focus return. No simulated sign-in state.
  const authContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const authPage = await authContext.newPage();
  await authPage.goto(base, { waitUntil: 'domcontentloaded' });
  const signIn = authPage.getByRole('button', { name: 'Sign in' });
  await signIn.waitFor();
  await signIn.click();
  const authDialog = authPage.getByRole('dialog', { name: 'Sign in' });
  await authDialog.waitFor();
  assert(await authPage.evaluate(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement)), 'auth dialog did not receive focus');
  await authPage.keyboard.press('Escape');
  assert(await authDialog.count() === 0, 'Escape did not close auth dialog');
  assert(await signIn.evaluate(el => document.activeElement === el), 'auth focus did not return to trigger');
  await authContext.close();

  // Full first-run flow on mobile.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`); });
  await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: '$100' }).click();
  await page.getByRole('button', { name: /Slots/ }).click();
  await page.getByRole('button', { name: /Win it back/ }).click();
  await page.locator('input[name="available"]').fill('850');
  await page.getByRole('button', { name: 'Use' }).click();
  await page.getByRole('button', { name: 'Next week' }).click();
  await page.getByRole('button', { name: /^Car$/ }).click();
  await page.locator('input[name="amount"]').fill('430');
  await page.getByRole('button', { name: 'This week' }).click();
  await page.getByRole('button', { name: /Lock it in/ }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('button', { name: 'Savings' }).click();
  await page.getByRole('button', { name: '8' }).click();

  const loadButton = page.getByRole('button', { name: /Load \$100/ });
  await loadButton.waitFor();
  await page.screenshot({ path: `${out}/transition-390.png`, fullPage: true });
  await loadButton.click();
  await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await noHorizontalOverflow(page, 'Reality Run 390');
  const canvasBox = await page.locator('.phaser-stage canvas').boundingBox();
  assert(canvasBox && canvasBox.width > 300, 'Phaser canvas did not render at usable mobile size');

  const cash = page.getByRole('button', { name: 'Cash Out' });
  await cash.waitFor();
  const cashBox = await cash.boundingBox();
  assert(cashBox && cashBox.y >= 0 && cashBox.y + cashBox.height <= 844, 'Cash Out outside mobile viewport');
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await page.getByRole('button', { name: 'Unmute sound' }).waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: 'Unmute sound' }).waitFor();
  await page.screenshot({ path: `${out}/run-390.png`, fullPage: true });
  await page.getByRole('button', { name: 'Cash Out' }).click();
  await page.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor();
  await page.getByRole('button', { name: '5' }).click();
  await page.getByRole('heading', { name: /Did you end up gambling/i }).waitFor();
  await page.getByRole('button', { name: 'No' }).click();
  await page.locator('.money-kept').waitFor();
  await page.screenshot({ path: `${out}/money-kept-390.png`, fullPage: true });

  // Post-run Plus placement is allowed, but signed-out users cannot buy/unlock Plus.
  await page.getByRole('button', { name: 'Spin Out+' }).click();
  await page.getByRole('heading', { name: /Full history and trends/i }).waitFor();
  assert(await page.getByText(/Sign in to claim the one-run Plus trial or subscribe/i).isVisible(), 'Plus did not require real auth');
  await page.getByRole('button', { name: 'Close' }).click();

  // Editing localStorage must not unlock /plus.
  await page.evaluate(() => {
    const raw = localStorage.getItem('spinout.v2');
    const data = raw ? JSON.parse(raw) : { version: 2, runs: [], pingLearning: {}, events: [] };
    data.account = { signedIn: true, email: 'fake@example.com', billing: 'premium', paypalSubscriptionId: 'FAKE', paypalPlan: 'yearly' };
    localStorage.setItem('spinout.v2', JSON.stringify(data));
  });
  await page.goto(`${base}/plus`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Your full history/i }).waitFor();
  assert(await page.getByText(/Sign in to claim your one-run Plus trial or use paid Plus across devices/i).isVisible(), 'localStorage unlocked Plus');
  assert(await page.getByRole('heading', { name: /Your history\./i }).count() === 0, 'premium dashboard rendered without server entitlement');
  await context.close();

  // Deterministic Reality Ping from a restored losing state; keyboard dismissal must work immediately.
  const pingContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pingProfile = profile('slots', { intendedWagerCents: 10_000, availableUntilIncomeCents: 6_000, obligationAmountCents: 8_000 });
  const pingRun = runFor(pingProfile, { balanceCents: 5_000, previousBalanceCents: 5_500, stakeCents: 500, previousStakeCents: 500, actionCount: 2, largestLossCents: 5_000, simulatedLossesCents: 5_000 });
  await seedActive(pingContext, pingProfile, pingRun);
  const pingPage = await pingContext.newPage();
  await pingPage.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await pingPage.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await waitActionReady(pingPage);
  await pingPage.locator('.game-action').click();
  const ping = pingPage.locator('.reality-ping');
  await ping.waitFor({ timeout: 7000 });
  await pingPage.screenshot({ path: `${out}/reality-ping-390.png`, fullPage: true });
  await ping.focus();
  await pingPage.keyboard.press('Enter');
  await ping.waitFor({ state: 'detached' });
  await pingContext.close();

  // First-run alternate path: unknown cash/income, no urgent obligation, lender+goal skipped.
  const unknownContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const unknown = await unknownContext.newPage();
  await unknown.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await unknown.getByRole('button', { name: '$20', exact: true }).click();
  await unknown.getByRole('button', { name: /Slots/ }).click();
  await unknown.getByRole('button', { name: /Bored/ }).click();
  await unknown.getByRole('button', { name: 'Not sure' }).click();
  await unknown.getByRole('button', { name: 'Not sure' }).click();
  await unknown.getByRole('button', { name: /Nothing urgent/ }).click();
  await unknown.getByRole('heading', { name: /If you came up short/i }).waitFor();
  await unknown.getByRole('button', { name: 'Skip' }).click();
  await unknown.getByRole('button', { name: 'Skip' }).click();
  await unknown.getByRole('button', { name: '3' }).click();
  await unknown.getByRole('button', { name: /Load \$20/ }).waitFor();
  await unknownContext.close();

  // Stale returning financial context must be refreshed without full onboarding.
  const staleContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await staleContext.addInitScript(({ p }) => {
    localStorage.setItem('spinout.v2', JSON.stringify({ version:2, profile:p, runs:[], pingLearning:{}, events:[], account:{} }));
  }, { p: profile('slots', { nextIncomeDate: isoFromNow(-1), obligationDueDate: isoFromNow(-1), financialContextUpdatedAt: new Date(Date.now() - 3 * 86_400_000).toISOString() }) });
  const stale = await staleContext.newPage();
  await stale.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await stale.getByRole('button', { name: '$50', exact: true }).click();
  await stale.getByRole('button', { name: /Win it back/ }).click();
  await stale.getByRole('heading', { name: /How much have you actually got/i }).waitFor();
  await stale.screenshot({ path: `${out}/stale-returning-390.png`, fullPage: true });
  await staleContext.close();

  // Custom wager extremes.
  for (const [label, amount] of [['small','1'],['large','10000']]) {
    const customContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const custom = await customContext.newPage();
    await custom.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await custom.getByRole('textbox', { name: 'Other wager amount' }).fill(amount);
    await custom.getByRole('button', { name: 'Use' }).click();
    await custom.getByRole('heading', { name: /What were you about to play/i }).waitFor();
    await custom.screenshot({ path: `${out}/custom-${label}-390.png`, fullPage: true });
    await customContext.close();
  }

  // Restored active run survives refresh.
  const restoreContext = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const restoreProfile = profile('slots');
  const restoreRun = runFor(restoreProfile);
  await seedActive(restoreContext, restoreProfile, restoreRun);
  const restore = await restoreContext.newPage();
  await restore.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await restore.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await restore.reload({ waitUntil: 'domcontentloaded' });
  await restore.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await restoreContext.close();

  // A second tab cannot independently control the same active run.
  const multiContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const multiProfile = profile('slots');
  const multiRun = runFor(multiProfile);
  await seedActive(multiContext, multiProfile, multiRun);
  const tab1 = await multiContext.newPage();
  await tab1.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await tab1.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  const tab2 = await multiContext.newPage();
  await tab2.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  const lock2 = tab2.getByRole('dialog', { name: /open in another tab/i });
  await lock2.waitFor({ timeout: 5000 });
  await lock2.getByRole('button', { name: 'Use this tab' }).click();
  await tab1.getByRole('dialog', { name: /open in another tab/i }).waitFor({ timeout: 5000 });
  await multiContext.close();

  // Restored balance exhaustion ends cleanly.
  const exhaustedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const exhaustedProfile = profile('slots');
  const exhaustedRun = runFor(exhaustedProfile, { balanceCents: 50, previousBalanceCents: 100, stakeCents: 500, previousStakeCents: 500 });
  await seedActive(exhaustedContext, exhaustedProfile, exhaustedRun);
  const exhausted = await exhaustedContext.newPage();
  await exhausted.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await exhausted.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor({ timeout: 5000 });
  await exhaustedContext.close();

  // 15-minute timeout ends without being counted as a voluntary exit.
  const timeoutContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const timeoutProfile = profile('slots');
  const timeoutRun = runFor(timeoutProfile, { startedAt: Date.now() - 901_000 });
  await seedActive(timeoutContext, timeoutProfile, timeoutRun);
  const timeout = await timeoutContext.newPage();
  await timeout.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await timeout.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor({ timeout: 5000 });
  await timeoutContext.close();

  // Every environment mounts and completes its actual game-specific interaction loop.
  for (const gameType of ['slots','sports','casino','poker','lottery','other']) {
    const envContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = profile(gameType);
    const r = runFor(p);
    await seedActive(envContext, p, r);
    const envPage = await envContext.newPage();
    const errors = [];
    envPage.on('pageerror', error => errors.push(error.message));
    await envPage.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await envPage.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });

    if (gameType === 'sports') {
      await envPage.getByRole('button', { name: /Cedar City/ }).click();
    }
    if (gameType === 'casino') {
      await envPage.getByRole('button', { name: 'Black' }).click();
    }

    await waitActionReady(envPage);
    await envPage.locator('.game-action').evaluate(button => {
      for (let i = 0; i < 10; i++) button.click();
    });

    if (gameType === 'poker') {
      await envPage.waitForTimeout(380);
      const dealt = await envPage.evaluate(() => JSON.parse(localStorage.getItem('spinout.active.v2') || 'null'));
      assert(dealt?.run?.gameState?.poker, 'poker rapid input did not produce one held-hand state');
      assert(dealt.run.balanceCents === dealt.run.initialBalanceCents - dealt.run.gameState.poker.wagerCents, 'poker rapid input deducted more than one deal');

      await envPage.locator('.poker-holds button').first().waitFor({ timeout: 5000 });
      await envPage.locator('.poker-holds button').first().click();
      await envPage.getByRole('button', { name: 'Draw' }).waitFor({ timeout: 5000 });
      await envPage.getByRole('button', { name: 'Draw' }).click();
    } else {
      await envPage.waitForFunction(() => {
        const raw = localStorage.getItem('spinout.active.v2');
        const active = raw ? JSON.parse(raw) : null;
        return active?.run?.actionCount === 1;
      }, null, { timeout: gameType === 'casino' ? 9000 : 7000 });
      const active = await envPage.evaluate(() => JSON.parse(localStorage.getItem('spinout.active.v2') || 'null'));
      assert(active?.run?.actionCount === 1, `${gameType} rapid input created duplicate actions`);
    }

    await envPage.waitForFunction(() => {
      const ping = document.querySelector('.reality-ping');
      const button = document.querySelector('.game-action');
      return Boolean(ping) || (button instanceof HTMLButtonElement && !button.disabled);
    }, null, { timeout: gameType === 'casino' ? 9000 : 7000 });

    assert(errors.length === 0, `${gameType} environment errors: ${JSON.stringify(errors)}`);
    await envPage.screenshot({ path: `${out}/environment-${gameType}-390.png`, fullPage: true });

    const beforeReload = await envPage.evaluate(() => JSON.parse(localStorage.getItem('spinout.active.v2') || 'null')?.run || null);
    assert(beforeReload, `${gameType} active run missing before refresh`);
    const persistedState = await envContext.storageState();
    for (const origin of persistedState.origins || []) {
      origin.localStorage = (origin.localStorage || []).filter(item => item.name !== 'spinout.run.lease.v1');
    }
    await envContext.close();

    const restoreGameContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      storageState: persistedState,
    });
    const restoreGamePage = await restoreGameContext.newPage();
    await restoreGamePage.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await restoreGamePage.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
    const afterReload = await restoreGamePage.evaluate(() => JSON.parse(localStorage.getItem('spinout.active.v2') || 'null')?.run || null);
    assert(afterReload?.balanceCents === beforeReload.balanceCents, `${gameType} balance changed on restore: ${beforeReload.balanceCents} → ${afterReload?.balanceCents}`);
    assert(afterReload?.actionCount === beforeReload.actionCount, `${gameType} action count changed on restore: ${beforeReload.actionCount} → ${afterReload?.actionCount}`);
    await restoreGameContext.close();
  }

  // Reduced motion stays playable.
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedProfile = profile('slots');
  await seedActive(reduced, reducedProfile, runFor(reducedProfile));
  const rp = await reduced.newPage();
  await rp.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await rp.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await waitActionReady(rp);
  await rp.locator('.game-action').click();
  await rp.waitForFunction(() => {
    const ping = document.querySelector('.reality-ping');
    const button = document.querySelector('.game-action');
    return Boolean(ping) || (button instanceof HTMLButtonElement && !button.disabled);
  }, null, { timeout: 4000 });
  await reduced.close();

  // Forced colors remains understandable.
  const contrast = await browser.newContext({ viewport: { width: 390, height: 844 }, forcedColors: 'active' });
  const cp = await contrast.newPage();
  await cp.goto(base, { waitUntil: 'domcontentloaded' });
  await cp.getByRole('link', { name: /Enter Reality Run/i }).first().waitFor();
  await noHorizontalOverflow(cp, 'forced colors');
  await contrast.close();

  // Slow network still reaches the primary action.
  const slow = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const sp = await slow.newPage();
  await sp.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, 60));
    await route.continue();
  });
  await sp.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await sp.getByRole('link', { name: /Enter Reality Run/i }).first().waitFor();
  await slow.close();

  assert(browserErrors.length === 0, `first-run browser errors: ${JSON.stringify(browserErrors)}`);
} finally {
  await browser.close();
}
