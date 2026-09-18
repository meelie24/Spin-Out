import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const out = 'qa-artifacts';
await fs.mkdir(out, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
try {
  // Keep six independent anonymous sessions active long enough to exercise the live counter.
  const counterContexts = [];
  for (let i = 0; i < 6; i++) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    counterContexts.push(context);
  }
  const firstCounterPage = counterContexts[0].pages()[0];
  await firstCounterPage.waitForTimeout(900);
  await firstCounterPage.reload({ waitUntil: 'networkidle' });
  const counterText = await firstCounterPage.locator('.journey-counter').textContent();
  assert(counterText?.includes('5 people are on this journey with you'), `unexpected live presence text: ${counterText}`);
  for (const c of counterContexts) await c.close();

  const sizes = [
    ['desktop', 1440, 900],
    ['mobile-390', 390, 844],
    ['mobile-320', 320, 568],
  ];
  for (const [name, width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${out}/home-${name}.png`, fullPage: true });
    assert(await page.getByRole('link', { name: /^Start$/i }).isVisible(), `${name}: Start missing`);
    assert(await page.locator('body').evaluate(el => el.scrollWidth <= window.innerWidth + 1), `${name}: horizontal overflow`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
  });
  await page.goto(`${base}/play`, { waitUntil: 'networkidle' });

  // First-run setup. One decision per screen.
  await page.getByRole('button', { name: '$100' }).click();
  await page.getByRole('button', { name: /Slots/ }).click();
  await page.getByRole('button', { name: /Win it back/ }).click();
  await page.getByRole('textbox', { name: undefined }).first().fill('850').catch(() => {});
  const available = page.locator('input[name="available"]');
  await available.fill('850');
  await page.getByRole('button', { name: 'Use' }).click();
  await page.getByRole('button', { name: 'Next week' }).click();
  await page.getByRole('button', { name: /Car/ }).click();
  await page.locator('input[name="amount"]').fill('430');
  await page.getByRole('button', { name: 'This week' }).click();
  await page.getByRole('button', { name: /Lock it in/ }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('button', { name: 'Savings' }).click();
  await page.getByRole('button', { name: '8' }).click();

  await page.getByRole('button', { name: /Deposit \$100/ }).waitFor();
  await page.screenshot({ path: `${out}/fake-deposit-390.png`, fullPage: true });
  await page.getByRole('button', { name: /Deposit \$100/ }).click();
  await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${out}/run-390.png`, fullPage: true });
  const canvasBox = await page.locator('.phaser-stage canvas').boundingBox();
  assert(canvasBox && canvasBox.width > 300, 'Phaser canvas did not render at usable size');
  const cash = page.getByRole('button', { name: 'Cash Out' });
  assert(await cash.isVisible(), 'Cash Out missing');
  const cashBox = await cash.boundingBox();
  assert(cashBox && cashBox.y >= 0 && cashBox.y + cashBox.height <= 844, 'Cash Out is outside mobile viewport');
  let sawPing = false;
  for (let i = 0; i < 4; i++) {
    const action = page.locator('.game-action');
    await action.waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const button = document.querySelector('.game-action');
      return button instanceof HTMLButtonElement && !button.disabled;
    });
    await action.click();
    try {
      await page.waitForFunction(() => {
        const ping = document.querySelector('.reality-ping');
        const button = document.querySelector('.game-action');
        return Boolean(ping) || (button instanceof HTMLButtonElement && !button.disabled);
      }, null, { timeout: 5000 });
    } catch (error) {
      const state = await page.evaluate(() => {
        const button = document.querySelector('.game-action');
        return {
          buttonText: button?.textContent,
          buttonDisabled: button instanceof HTMLButtonElement ? button.disabled : null,
          ping: Boolean(document.querySelector('.reality-ping')),
          stageReady: document.querySelector('.phaser-stage')?.getAttribute('data-ready'),
        };
      });
      throw new Error(`Reality action stalled: ${JSON.stringify(state)} browserErrors=${JSON.stringify(browserErrors)} original=${error.message}`);
    }
    const ping = page.locator('.reality-ping');
    if (await ping.isVisible().catch(() => false)) {
      sawPing = true;
      const glass = await ping.evaluate(el => {
        const style = getComputedStyle(el);
        const inline = el instanceof HTMLElement ? (el.style.backdropFilter || el.style.webkitBackdropFilter || '') : '';
        return {
          computed: style.backdropFilter || style.webkitBackdropFilter || '',
          inline,
          background: style.backgroundImage || style.backgroundColor,
        };
      });
      await page.screenshot({ path: `${out}/reality-ping-390.png`, fullPage: true });
      assert(glass.computed.includes('blur') || glass.inline.includes('blur'), `Reality Ping glass blur missing: ${JSON.stringify(glass)}`);
      await ping.click();
      await page.waitForFunction(() => {
        const button = document.querySelector('.game-action');
        return button instanceof HTMLButtonElement && !button.disabled;
      });
    }
  }
  assert(browserErrors.length === 0, `browser errors: ${JSON.stringify(browserErrors)}`);
  assert(sawPing, 'Reality Ping did not appear within four actions');
  assert(await cash.isVisible(), 'Cash Out is not available after a Reality Ping');
  await cash.click();
  await page.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor();
  await page.getByRole('button', { name: '5' }).click();
  await page.getByRole('heading', { name: /Did you end up gambling/i }).waitFor();
  await page.getByRole('button', { name: 'No' }).click();
  await page.locator('.money-kept').waitFor();
  await page.screenshot({ path: `${out}/money-kept-390.png`, fullPage: true });
  await page.getByRole('button', { name: 'Spin Out+' }).click();
  await page.getByRole('heading', { name: /Keep the deeper history/i }).waitFor();
  assert(await page.getByText('$4.99').isVisible(), 'monthly Plus price missing');
  assert(await page.getByText('$29.99').isVisible(), 'yearly Plus price missing');
  assert(await page.getByText(/No fake payment button is shown/i).isVisible(), 'unconfigured billing state is not honest');
  assert(await page.getByRole('button', { name: /Preview Plus/i }).count() === 0, 'fake Plus preview control returned');
  await page.screenshot({ path: `${out}/plus-390.png`, fullPage: true });
  await page.getByRole('button', { name: 'Close' }).click();

  // Premium features sold in Plus must exist and render from the real saved run.
  await page.evaluate(() => {
    const raw = localStorage.getItem('spinout.v2');
    if (!raw) throw new Error('missing stored Spin Out data');
    const data = JSON.parse(raw);
    data.account = { ...data.account, billing: 'premium', paypalSubscriptionId: null, paypalPlan: null };
    localStorage.setItem('spinout.v2', JSON.stringify(data));
  });
  await page.goto(`${base}/plus`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Your patterns.' }).waitFor();
  assert(await page.getByText('Weekly readout').isVisible(), 'Plus weekly summary missing');
  assert(await page.getByText('Every saved run').isVisible(), 'Plus run history missing');
  assert(await page.getByText('Money kept', { exact: true }).first().isVisible(), 'Plus Money Kept trend missing');
  assert(await page.locator('body').evaluate(el => el.scrollWidth <= window.innerWidth + 1), 'Plus dashboard overflows mobile');
  await page.screenshot({ path: `${out}/plus-dashboard-390.png`, fullPage: true });
  await context.close();

  // Every Reality Run environment must mount and accept its core action without browser errors.
  for (const gameType of ['sports','casino','poker','lottery']) {
    const envContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await envContext.addInitScript(({ type }) => {
      const profile = {
        version: 1,
        intendedWagerCents: 10000,
        gamblingType: type,
        triggerType: 'win-it-back',
        triggerCustom: null,
        availableUntilIncomeCents: 85000,
        nextIncomeDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0,10),
        obligationType: 'car',
        obligationAmountCents: 43000,
        obligationDueDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0,10),
        recentLenderName: null,
        recentLenderAmountCents: null,
        personalMoneyGoal: 'Savings',
        startingUrge: 8,
        createdAt: new Date().toISOString(),
      };
      const run = {
        id: 'qa-' + type,
        startedAt: Date.now(),
        initialBalanceCents: 10000,
        balanceCents: 10000,
        previousBalanceCents: 10000,
        stakeCents: 1000,
        previousStakeCents: 1000,
        actionCount: 0,
        largestLossCents: 0,
        simulatedLossesCents: 0,
        simulatedRecoveriesCents: 0,
        lastNetCents: 0,
        lastPingAction: -10,
        pings: [],
      };
      localStorage.setItem('spinout.active.v2', JSON.stringify({ profile, run }));
    }, { type: gameType });
    const envPage = await envContext.newPage();
    const errors = [];
    envPage.on('pageerror', error => errors.push(error.message));
    await envPage.goto(`${base}/play`, { waitUntil: 'networkidle' });
    await envPage.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15000 });
    const action = envPage.locator('.game-action');
    await action.click();
    await envPage.waitForFunction(() => {
      const button = document.querySelector('.game-action');
      return button instanceof HTMLButtonElement && !button.disabled;
    }, null, { timeout: 5000 });
    assert(errors.length === 0, `${gameType} environment errors: ${JSON.stringify(errors)}`);
    await envPage.screenshot({ path: `${out}/environment-${gameType}-390.png`, fullPage: true });
    await envContext.close();
  }

  // Reduced motion remains playable.
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await reduced.newPage();
  await rp.goto(base, { waitUntil: 'networkidle' });
  assert(await rp.getByRole('link', { name: /^Start$/i }).isVisible(), 'reduced motion home failed');
  await reduced.close();
} finally {
  await browser.close();
}
