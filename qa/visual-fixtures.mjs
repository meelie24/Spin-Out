import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

if (process.env.QA_VISUAL_FIXTURES !== '1') throw new Error('CI visual fixtures must be explicitly enabled');
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
if (new URL(base).hostname !== '127.0.0.1') throw new Error('Fixture QA requires the local test server');
const browser = await chromium.launch({ headless: true });
const evidence = [];
try {
  for (const state of ['history', 'trial', 'empty']) {
    for (const width of [320, 390, 430, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${base}/qa-plus-fixture?state=${state}`, { waitUntil: 'domcontentloaded' });
        await page.getByRole('heading', { name: 'Your history.', exact: true }).waitFor();
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (overflow > 1 || errors.length) throw new Error(`Plus ${state}/${width}: overflow=${overflow}, errors=${JSON.stringify(errors)}`);
        const axe = await new AxeBuilder({ page }).analyze();
        const serious = axe.violations.filter(item => ['critical', 'serious'].includes(item.impact));
        if (serious.length) throw new Error(`Plus ${state}/${width}: ${JSON.stringify(serious.map(item => ({ id: item.id, nodes: item.nodes.length })))}`);
        const expectedRows = state === 'empty' ? 0 : 10;
        if (await page.locator('.run-history article').count() !== expectedRows) throw new Error('Plus fixture history count differs');
        await page.screenshot({ path: `qa-artifacts/plus-${state}-fixture-${width}.png`, fullPage: true, animations: 'disabled' });
        evidence.push({ state, width, historyRows: expectedRows, overflow, seriousAxeViolations: 0, source: 'actual PlusDashboard component with synthetic props; auth and payment are not exercised' });
      } finally { await context.close(); }
    }
  }
  await fs.writeFile('qa-artifacts/plus-fixture-evidence.json', JSON.stringify(evidence, null, 2));
} finally { await browser.close(); }
