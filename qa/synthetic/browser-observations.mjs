import path from 'node:path';

const INTENT = {
  'escape/coping': 'Shut my brain off for a bit', chasing: 'Win back what I lost',
  financial: 'Win some money', excitement: 'Feel something',
};

function isoInDays(days) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function returningFixture(person) {
  const now = new Date().toISOString();
  return {
    version: 2, runs: [], pingLearning: {}, events: [], account: {},
    profile: {
      version: 1, intendedWagerCents: 10000, gamblingType: person.game,
      triggerType: 'win-it-back', triggerCustom: null, obligationType: 'car',
      obligationAmountCents: person.truth.obligationAmountCents,
      obligationDueDate: isoInDays(5), nextIncomeDate: isoInDays(7),
      availableUntilIncomeCents: person.truth.availableUntilIncomeCents,
      recentLenderName: null, recentLenderHelpedRecently: false,
      recentLenderAmountCents: null, personalMoneyGoal: null,
      additionalMoneyGoal: null, startingUrge: person.urge,
      financialContextUpdatedAt: now, createdAt: now,
      onboardingCompleted: ['income-date', 'available-money', 'obligation-amount', 'obligation-date'],
    },
  };
}

export function localBase(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password) {
    throw new Error('Synthetic browser journeys require an unauthenticated loopback HTTP test server');
  }
  return url.origin;
}

export async function measureSurface(page, surface) {
  return page.evaluate(surfaceName => {
    const visible = element => {
      const rect = element.getBoundingClientRect();
      return getComputedStyle(element).visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const rectFor = selector => {
      const element = document.querySelector(selector);
      if (!element || !visible(element)) return null;
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
    };
    const dock = document.querySelector('.in-run-setup');
    const dockRect = rectFor('.in-run-setup');
    const title = document.querySelector('.setup-question-title');
    const buttons = [...document.querySelectorAll('button')].filter(visible).map(button => {
      const r = button.getBoundingClientRect();
      return { text: button.getAttribute('aria-label') || button.innerText.trim(), width: r.width, height: r.height, disabled: button.disabled, x: r.x, y: r.y };
    });
    const coveredControls = [];
    for (const selector of ['.game-action', '.cashout-button', '.stake-control']) {
      const r = rectFor(selector);
      if (r && dockRect && r.x < dockRect.right && r.right > dockRect.x && r.y < dockRect.bottom && r.bottom > dockRect.y) coveredControls.push(selector);
    }
    return {
      surface: surfaceName, evidenceType: 'measured DOM geometry', width: innerWidth, height: innerHeight,
      horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      dock: dockRect ? { ...dockRect, state: dock.getAttribute('data-state'), scrollHeight: dock.scrollHeight, clientHeight: dock.clientHeight, scrollWidth: dock.scrollWidth, clientWidth: dock.clientWidth, position: getComputedStyle(dock).position, overflowY: getComputedStyle(dock).overflowY } : null,
      question: title ? { text: title.textContent, scrollHeight: title.scrollHeight, clientHeight: title.clientHeight, fontFamily: getComputedStyle(title).fontFamily } : null,
      buttons, coveredControls,
    };
  }, surface);
}

async function storage(page) {
  return page.evaluate(() => {
    const read = key => JSON.parse(localStorage.getItem(key) || 'null');
    return { data: read('spinout.v2'), active: read('spinout.active.v2') };
  });
}

function questionSpec(title, person) {
  const t = person.truth;
  if (/money coming in/i.test(title)) return { key: 'income-date', field: 'nextIncomeDate', kind: 'date', answer: person.contextAvailability === 'limited' ? 'Not sure' : t.incomeChoice };
  if (/have to work with/i.test(title)) return { key: 'available-money', field: 'availableUntilIncomeCents', kind: 'money', value: t.availableUntilIncomeCents, unknown: person.contextAvailability === 'limited' };
  if (/You said.*How much/i.test(title)) return { key: 'obligation-amount', field: 'obligationAmountCents', kind: 'money', value: t.obligationAmountCents };
  if (/have to be paid/i.test(title)) return { key: 'obligation-date', field: 'obligationDueDate', kind: 'date', answer: t.obligationDateChoice };
  if (/stop from happening/i.test(title)) return { key: 'quit-reason', field: 'quitReason', kind: 'text', value: t.quitReason };
  if (/rather this money/i.test(title)) return { key: 'money-goal', field: 'personalMoneyGoal', kind: 'choice', answer: t.personalMoneyGoal, value: t.personalMoneyGoal };
  if (/harder to ignore/i.test(title)) return { key: 'difficult-times', field: 'difficultTimes', kind: 'choice', answer: "When I'm stressed", value: ['stressed'] };
  if (/who would you probably call/i.test(title)) return { key: 'lender-name', field: 'recentLenderName', kind: 'text', value: t.lenderName };
  if (/had to help you recently/i.test(title)) return { key: 'lender-helped', field: 'recentLenderHelpedRecently', kind: 'choice', answer: 'Yeah', value: true };
  if (/did they have to cover/i.test(title)) return { key: 'lender-amount', field: 'recentLenderAmountCents', kind: 'money', value: t.lenderAmountCents };
  if (/When payday hits/i.test(title)) return { key: 'payday-plan', field: 'paydayPlanActions', kind: 'choice', answer: t.paydayChoice, value: ['move-bill-money'] };
  throw new Error(`Unsupported observed question; no guessed selector: ${title}`);
}

function dateValue(label) {
  const days = { Today: 0, Tomorrow: 1, 'This week': 5, 'Next week': 7 };
  if (label === 'Not sure') return null;
  if (!(label in days)) throw new Error(`Unsupported date answer: ${label}`);
  return isoInDays(days[label]);
}

export async function runJourney(browser, base, person, { artifactDirectory, captureScreenshots = false }) {
  const result = {
    id: person.id, evidenceType: 'scripted browser journey', viewport: person.viewport, game: person.game,
    status: 'running', reachedGame: false, preGameAbandonment: false, preGameActions: 0,
    secondsToGame: null, actions: [], optionalAnswers: [], measurements: [],
    notNowClicks: 0, reopenClicks: 0, playClicks: 0, observedPings: [],
    strongInterventionExit: false, reloadVerified: null, errors: [], pageErrors: [],
    networkIsolation: { blockedRequests: 0, policy: 'All non-GET, API, and foreign-origin requests blocked; no authenticated profile.' },
    policy: person.policy,
  };
  const context = await browser.newContext({ viewport: person.viewport, reducedMotion: person.reducedMotion ? 'reduce' : 'no-preference', timezoneId: 'UTC', serviceWorkers: 'block' });
  let page;
  try {
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== base || request.method() !== 'GET' || url.pathname.startsWith('/api/')) {
        result.networkIsolation.blockedRequests++;
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{"available":false,"error":"isolated synthetic QA"}' });
      } else await route.continue();
    });
    if (person.returning) {
      await context.addInitScript(fixture => {
        if (!localStorage.getItem('spinout.v2')) localStorage.setItem('spinout.v2', JSON.stringify(fixture));
      }, returningFixture(person));
    }
    page = await context.newPage();
    page.setDefaultTimeout(6000);
    page.on('pageerror', error => result.pageErrors.push(error.message));
    const began = performance.now();
    async function click(locator, label, phase) {
      await locator.click();
      result.actions.push({ phase, action: 'click', label, elapsedMs: Math.round(performance.now() - began) });
    }
    await page.goto(`${base}/play?game=${person.game}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.locator('.setup-panel h1').waitFor();
    while (!await page.locator('.run-intro').isVisible()) {
      if (result.preGameActions >= person.policy.preGameActionBudget) {
        result.preGameAbandonment = true;
        result.status = 'policy-abandonment';
        result.abandonmentExplanation = 'Frozen action budget exhausted; this is modeled behavior executed in a browser, not observed human abandonment.';
        result.measurements.push(await measureSurface(page, 'abandonment'));
        if (result.pageErrors.length) result.status = 'failed';
        return result;
      }
      const heading = (await page.locator('.setup-panel h1').innerText()).trim();
      let answer;
      if (/How much were you about to put in/i.test(heading)) answer = person.truth.wagerLabel;
      else if (/What were you hoping/i.test(heading)) answer = INTENT[person.motive];
      else if (/Realistically, what is this money for/i.test(heading)) answer = 'Car payment';
      else if (/How bad do you want to play right now/i.test(heading)) answer = String(person.urge);
      else if (/where do you want to stop/i.test(heading)) answer = '5 rounds';
      else throw new Error(`Unexpected required entry question: ${heading}`);
      await click(page.getByRole('button', { name: answer, exact: true }), answer, 'entry');
      result.preGameActions++;
      await page.waitForFunction(previous => document.querySelector('.run-intro') || document.querySelector('.setup-panel h1')?.textContent?.trim() !== previous, heading);
    }
    await click(page.getByRole('button', { name: 'Start Reality Run', exact: true }), 'Start Reality Run', 'entry');
    result.startClickCount = 1;
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 20000 });
    result.reachedGame = true;
    result.secondsToGame = Math.round((performance.now() - began) / 10) / 100;
    result.initialState = await storage(page);
    result.measurements.push(await measureSurface(page, 'run-start'));
    if (captureScreenshots) {
      const filename = `${person.id}-${person.game}-${person.viewport.width}.png`;
      await page.screenshot({ path: path.join(artifactDirectory, filename), fullPage: true });
      result.screenshot = filename;
    }

    const dock = page.locator('.in-run-setup');
    if (person.policy.skipFirst && await dock.locator('.setup-not-now').isVisible()) {
      const before = await storage(page);
      await click(dock.locator('.setup-not-now'), 'Not now', 'optional');
      result.notNowClicks++;
      await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
      const after = await storage(page);
      result.skipPreservedProfile = JSON.stringify(before.data?.profile) === JSON.stringify(after.data?.profile);
      if (!result.skipPreservedProfile) result.errors.push('Not now changed the stored profile');
    }

    const answerBudget = person.policy.skipFirst && !person.policy.reopenAfterSkip ? 0 : person.policy.optionalAnswerBudget;
    for (let index = 0; index < answerBudget; index++) {
      if (!await dock.count()) break;
      if (await dock.getAttribute('data-state') === 'collapsed') {
        await click(dock.locator('.setup-rail'), 'Make it more immersive', 'optional');
        result.reopenClicks++;
      }
      const question = dock.locator('.setup-question-title');
      await question.waitFor();
      const title = (await question.innerText()).trim();
      const spec = questionSpec(title, person);
      result.measurements.push(await measureSurface(page, `optional:${spec.key}`));
      let selected = spec.answer;
      let expected = spec.value;
      let intended = spec.kind === 'date' ? dateValue(spec.answer) : spec.value;
      let guessed = false;
      if (spec.kind === 'text' || spec.kind === 'money') {
        if (spec.unknown) {
          selected = 'Not sure'; expected = null; intended = null;
          await click(dock.getByRole('button', { name: selected, exact: true }), selected, 'optional');
        } else {
          const value = String(spec.kind === 'money' ? spec.value / 100 : spec.value);
          await dock.locator('input').fill(value);
          result.actions.push({ phase: 'optional', action: 'fill', field: spec.field, value });
          await click(dock.getByRole('button', { name: 'Use', exact: true }), 'Use', 'optional');
        }
      } else {
        const target = dock.getByRole('button', { name: selected, exact: true });
        if (!await target.count() && person.policy.hiddenChoice === 'choose visible answer') {
          const first = dock.locator('.setup-choice-row button').filter({ hasNotText: /^(More|Back)$/ }).first();
          selected = (await first.innerText()).trim();
          guessed = true;
        } else {
          for (let pageIndex = 0; !await target.count() && pageIndex < 5; pageIndex++) {
            await click(dock.getByRole('button', { name: 'More', exact: true }), 'More', 'optional');
          }
        }
        if (spec.kind === 'date') expected = dateValue(selected);
        if (guessed && spec.kind === 'choice') {
          const values = { 'Emergency fund': 'Emergency fund', Family: 'Family', Debt: 'Debt', Savings: 'Savings', Payday: ['payday'], 'Friday night': ['friday-night'], 'Late at night': ['late-night'], 'Open Spin Out first': ['open-spinout'], Yeah: true, No: false };
          if (!(selected in values)) throw new Error(`No declared data expectation for modeled visible choice: ${selected}`);
          expected = values[selected];
        }
        await click(dock.getByRole('button', { name: selected, exact: true }), selected, 'optional');
      }
      await page.waitForFunction(() => {
        const element = document.querySelector('.in-run-setup');
        return !element || element.getAttribute('data-state') === 'collapsed';
      });
      const persisted = (await storage(page)).data?.profile;
      const actual = persisted?.[spec.field];
      const valueSavedCorrectly = JSON.stringify(actual) === JSON.stringify(expected);
      const matchesFixture = JSON.stringify(actual) === JSON.stringify(intended);
      const markerSaved = persisted?.onboardingCompleted?.includes(spec.key) === true;
      result.optionalAnswers.push({ key: spec.key, title, selected: selected ?? spec.value, guessedByPolicy: guessed, expectedSelectedValue: expected, intendedFixtureValue: intended, actualStoredValue: actual, valueSavedCorrectly, matchesFixture, markerSaved });
      if (!valueSavedCorrectly || !markerSaved) result.errors.push(`Optional answer storage mismatch: ${spec.key}`);
    }
    result.finalContextState = await storage(page);
    result.optionalContextComplete = await dock.count() === 0;

    if (person.policy.reloadAfterAnswers) {
      const profileBefore = result.finalContextState.data?.profile;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 20000 });
      result.reloadVerified = JSON.stringify(profileBefore) === JSON.stringify((await storage(page)).data?.profile);
      if (!result.reloadVerified) result.errors.push('Reload changed stored profile');
    }

    for (let index = 0; index < person.policy.playActions; index++) {
      const action = page.locator('.game-action');
      if (!await action.isVisible()) break;
      const ping = page.locator('.reality-ping, .xray-moment').first();
      if (await ping.isVisible()) {
        const strong = await page.locator('.reality-ping.requires-choice').isVisible();
        result.observedPings.push({ text: await ping.innerText(), strong, surface: await ping.getAttribute('class') });
        if (strong && person.policy.strongPingAction === 'exit') {
          const exit = ping.getByRole('button', { name: "I'm done", exact: true });
          await click(exit, "I'm done", 'ping');
          await page.locator('.game-action').waitFor({ state: 'detached' });
          result.strongInterventionExit = true;
          break;
        }
        const resume = ping.getByRole('button', { name: /^(Continue run|Got it)$/ });
        if (await resume.count()) await click(resume.first(), await resume.first().innerText(), 'ping');
        else {
          result.unhandledPing = 'No declared neutral dismissal button; journey stopped without inventing an action';
          break;
        }
      }
      if (await action.isDisabled()) break;
      await click(action, 'game action', 'game');
      result.playClicks++;
      await page.waitForFunction(() => {
        const action = document.querySelector('.game-action');
        return !action || !action.disabled || document.querySelector('.reality-ping, .xray-moment');
      }, null, { timeout: 10000 });
    }
    const finalPing = page.locator('.reality-ping, .xray-moment').first();
    if (await finalPing.isVisible()) {
      const text = await finalPing.innerText();
      if (!result.observedPings.some(ping => ping.text === text)) result.observedPings.push({ text, strong: await page.locator('.reality-ping.requires-choice').isVisible(), surface: await finalPing.getAttribute('class') });
    }
    result.finalState = await storage(page);
    result.status = result.errors.length || result.pageErrors.length ? 'failed' : 'completed';
  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.stack || String(error));
    if (page && !page.isClosed()) {
      result.observedLocationAtFailure = page.url();
      try { result.measurements.push(await measureSurface(page, 'failure')); }
      catch (captureError) { result.errors.push(`Failure geometry unavailable: ${captureError.message}`); }
    }
  } finally {
    await context.close();
  }
  return result;
}
