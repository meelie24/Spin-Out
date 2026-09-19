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

  await page.getByRole('heading', { name: 'Realistically, what is this money for?' }).waitFor({ timeout: 5_000 });
  assert(await page.getByText("If it's not for anything, what could it be put towards to make the next 1-3 months easier for you?", { exact: true }).count() === 1,
    'money-context question did not separate the supporting thought from the headline');
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
  const visibleHook = page.locator('.run-intro-dialog .intro-copy-mobile:visible, .run-intro-dialog .intro-copy-desktop:visible');
  assert(await visibleHook.count() === 1
    && /The more context you add, the more immersive your experience will be\./i.test(await visibleHook.innerText()),
    'pre-run explanation did not include the visible immersive-context hook');
  const startRun = page.getByRole('button', { name: 'Start Reality Run', exact: true });
  await startRun.waitFor();
  await page.waitForTimeout(80);
  await startRun.click();
  await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
}


async function assertModalKeyboardContract(page, dialogSelector, trigger) {
  await trigger.focus();
  await trigger.evaluate(el => el.setAttribute('data-qa-modal-trigger', 'true'));
  await trigger.click();
  const dialog = page.locator(dialogSelector);
  const stableTrigger = page.locator('[data-qa-modal-trigger="true"]');
  await dialog.waitFor();
  await assertFocusInside(page, dialogSelector, 'modal opened');
  assert(await stableTrigger.evaluate(el => Boolean(el.closest('[inert]'))),
    'background controls remain interactive while the modal is open');

  const buttons = dialog.locator('button:not(:disabled):visible');
  const first = buttons.first();
  const last = buttons.last();
  await first.focus();
  await page.keyboard.press('Shift+Tab');
  assert(await last.evaluate(el => el === document.activeElement),
    'Shift+Tab escaped the first modal control');
  await last.focus();
  await page.keyboard.press('Tab');
  assert(await first.evaluate(el => el === document.activeElement),
    'Tab escaped the last modal control');

  await stableTrigger.evaluate(el => el.focus());
  await assertFocusInside(page, dialogSelector, 'background focus attempt');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden', timeout: 2_000 });
  assert(await stableTrigger.evaluate(el => el === document.activeElement),
    'closing the modal did not restore focus to its trigger');
  assert(await stableTrigger.evaluate(el => !el.closest('[inert]')),
    'background remained inert after the modal closed');
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

  await check('run typography and optional questions remain readable at phone widths', async context => {
    const page = await context.newPage();
    await startKnownGameRealityRun(page, 'slots');
    await page.evaluate(() => document.fonts.ready);
    const findings = [];
    for (const width of [320, 390, 430, 768]) {
      await page.setViewportSize({ width, height: 844 });
      const observed = await page.evaluate(() => {
        const title = document.querySelector('.setup-question-title');
        const ui = document.querySelector('.run-hud span');
        const number = document.querySelector('.run-hud strong');
        const sound = document.querySelector('.sound-button');
        const question = title.getBoundingClientRect();
        const choices = document.querySelector('.setup-choice-row').getBoundingClientRect();
        const hud = document.querySelector('.run-hud').getBoundingClientRect();
        const soundBox = sound.getBoundingClientRect();
        return {
          uiFont: getComputedStyle(ui).fontFamily,
          displayFont: getComputedStyle(number).fontFamily,
          titleClipped: title.scrollHeight > title.clientHeight + 1,
          questionOverlapsChoices: question.bottom > choices.top + 1,
          soundFits: soundBox.left >= hud.left && soundBox.right <= hud.right + 1,
          soundTarget: soundBox.width >= 44 && soundBox.height >= 44,
          dockHeight: document.querySelector('.in-run-setup').getBoundingClientRect().height,
          dockAtBottom: getComputedStyle(document.querySelector('.in-run-setup')).position === 'fixed'
            && document.querySelector('.in-run-setup').getBoundingClientRect().bottom <= innerHeight
            && document.querySelector('.in-run-setup').getBoundingClientRect().bottom >= innerHeight - 24,
        };
      });
      if (!/Manrope/i.test(observed.uiFont)) findings.push(width + ': run UI font fell back: ' + observed.uiFont);
      if (!/Barlow/i.test(observed.displayFont)) findings.push(width + ': run display font fell back: ' + observed.displayFont);
      if (observed.titleClipped || observed.questionOverlapsChoices) findings.push(width + ': optional question is clipped or overlaps answers');
      if (!observed.soundFits || !observed.soundTarget) findings.push(width + ': sound control overflows or has a small touch target');
      if (observed.dockHeight > 140) findings.push(width + ': optional dock exceeds 140px');
      if (!observed.dockAtBottom) findings.push(width + ': optional question left its bottom dock');
    }
    assert(findings.length === 0, findings.join('; '));
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

    assert(await page.getByText(/Finish your setup/i).count() === 0,
      'in-run setup still used task-list language');
    assert(await page.getByText(/\d+ left/i).count() === 0,
      'in-run setup still exposed a remaining-question count');

    const firstPageLabels = await page.locator('.in-run-setup .setup-choice-row button').allTextContents();
    assert(JSON.stringify(firstPageLabels) === JSON.stringify(['Today','Tomorrow','This week','More']),
      `first choice page was not the explicit compact set: ${JSON.stringify(firstPageLabels)}`);
    assert(await page.getByRole('button', { name: 'Next week', exact: true }).count() === 0,
      'later choices were still rendered off-screen instead of behind More');

    await page.getByRole('button', { name: 'More', exact: true }).click();
    const secondPageLabels = await page.locator('.in-run-setup .setup-choice-row button').allTextContents();
    assert(JSON.stringify(secondPageLabels) === JSON.stringify(['Back','Next week','Pick a date','Not sure']),
      `More did not reveal every remaining date choice: ${JSON.stringify(secondPageLabels)}`);
    const rowOverflow = await page.locator('.in-run-setup .setup-choice-row').evaluate(el => el.scrollWidth - el.clientWidth);
    assert(rowOverflow <= 1, `paged setup choices still required ${rowOverflow}px of horizontal scrolling`);
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    const openBox = await setup.boundingBox();
    assert(Boolean(openBox), 'mobile continuation setup had no measurable bounding box');
    assert(openBox.height <= 140,
      `mobile continuation setup was ${openBox.height}px tall; expected <= 140px`);

    const questionBefore = (await page.locator('.setup-question-title').innerText()).trim();
    await page.getByRole('button', { name: 'Not now', exact: true }).click();
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
    assert(await page.getByRole('button', { name: 'Make it more immersive', exact: true }).count() === 1,
      'collapsed dock did not sell the user-facing payoff');
    const storedAfterNotNow = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(!(storedAfterNotNow?.profile?.onboardingCompleted || []).includes('income-date'),
      'Not now incorrectly marked the current question complete');
    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    assert((await page.locator('.setup-question-title').innerText()).trim() === questionBefore,
      'reopening the dock did not restore the same unanswered question');
    await page.getByRole('button', { name: 'Not now', exact: true }).click();

    const collapsedBox = await setup.boundingBox();
    assert(Boolean(collapsedBox), 'collapsed setup rail had no measurable bounding box');
    assert(collapsedBox.height <= 46,
      `collapsed setup rail was ${collapsedBox.height}px tall; expected <= 46px`);
  });


  await check('compact dock survives a 320px phone viewport', async context => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 320, height: 568 });
    await startKnownGameRealityRun(page, 'slots');

    const setup = page.locator('.in-run-setup');
    await setup.waitFor();
    const box = await setup.boundingBox();
    assert(Boolean(box), '320px setup dock had no measurable bounding box');
    assert(box.height <= 140,
      `320px setup dock was ${box.height}px tall; expected <= 140px`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `320px run introduced ${overflow}px of horizontal page overflow`);
  });

  await check('reduced motion keeps setup functional without black-hole bounce', async context => {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await startKnownGameRealityRun(page, 'slots');

    const setup = page.locator('.in-run-setup');
    await setup.waitFor();
    assert(await setup.getAttribute('data-reduced-motion') === 'true',
      'continuation setup did not detect reduced-motion preference');

    const firstQuestion = (await page.locator('.setup-question-title').innerText()).trim();
    await page.getByRole('button', { name: 'This week', exact: true }).click();
    await page.locator('.in-run-setup[data-state="consuming"]').waitFor();

    const hiddenEffects = await page.locator('.setup-black-hole, .setup-droplet').evaluateAll(nodes =>
      nodes.every(node => getComputedStyle(node).display === 'none')
    );
    assert(hiddenEffects, 'reduced-motion path still displayed the black-hole or bouncing droplets');

    await page.waitForTimeout(220);
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
    assert(await page.locator('.setup-question-title').count() === 0,
      'reduced-motion path chained immediately into another optional question');
    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    const nextQuestion = (await page.locator('.setup-question-title').innerText()).trim();
    assert(nextQuestion !== firstQuestion,
      'reduced-motion manual reopen did not advance to the next setup question');
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
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
    assert(await page.locator('.setup-question-title').count() === 0,
      'answering one optional question chained directly into the next one');
    assert(await page.getByRole('button', { name: 'Make it more immersive', exact: true }).count() === 1,
      'next optional question was not preserved behind the collapsed dock');

    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    const nextQuestion = (await page.locator('.setup-question-title').innerText()).trim();
    assert(nextQuestion !== firstQuestion, 'manual reopen did not advance to the next continuation question');

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(Array.isArray(stored?.profile?.onboardingCompleted)
      && stored.profile.onboardingCompleted.includes('income-date'),
      'continuation answer was not persisted before advancing');

    await page.waitForFunction(() => {
      const raw = localStorage.getItem('spinout.active.v2');
      const active = raw ? JSON.parse(raw) : null;
      return Array.isArray(active?.profile?.onboardingCompleted)
        && active.profile.onboardingCompleted.includes('income-date')
        && Boolean(active.profile.nextIncomeDate);
    }, null, { timeout: 5_000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    if (await page.locator('.in-run-setup[data-state="collapsed"]').count()) {
      await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    }
    const restoredQuestion = (await page.locator('.setup-question-title').innerText()).trim();
    assert(!/money coming in/i.test(restoredQuestion),
      'completed continuation question returned after active-run restore');
  });

  await check('deeper context waits for a deliberate immersive reopen', async context => {
    const completed = ['income-date','available-money','obligation-amount','obligation-date'];
    const p = profile('slots', {
      onboardingCompleted: completed,
      quitReason: null,
      personalMoneyGoal: null,
      difficultTimes: [],
      recentLenderName: null,
      paydayPlanActions: [],
    });
    await seedActive(context, p, runFor(p));

    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
    assert(await page.locator('.setup-question-title').count() === 0,
      'deeper personal context auto-opened even though immediate money context was complete');
    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    await page.getByRole('heading', { name: /What are you trying to stop from happening again/i }).waitFor();
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
      actionCount: 2,
      chosenLimitRounds: 3,
      lastPingAction: -10,
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



  await check('first game action gets optional setup out of the way', async context => {
    const page = await context.newPage();
    await startKnownGameRealityRun(page, 'slots');
    await page.locator('.in-run-setup[data-state="expanded"]').waitFor();
    await page.locator('.game-action').click();
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor({ timeout: 5_000 });
    assert(await page.locator('.reality-ping, .xray-moment').count() === 0,
      'first-action collapse test was masked by a foreground intervention');
  });

  await check('new context changes the live run immediately', async context => {
    const completed = [
      'income-date','available-money','quit-reason','money-goal','difficult-times',
      'lender-name','lender-helped','lender-amount','payday-plan'
    ];
    const p = profile('slots', {
      obligationType: 'car',
      obligationAmountCents: null,
      obligationDueDate: null,
      onboardingCompleted: completed,
    });
    await seedActive(context, p, runFor(p));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });

    await page.getByRole('heading', { name: /You said the car payment\. How much is it\?/i }).waitFor();
    await page.getByRole('textbox', { name: 'Amount' }).fill('430');
    await page.getByRole('button', { name: 'Use', exact: true }).click();
    await page.waitForTimeout(1_100);
    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();

    await page.getByRole('heading', { name: /When does it have to be paid\?/i }).waitFor();
    await page.getByRole('button', { name: 'This week', exact: true }).click();
    await page.waitForTimeout(1_100);

    const liveContext = page.locator('.context-ghost.ghost-a');
    await liveContext.waitFor();
    const liveText = (await liveContext.innerText()).replace(/\s+/g, ' ');
    assert(/CAR PAYMENT/i.test(liveText) && /\$430/.test(liveText),
      `current Reality Run did not adopt the newly saved car-payment context: ${liveText}`);

    const active = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.active.v2') || 'null'));
    assert(active?.profile?.obligationAmountCents === 43_000 && Boolean(active?.profile?.obligationDueDate),
      'active-run envelope did not persist the newly added context');
  });

  await check('desktop setup card stays beside the game', async context => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await startKnownGameRealityRun(page, 'slots');

    const setup = page.locator('.in-run-setup');
    const game = page.locator('.run-card');
    await setup.waitFor();
    const setupBox = await setup.boundingBox();
    const gameBox = await game.boundingBox();
    assert(Boolean(setupBox) && Boolean(gameBox), 'desktop setup or game had no measurable box');
    assert(setupBox.x + setupBox.width <= gameBox.x + 2,
      'desktop setup card overlapped the game instead of sitting beside it');
    assert(setupBox.width >= 220 && setupBox.width <= 280,
      `desktop setup card width was ${setupBox.width}px; expected a compact side card`);
    await page.screenshot({ path: 'qa-artifacts/in-run-setup-desktop-1280.png', fullPage: true });
  });


  await check('final optional answer leaves no fake completion task', async context => {
    const page = await context.newPage();
    const allExceptIncome = [
      'available-money','obligation-amount','obligation-date','quit-reason','money-goal',
      'difficult-times','lender-name','lender-helped','lender-amount','payday-plan'
    ];
    const p = profile('slots', { onboardingCompleted: allExceptIncome });
    await seedActive(context, p, runFor(p));
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.in-run-setup').waitFor();
    await page.getByRole('button', { name: 'This week', exact: true }).click();
    await page.waitForTimeout(1_100);
    assert(await page.locator('.in-run-setup').count() === 0,
      'finished optional context still showed a completion rail/card');
    assert(await page.getByText(/Setup finished|You’re all set|That’s plenty/i).count() === 0,
      'finished optional context announced software-style completion copy');
  });

  await check('sign-in CTA sounds like the user asking for the action', async context => {
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const signIn = page.getByRole('button', { name: 'Sign in', exact: true });
    if (await signIn.count()) {
      await signIn.click();
      await page.getByRole('dialog').waitFor();
      assert(await page.getByRole('button', { name: 'Send me the link', exact: true }).count() === 1,
        'sign-in CTA did not use the approved first-person action language');
      assert(await page.getByRole('button', { name: 'Email sign-in link', exact: true }).count() === 0,
        'old product-centric sign-in CTA remained visible');
    }
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
    await page.locator('.in-run-setup[data-state="collapsed"]').waitFor();
    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    await page.getByRole('heading', { name: /Has Alex had to help you recently/i }).waitFor();
    await page.getByRole('button', { name: 'Yeah', exact: true }).click();
    await page.waitForTimeout(1_100);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(stored?.profile?.recentLenderHelpedRecently === true,
      'lender follow-up lost the affirmative answer');
    await page.getByRole('button', { name: 'Make it more immersive', exact: true }).click();
    await page.getByRole('heading', { name: /About how much did they have to cover/i }).waitFor();
  });

  await check('mobile home makes game choice the dominant compact task', async context => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.locator('.game-tile').first().waitFor();

    const quickPick = page.locator('.mobile-game-quickpick');
    await quickPick.waitFor();
    assert(await quickPick.isVisible(),
      'mobile homepage did not expose an early compact game chooser');

    const quickLinks = quickPick.locator('a');
    assert(await quickLinks.count() === 6,
      'early mobile game chooser did not expose all six games');

    const quickColumns = await quickPick.evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
    );
    assert(quickColumns === 2,
      `390px quick game chooser used ${quickColumns} columns instead of a readable two-column grid`);

    const hero = page.locator('.hub-hero');
    const machine = page.locator('.hero-machine');
    const quickBox = await quickPick.boundingBox();
    const machineBox = await machine.boundingBox();
    assert(Boolean(quickBox) && Boolean(machineBox), 'mobile hero elements were not measurable');
    assert(quickBox.y < machineBox.y,
      'mobile game chooser appeared after the decorative machine instead of before it');
    assert(quickBox.y < 844,
      `first actionable game chooser started below the initial viewport at y=${quickBox.y}`);

    const quickOverflow = await quickPick.evaluate(el => el.scrollWidth - el.clientWidth);
    assert(quickOverflow <= 1,
      `mobile game chooser required ${quickOverflow}px of horizontal scrolling`);

    assert(await page.locator('.hero-actions .primary-cta:visible').count() === 0,
      'mobile hero still used a redundant Choose a game anchor after exposing direct game choices');

    assert(await page.locator('.games-top-prompt:visible').count() === 0,
      'a second Reality Ping preview still interrupted the game catalog on mobile');

    assert(await page.locator('.game-tile').count() === 6,
      'mobile homepage did not keep all six games discoverable');

    const columns = await page.locator('.game-library').first().evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
    );
    assert(columns === 2, `mobile game grid used ${columns} columns instead of a compact two-column layout`);

    const visibleDescriptions = await page.locator('.game-tile p').evaluateAll(nodes =>
      nodes.filter(node => getComputedStyle(node).display !== 'none').length
    );
    assert(visibleDescriptions === 0,
      'mobile game cards still showed full descriptive paragraphs');

    assert(await page.locator('.games-mid-prompt:visible, .prompt-bottom:visible').count() === 0,
      'secondary homepage prompts still interrupted the six-game mobile scan');
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

  await check('Run 10,000 keeps secondary numbers behind an explicit reveal', async context => {
    const p = profile('slots');
    await seedActive(context, p, runFor(p, { actionCount: 2, balanceCents: 8_000 }));
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Run 10,000' }).click();
    await page.locator('.longrun-final').waitFor();

    assert(await page.getByText('This 10,000-run sample', { exact: true }).count() === 1,
      'Run 10,000 lost the sample label');
    assert(await page.getByText('Model expectation', { exact: true }).count() === 1,
      'Run 10,000 lost the model expectation label');
    assert(await page.getByRole('button', { name: 'See the numbers', exact: true }).count() === 1,
      'Run 10,000 did not offer an explicit secondary-details reveal');
    assert(await page.locator('.longrun-stats:visible').count() === 0,
      'secondary Run 10,000 stats competed with the primary comparison before reveal');

    await page.getByRole('button', { name: 'See the numbers', exact: true }).click();
    assert(await page.locator('.longrun-stats:visible').count() === 1,
      'Run 10,000 secondary stats did not appear after explicit reveal');
    assert(await page.getByRole('button', { name: 'Hide the numbers', exact: true }).count() === 1,
      'Run 10,000 reveal did not become a reversible Hide the numbers action');
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

  await check('strong Reality Ping focus', async context => {
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
      actionCount: 4,
      chosenLimitRounds: 3,
      lastPingAction: -10,
      limitExceededAt: Date.now() - 2_000,
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

  await check('My Reality opens as a summary before edit controls', async context => {
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

    assert(await page.locator('.reality-context-summary').count() === 1,
      'My Reality did not open in summary mode');
    assert(await page.getByText(/Car payment/i).count() >= 1,
      'My Reality summary did not expose the current obligation');
    assert(await page.getByText('$430', { exact: true }).count() >= 1,
      'My Reality summary did not expose the current obligation amount');
    assert(await page.locator('.reality-context-dialog input:visible, .reality-context-dialog select:visible').count() === 0,
      'My Reality exposed edit fields before the user chose to edit');

    assert(await page.getByRole('button', { name: 'Edit', exact: true }).count() === 0,
      'My Reality still exposed one global Edit action');

    const obligationEdit = page.getByRole('button', { name: 'Edit what this money is for', exact: true });
    assert(await obligationEdit.count() === 1,
      'My Reality did not expose a focused edit action for the obligation summary');
    await obligationEdit.click();

    assert(await page.locator('.context-focused-editor').count() === 1,
      'My Reality did not open a focused editor');
    assert(await page.locator('.reality-context-dialog select:visible').count() === 1,
      'focused obligation edit did not expose exactly one obligation selector');
    assert(await page.locator('.reality-context-dialog input:visible').count() === 2,
      'focused obligation edit exposed controls outside amount and due date');
    assert(await page.getByText(/When does it usually get harder\?/i).count() === 0,
      'focused obligation edit leaked unrelated difficult-time controls');
    assert(await page.getByText(/If payday gets hard/i).count() === 0,
      'focused obligation edit leaked unrelated payday controls');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.locator('.reality-context-summary').waitFor();
    assert(await page.locator('.reality-context-dialog input:visible, .reality-context-dialog select:visible').count() === 0,
      'saving a focused My Reality edit did not return to the summary');
    assert(await page.getByText(/change or clear them anytime/i).count() === 1,
      'My Reality summary did not make control over stored context clear');
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

  await check('post-run earns one relevant context question without becoming a checklist', async context => {
    const p = profile('slots', {
      personalMoneyGoal: null,
      onboardingCompleted: [
        'income-date','available-money','obligation-amount','obligation-date',
        'quit-reason','difficult-times','lender-name','lender-helped','lender-amount','payday-plan'
      ],
    });
    await seedActive(context, p, runFor(p));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: "I'm done" }).click();
    await page.getByText(/You left\./i).waitFor();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('heading', { name: /How bad do you want to play now/i }).waitFor();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('heading', { name: /Did you end up gambling/i }).waitFor();
    await page.getByRole('button', { name: 'No', exact: true }).click();
    await page.locator('.money-kept').waitFor();

    const earned = page.locator('.post-run-context-question');
    await earned.waitFor();
    assert(await earned.getByRole('heading', { name: /rather this money still be there for/i }).count() === 1,
      'Money Kept did not earn the missing money-goal question');
    assert(await page.locator('.post-run-context-question').count() === 1,
      'post-run summary showed more than one earned context question');
    assert(await page.getByRole('button', { name: 'Back home', exact: true }).count() === 1,
      'earned question blocked the normal post-run exit');

    await earned.getByRole('button', { name: 'Savings', exact: true }).click();
    await earned.waitFor({ state: 'detached' });
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(stored?.profile?.personalMoneyGoal === 'Savings',
      'post-run money-goal answer did not save');
    assert((stored?.profile?.onboardingCompleted || []).includes('money-goal'),
      'post-run money-goal answer did not mark the question complete');
    assert(await page.locator('.post-run-context-question').count() === 0,
      'answering one post-run question immediately chained into another');
  });

  await check('post-run Not now preserves the earned question for a later run', async context => {
    const p = profile('slots', {
      personalMoneyGoal: null,
      onboardingCompleted: [
        'income-date','available-money','obligation-amount','obligation-date',
        'quit-reason','difficult-times','lender-name','lender-helped','lender-amount','payday-plan'
      ],
    });
    await seedActive(context, p, runFor(p));
    const page = await context.newPage();
    await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
    await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
    await page.getByRole('button', { name: "I'm done" }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: 'No', exact: true }).click();
    await page.locator('.money-kept').waitFor();

    const earned = page.locator('.post-run-context-question');
    await earned.waitFor();
    await earned.getByRole('button', { name: 'Not now', exact: true }).click();
    await earned.waitFor({ state: 'detached' });
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2') || 'null'));
    assert(!(stored?.profile?.onboardingCompleted || []).includes('money-goal'),
      'Not now incorrectly completed the post-run question');
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
    assert(await page.getByRole('button', { name: 'Back home', exact: true }).count() === 1,
      'post-run summary did not expose a literal Back home destination');
    assert(await page.getByRole('button', { name: 'Done', exact: true }).count() === 0,
      'ambiguous Done action remained on the post-run summary');
  });

await check('My Reality contains keyboard focus and restores its trigger', async context => {
  const p = profile('slots');
  await context.addInitScript(({ profile }) => {
    localStorage.setItem('spinout.v2', JSON.stringify({
      version: 2, profile, runs: [], pingLearning: {}, events: [], account: {},
    }));
  }, { profile: p });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await assertModalKeyboardContract(page, '.reality-context-dialog',
    page.getByRole('button', { name: 'My reality', exact: true }).first());
});

await check('Run 10,000 contains keyboard focus and restores its trigger', async context => {
  const p = profile('slots');
  await seedActive(context, p, runFor(p, { actionCount: 2, balanceCents: 8_000 }));
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/play`, { waitUntil: 'domcontentloaded' });
  await page.locator('.phaser-stage[data-ready="true"]').waitFor({ timeout: 15_000 });
  await assertModalKeyboardContract(page, '.longrun-panel',
    page.getByRole('button', { name: 'Run 10,000', exact: true }));
});

await check('editing a goal preserves unknown money and financial freshness', async context => {
  const p = profile('slots', {
    availableUntilIncomeCents: null,
    obligationAmountCents: null,
    financialContextUpdatedAt: '2026-01-01T12:00:00.000Z',
  });
  await context.addInitScript(({ profile }) => {
    localStorage.setItem('spinout.v2', JSON.stringify({
      version: 2, profile, runs: [], pingLearning: {}, events: [], account: {},
    }));
  }, { profile: p });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'My reality', exact: true }).first().click();
  await page.getByRole('button', { name: /Edit what.*trying to keep it for/i }).click();
  await page.locator('.context-focused-editor input').fill('Emergency fund');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('.reality-context-summary').waitFor();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2')).profile);
  const findings = [];
  if (saved.personalMoneyGoal !== 'Emergency fund') findings.push('edited goal was not saved');
  if (saved.availableUntilIncomeCents !== null) findings.push('unknown available money became a recorded number');
  if (saved.obligationAmountCents !== null) findings.push('unknown obligation amount became a recorded number');
  if (saved.financialContextUpdatedAt !== p.financialContextUpdatedAt) findings.push('unreviewed financial details were marked fresh');
  if (saved.nextIncomeDate !== p.nextIncomeDate || saved.obligationDueDate !== p.obligationDueDate) findings.push('unrelated financial dates changed');
  assert(findings.length === 0, findings.join('; '));
});

await check('clearing income preserves null while an explicit zero remains zero', async context => {
  const p = profile('slots');
  await context.addInitScript(({ profile }) => {
    localStorage.setItem('spinout.v2', JSON.stringify({
      version: 2, profile, runs: [], pingLearning: {}, events: [], account: {},
    }));
  }, { profile: p });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'My reality', exact: true }).first().click();
  await page.getByRole('button', { name: 'Edit money coming in', exact: true }).click();
  await page.getByLabel(/Money until more comes in/).fill('0');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('.reality-context-summary').waitFor();
  const explicit = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2')).profile);
  assert(explicit.availableUntilIncomeCents === 0, 'an explicit zero was discarded');

  await page.getByRole('button', { name: 'Edit money coming in', exact: true }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('.reality-context-summary').waitFor();
  const cleared = await page.evaluate(() => JSON.parse(localStorage.getItem('spinout.v2')).profile);
  assert(cleared.availableUntilIncomeCents === null && cleared.nextIncomeDate === null,
    'clearing the income section did not preserve unspecified values');
  assert(cleared.obligationAmountCents === p.obligationAmountCents
    && cleared.obligationDueDate === p.obligationDueDate,
    'clearing income changed the separate obligation');
});

  if (failures.length) {
    throw new Error('Round 2 user-test failures:\n- ' + failures.join('\n- '));
  }

  console.log('Round 2 user testing passed.');
} finally {
  await browser.close();
}
