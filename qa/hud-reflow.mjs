import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use the local QA server');
await fs.mkdir('qa-artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [320, 390, 430]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      await page.goto(base + '/play?game=slots');
      for (const label of ['$100', 'Win back what I lost', 'Car payment', '8', '10 rounds', 'Start Reality Run']) {
        await page.getByRole('button', { name: label, exact: true }).click();
      }
      await page.locator('.phaser-stage[data-ready="true"]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => {
        const leaves = [...document.querySelectorAll('.run-hud span, .run-hud strong')];
        for (const node of leaves) node.style.setProperty('font-size', parseFloat(getComputedStyle(node).fontSize) * 2 + 'px', 'important');
      });
      const measured = await page.evaluate(() => {
        const hud = document.querySelector('.run-hud');
        const rect = hud.getBoundingClientRect();
        const fields = [...hud.querySelectorAll(':scope > div')];
        const ranges = fields.flatMap((field, index) => [...field.querySelectorAll('span,strong')].map(node => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const r = range.getBoundingClientRect();
          return { text: node.textContent, field: index, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        }));
        const collisions = ranges.flatMap((a, index) => ranges.slice(index + 1).filter(b =>
          a.field !== b.field && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
          && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        ).map(b => [a.text, b.text]));
        const outside = ranges.filter(r => r.left < rect.left - 1 || r.right > rect.right + 1 || r.top < rect.top - 1 || r.bottom > rect.bottom + 1);
        return { collisions, outside, horizontalOverflow: document.documentElement.scrollWidth - innerWidth, hudHeight: rect.height };
      });
      await page.screenshot({ path: 'qa-artifacts/hud-text-200-' + width + '.png', fullPage: true, animations: 'disabled' });
      results.push({ width, ...measured });
    } finally { await context.close(); }
  }
  await fs.writeFile('qa-artifacts/hud-text-evidence.json', JSON.stringify(results, null, 2));
  assert(results.every(r => !r.collisions.length && !r.outside.length && r.horizontalOverflow <= 1),
    'Enlarged HUD labels collide or leave the HUD: ' + JSON.stringify(results));
  console.log('PASS enlarged HUD keeps every label and value distinct at 320, 390 and 430 pixels');
} finally { await browser.close(); }
