import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(name, fn) {
  let context = null;
  try {
    context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await fn(context);
    console.log('PASS', name);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(name + ': ' + message);
    console.error('FAIL', name, message);
  } finally {
    await context?.close().catch(() => {});
  }
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

async function finishKnownGameCoreSetup(page, game = 'slots') {
  await page.goto(`${base}/play?game=${game}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'How much were you about to put in?' }).waitFor();
  await page.getByRole('button', { name: '$100', exact: true }).click();

  await page.getByRole('heading', { name: 'What were you hoping would happen?' }).waitFor();
  await page.getByRole('button', { name: 'Win back what I lost', exact: true }).click();

  await page.getByRole('heading', { name: 'What does this money need to make it past?' }).waitFor();
  await page.getByRole('button', { name: 'Car payment', exact: true }).click();

  await page.getByRole('heading', { name: 'How bad do you want to play right now?' }).waitFor();
  await page.getByRole('button', { name: '8', exact: true }).click();

  await page.getByRole('heading', { name: 'Before you start, where do you want to stop?' }).waitFor();
  await page.getByRole('button', { name: '10 rounds', exact: true }).click();

  await page.locator('.run-intro').waitFor();
}

async function startKnownGameRealityRun(page, game = 'slots') {
  await finishKnownGameCoreSetup(page, game);
  assert(await page.locator('.deposit-terminal').count() === 0,
    'old deposit gate appeared after the five core questions');
  const mobileHook = page.locator('.run-intro-dialog .intro-copy-mobile');
  assert(await mobileHook.isVisible()
    && /The more context you add, the more immersive your experience will be\./i.test(await mobileHook.innerText()),
    'pre-run explanation did not include the visible immersive-context hook');
  await page.getByRole('button', { name: 'Start Reality Run', exact: true }).click();
  await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
}


const browser = await chromium.launch({ headless: true });

try {

  await check('five-question entry reaches game without deposit gate', async context => {
    const page = await context.newPage();
    await finishKnownGameCoreSetup(page, 'slots');

    assert(await page.locator('.deposit-terminal').count() === 0,
      'old deposit screen still blocks the run after five questions');
    assert(await page.locator('.phaser-stage').count() === 1,
      'actual game surface is not visible behind the pre-run explanation');
    assert(await page.getByRole('button', { name: 'Start Reality Run', exact: true }).count() === 1,
      'pre-run explanation did not expose one Start Reality Run action');
    assert(await page.getByText(/The rest of your setup will stay with you while you play\./i).count() === 1,
      'mobile pre-run explanation did not explain that setup continues during play');
  });

  await check('mobile continuation setup stays compact and one-question-at-a-time', async context => {
    const page = await context.newPage();
    await startKnownGameRealityRun(page, 'slots');

    const setup = page.locator('.in-run-setup');
    await setup.waitFor();
    assert(await setup.getAttribute('data-state') === 'expanded',
      'continuation setup did not begin expanded after the run started');
    assert(await page.locator('.in-run-setup .setup-question').count() === 1,
      'continuation setup rendered more than one question at once');

    const openBox = await setup.boundingBox();
    assert(Boolean(openBox), 'mobile continuation setup had no measurable bounding box');
    assert(openBox.height <= 140,
      `mobile continuation setup was ${openBox.height}px tall; expected <= 140px`);

    await page.getByRole('button', { name: /Collapse finish your setup/i }).click();
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
    const collapsedBox = await setup.boundingBox();
    assert(Boolean(collapsedBox), 'collapsed setup rail had no measurable bounding box');
    assert(collapsedBox.height <= 46,
      `collapsed setup rail was ${collapsedBox.height}px tall; expected <= 46px`);
  });

  await check('continuation answer persists before next question', async context => {
    const page = await context.newPage();
    await startKnownGameRealityRun(page, 'slots');

    const question = page.locator('.setup-question-title');
    await question.waitFor();
    const firstQuestion = (await question.innerText()).trim();
    assert(/money coming in/i.test(firstQuestion),
      `unexpected first continuation question: ${firstQuestion}`);

    await page.getByRole('button', { name: 'This week', exact: true }).click();
    await page.locator('.in-run-setup[data-state="consuming"]').waitFor();
    assert(await page.locator('.setup-droplet').count() === 3,
      'question completion did not render exactly three liquid droplets');
    await page.waitForTimeout(1_100);
    const nextQuestion = (await page.locator('.setup-question-title').innerText()).trim();
    assert(nextQuestion !== firstQuestion, 'next continuation question did not replace the completed one');

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(Array.isArray(stored?.profile?.onboardingCompleted)
      && stored.profile.onboardingCompleted.includes('income-date'),
      'continuation answer was not persisted before advancing');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    if (await page.locator('.in-run-setup[data-state="collapsed"]').count()) {
      await page.getByRole('button', { name: /Finish your setup/i }).click();
    }
    const restoredQuestion = (await page.locator('.setup-question-title').innerText()).trim();
    assert(!/money coming in/i.test(restoredQuestion),
      'completed continuation question returned after active-run restore');
  });

  await check('foreground intervention collapses continuation setup', async context => {
    const p = profile('slots', {
      onboardingCompleted: [],
      availableUntilIncomeCents: null,
      nextIncomeDate: null,
      obligationType: 'car',
      obligationAmountCents: null,
      obligationDueDate: null,
      personalMoneyGoal: null,
      quitReason: null,
    });
    await seedActive(context, p, runFor(p, {
      actionCount: 4,
      chosenLimitRounds: 3,
      lastPingAction: -10,
      limitExceededAt: Date.now() - 2_000,
    }));

    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.locator('.in-run-setup').waitFor();
    await page.locator('.game-action').click();
    await page.locator('.reality-ping, .xray-moment').first().waitFor({ timeout: 9_000 });
    assert(await page.locator('.in-run-setup').getAttribute('data-state') === 'collapsed',
      'continuation setup stayed open while a foreground intervention was active');
  });


  await check('returning profile keeps known continuation context', async context => {
    const p = profile('slots', {
      quitReason: 'Keep bill money where it belongs',
      difficultTimes: ['payday'],
      paydayPlanActions: ['move-bill-money'],
      recentLenderName: 'Sam',
      recentLenderHelpedRecently: false,
      onboardingCompleted: undefined,
    });
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
    await page.goto(`${base}/play?game=slots`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '$100', exact: true }).click();
    await page.getByRole('button', { name: 'Win back what I lost', exact: true }).click();
    await page.getByRole('button', { name: '5 rounds', exact: true }).click();
    await page.locator('.run-intro').waitFor();
    await page.getByRole('button', { name: 'Start Reality Run', exact: true }).click();
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    assert(await page.locator('.in-run-setup').count() === 0,
      'returning user was re-asked continuation questions already answered in the legacy profile');
  });

  await check('lender follow-up keeps a yes answer', async context => {
    const completed = [
      'income-date','available-money','obligation-amount','obligation-date','quit-reason',
      'money-goal','difficult-times','lender-name','payday-plan'
    ];
    const p = profile('slots', {
      recentLenderName: 'Alex',
      recentLenderHelpedRecently: false,
      recentLenderAmountCents: null,
      onboardingCompleted: completed,
    });
    await seedActive(context, p, runFor(p));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('heading', { name: /Has Alex had to help you recently/i }).waitFor();
    await page.getByRole('button', { name: 'Yeah', exact: true }).click();
    await page.waitForTimeout(1_100);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(stored?.profile?.recentLenderHelpedRecently === true,
      'lender follow-up lost the affirmative answer');
    await page.getByRole('heading', { name: /About how much did they have to cover/i }).waitFor();
  });

  await check('same-visit home prompt dismissal', async context => {
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const prompt = page.getByRole('button', { name: /What usually happens after “one more”.*Dismiss/i });
    await prompt.waitFor();
    await prompt.click();
    await prompt.waitFor({ state: 'detached' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100);
    assert(await page.getByRole('button', { name: /What usually happens after “one more”.*Dismiss/i }).count() === 0,
      'dismissed homepage Reality Ping returned immediately after refresh');
  });

  await check('Run 10,000 focus', async context => {
    const p = profile('slots');
    await seedActive(context, p, runFor(p, { actionCount: 2, balanceCents: 8_000 }));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Run 10,000' }).click();
    await page.locator('.longrun-panel').waitFor();
    await assertFocusInside(page, '.longrun-panel', 'Run 10,000');
  });

  await check('Run 10,000 neutral progression copy', async context => {
    const p = profile('slots');
    await seedActive(context, p, runFor(p, { actionCount: 2, balanceCents: 8_000 }));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Run 10,000' }).click();
    await page.locator('.longrun-panel').waitFor();
    await page.waitForTimeout(520);
    const text = await page.locator('.longrun-panel').innerText();
    assert(!/\bkeep going\b/i.test(text), 'Run 10,000 used directive "Keep going" copy');
  });

  await check('Reality Ping focus', async context => {
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
    await page.locator('.reality-ping.requires-choice').waitFor({ timeout: 9_000 });
    await assertFocusInside(page, '.reality-ping', 'Reality Ping');
    assert(await page.getByRole('button', { name: 'Keep going', exact: true }).count() === 0,
      'strong Reality Ping used directive "Keep going" action copy');
    assert(await page.getByRole('button', { name: 'Continue run', exact: true }).count() === 1,
      'strong Reality Ping did not offer neutral continuation wording');
  });

  await check('X-Ray focus', async context => {
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
  });

  await check('My Reality focus', async context => {
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
  });

  await check('truthful post-run availability language', async context => {
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
  });

  if (failures.length) {
    throw new Error('Round 2 user-test failures:\n- ' + failures.join('\n- '));
  }

  console.log('Round 2 user testing passed.');
} finally {
  await browser.close();
}
