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
  const due = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
  await page.locator('input[name="due"]').fill(due);
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
  await page.getByRole('button', { name: /^Spin$/ }).click();
  await page.waitForTimeout(1200);
  await cash.click();
  await page.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor();
  await page.getByRole('button', { name: '5' }).click();
  await page.getByRole('heading', { name: /Did you end up gambling/i }).waitFor();
  await page.getByRole('button', { name: 'No' }).click();
  await page.locator('.money-kept').waitFor();
  await page.screenshot({ path: `${out}/money-kept-390.png`, fullPage: true });
  await context.close();

  // Reduced motion remains playable.
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await reduced.newPage();
  await rp.goto(base, { waitUntil: 'networkidle' });
  assert(await rp.getByRole('link', { name: /^Start$/i }).isVisible(), 'reduced motion home failed');
  await reduced.close();
} finally {
  await browser.close();
}
