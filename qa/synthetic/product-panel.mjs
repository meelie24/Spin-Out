import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { argumentsFrom, readPanel, writeNew, GAMES, WIDTHS } from './panel-config.mjs';
import { localBase, runJourney } from './browser-observations.mjs';

const SEGMENTS = {
  'high urge + low patience': p => p.urge >= 8 && p.patience <= 2,
  'low digital fluency': p => p.digitalLiteracy <= 2,
  'privacy-sensitive': p => p.privacySensitivity >= 4,
  skeptical: p => p.skepticism >= 4,
  'strong quit intent': p => p.stoppingReadiness >= 4,
  returning: p => p.returning,
  completionist: p => p.completionTendency >= 4,
  'escape/coping': p => p.motive === 'escape/coping',
  chasing: p => p.motive === 'chasing',
  'financial motive': p => p.motive === 'financial',
  'excitement motive': p => p.motive === 'excitement',
};

function distribution(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return { n: 0, median: null, p90: null, min: null, max: null };
  return { n: sorted.length, median: sorted[Math.floor((sorted.length - 1) * .5)], p90: sorted[Math.ceil(sorted.length * .9) - 1], min: sorted[0], max: sorted.at(-1) };
}

function metrics(rows, people) {
  const answers = rows.flatMap(row => row.optionalAnswers);
  const measured = (value, note, denominator = null) => ({ classification: 'measured', value, denominator, note });
  const modeled = (value, note) => ({ classification: 'modeled policy executed in browser', value, note });
  const unavailable = note => ({ classification: 'not measurable', value: null, note });
  return {
    reachedGame: measured(rows.filter(r => r.reachedGame).length, 'Canvas ready after the Start action.', rows.length),
    preGameAbandonment: modeled(rows.filter(r => r.preGameAbandonment).length, 'Frozen action-budget choice, not an empirical abandonment rate.'),
    secondsToGame: measured(distribution(rows.filter(r => r.reachedGame).map(r => r.secondsToGame)), 'Automation/server timings. Not human reading or decision time.'),
    actionsToGame: measured(distribution(rows.filter(r => r.reachedGame).map(r => r.preGameActions + r.startClickCount)), 'Required answer clicks plus Start Reality Run.'),
    remainingQuestionCompletion: measured(rows.filter(r => r.optionalContextComplete).length, 'No remaining optional dock at the end of the scripted answer budget; seeded returning facts are separate.', rows.filter(r => r.reachedGame).length),
    questionsAnsweredPerSession: measured(distribution(rows.map(r => r.optionalAnswers.length)), 'Browser-submitted optional questions, including explicit unknowns.'),
    eventualCompletion: unavailable('A bounded session/reload cannot establish eventual completion.'),
    notNowUsage: measured(rows.filter(r => r.notNowClicks > 0).length, 'Sessions with at least one actual Not now click; actions chosen by frozen policy.', rows.filter(r => r.reachedGame).length),
    reopenRate: measured(rows.filter(r => r.reopenClicks > 0).length, 'Sessions with an actual optional-context reopen; not a population rate.', rows.filter(r => r.reachedGame).length),
    guessedAnswers: modeled(answers.filter(a => a.guessedByPolicy).length, 'Visible-answer selection was assigned in advance to stress hidden-choice discoverability.'),
    inaccurateStoredAnswersAgainstFixture: measured(answers.filter(a => !a.matchesFixture).length, 'Stored answer differs from synthetic fixture truth. This is not a measured human misunderstanding rate.', answers.length),
    contextSupplied: measured(answers.filter(a => a.valueSavedCorrectly && a.actualStoredValue != null).length, 'Non-null optional responses actually persisted; marker and chosen-value correctness also reported.', answers.length),
    answerPersistenceErrors: measured(answers.filter(a => !a.valueSavedCorrectly || !a.markerSaved).length, 'Storage does not match the submitted UI answer or its completion marker.', answers.length),
    contextualPingExposure: unavailable('Raw observed Ping text and classes are retained. No validated mapping here establishes which exposures used personal context.'),
    pingExposure: measured(rows.reduce((n, r) => n + r.observedPings.length, 0), 'Observed surfaces, deduplicated within each final observation; no claim of recall.'),
    pingRecall: unavailable('Requires a participant recall task and validated human comparison.'),
    normalPingRecall: unavailable('Seeing a DOM element does not establish recall.'),
    strongInterventionExits: measured(rows.filter(r => r.strongInterventionExit).length, 'Actual exit clicks after a strong Ping, selected by a frozen policy. Not intervention effectiveness.', rows.filter(r => r.observedPings.some(p => p.strong)).length),
    returningUsage: modeled(people.filter(p => p.returning).length, 'Returning status is a seeded fixture, not natural return behavior.'),
    reloadPersistence: measured(rows.filter(r => r.reloadVerified === true).length, 'Profile preserved across actual same-session reload.', rows.filter(r => r.reloadVerified != null).length),
    modeledRepeatUseIntent: unavailable('No validated intention model; do not infer desire to return from script completion.'),
    irritation: unavailable('Subjective irritation cannot be inferred from automation.'),
    friction: measured(rows.filter(r => r.status === 'failed').length, 'Technical journey failures only. Trace and geometry expose specific causes.', rows.length),
    privacyRefusal: modeled(people.filter(p => p.policy.refuseOptionalContext).length, 'Frozen refusal policy, not observed privacy attitudes; actual Not now clicks reported separately.'),
    completionistBehavior: measured(rows.filter((r, index) => people[index]?.completionTendency >= 4 && r.optionalContextComplete).length, 'Completed optional context among assigned completionist scenarios.', people.filter(p => p.completionTendency >= 4).length),
    lowDigitalFluencyBehavior: measured(rows.filter((r, index) => people[index]?.digitalLiteracy <= 2 && r.reachedGame).length, 'Reached game under assigned low-fluency policy. Does not measure real digital literacy.', people.filter(p => p.digitalLiteracy <= 2).length),
    highUrgeBehavior: measured(rows.filter((r, index) => people[index]?.urge >= 8 && r.reachedGame).length, 'Reached game under assigned high-urge policy. Does not reproduce psychological urge.', people.filter(p => p.urge >= 8).length),
  };
}

export function summarize(observations, envelope) {
  if (observations.panelSha256 !== envelope.sha256) throw new Error('Observations were not collected with this frozen panel');
  const profiles = new Map(envelope.panel.productProfiles.map(p => [p.id, p]));
  const rows = observations.journeys;
  if (!Array.isArray(rows) || new Set(rows.map(r => r.id)).size !== rows.length || rows.some(r => !profiles.has(r.id))) throw new Error('Invalid, duplicate or unknown journey IDs');
  const people = rows.map(r => profiles.get(r.id));
  const segments = Object.fromEntries(Object.entries(SEGMENTS).map(([name, predicate]) => {
    const selected = rows.filter(r => predicate(profiles.get(r.id)));
    return [name, { n: selected.length, metrics: metrics(selected, selected.map(r => profiles.get(r.id))) }];
  }));
  const coverage = GAMES.flatMap(game => WIDTHS.map(width => {
    const selected = rows.filter(r => r.game === game && r.viewport.width === width);
    return { game, width, executed: selected.length, reachedGame: selected.filter(r => r.reachedGame).length, failures: selected.filter(r => r.status === 'failed').length };
  }));
  return {
    schemaVersion: 1, revision: observations.revision, label: observations.label,
    panelSha256: envelope.sha256, journeyCount: rows.length, completePanel: rows.length === 500,
    interpretation: 'Scripted browser measurements under declared, uncalibrated synthetic policies. Not 500 human testers, efficacy evidence, or satisfaction research.',
    metrics: metrics(rows, people), segments, coverage,
    failures: rows.filter(r => r.status === 'failed').map(r => ({ id: r.id, errors: r.errors, pageErrors: r.pageErrors })),
    geometryFindings: rows.flatMap(r => r.measurements.flatMap(m => {
      const findings = [];
      if (m.horizontalOverflowPx > 1) findings.push('horizontal page overflow');
      if (m.dock && m.width <= 900 && m.dock.height > 140.5) findings.push('optional dock exceeds140px');
      if (m.dock && m.dock.scrollHeight > m.dock.clientHeight + 1 && !['auto', 'scroll'].includes(m.dock.overflowY)) findings.push('optional dock clips content without vertical scrolling');
      if (m.dock && m.dock.scrollWidth > m.dock.clientWidth + 1) findings.push('optional dock content exceeds its visible width');
      if (m.question && m.question.scrollHeight > m.question.clientHeight + 1) findings.push('question title clipped');
      return findings.map(finding => ({ id: r.id, surface: m.surface, width: m.width, finding }));
    })),
    overlapReviewNotes: rows.flatMap(r => r.measurements.flatMap(m => m.coveredControls.map(control => ({ id: r.id, surface: m.surface, width: m.width, control, note: 'Overlap at initial captured scroll position; not a failure by itself. Browser clicks subsequently exercise scroll reachability.' })))),
  };
}

function renderReport(summary) {
  const lines = [
    '# Synthetic product panel', '',
    `Revision: ${summary.revision}. Panel: ${summary.panelSha256}.`, '',
    `${summary.journeyCount}/500 scripted journeys executed. ${summary.interpretation}`, '',
    '| Metric | Classification | Value | Interpretation |', '| --- | --- | --- | --- |',
  ];
  for (const [name, metric] of Object.entries(summary.metrics)) {
    const value = metric.value == null ? 'Not established' : JSON.stringify(metric.value);
    lines.push(`| ${name} | ${metric.classification} | ${value}${metric.denominator == null ? '' : ` / ${metric.denominator}`} | ${metric.note} |`);
  }
  lines.push('', '## Segment disagreements', '', 'Segments overlap. Counts are scenario outcomes, not population estimates.', '', '| Segment | Journeys | Reached game | Policy abandonment | Technical failures | Answers/session median |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const [name, segment] of Object.entries(summary.segments)) {
    const m = segment.metrics;
    lines.push(`| ${name} | ${segment.n} | ${m.reachedGame.value} | ${m.preGameAbandonment.value} | ${m.friction.value} | ${m.questionsAnsweredPerSession.value.median ?? 'n/a'} |`);
  }
  lines.push('', '## Coverage', '', '| Game | Width | Executed | Reached game | Failed |', '| --- | ---: | ---: | ---: | ---: |');
  for (const row of summary.coverage) lines.push(`| ${row.game} | ${row.width} | ${row.executed} | ${row.reachedGame} | ${row.failures} |`);
  lines.push('', '## Technical findings', '', `${summary.failures.length} failed journeys; ${summary.geometryFindings.length} recorded geometry findings. Repeated observations across similar scripts are correlated, not independent user votes.`, '', 'Full traces, profile values and measurements are in the adjacent JSON artifact.', '', 'WebChain, WebLINX and Mind2Web motivate action/observation logging only. No human-calibrated coefficients from those datasets were available or claimed.', 'Elapsed times exclude natural reading/decision delays. Game randomness was not changed; paired results are not a causal efficacy comparison.', 'Human recall, satisfaction, trust, irritation and future use require real participants.', '');
  return lines.join('\n');
}

export function compareReports(baseline, candidate) {
  if (baseline.panelSha256 !== candidate.panelSha256) throw new Error('Baseline and candidate must use the identical frozen panel');
  if (!baseline.completePanel || !candidate.completePanel) throw new Error('Full comparison requires both 500-profile runs');
  const changes = {};
  for (const [name, before] of Object.entries(baseline.metrics)) {
    const after = candidate.metrics[name];
    changes[name] = { classification: after.classification, baseline: before.value, candidate: after.value, delta: typeof before.value === 'number' && typeof after.value === 'number' ? after.value - before.value : null };
  }
  return { panelSha256: baseline.panelSha256, baselineRevision: baseline.revision, candidateRevision: candidate.revision, interpretation: 'Same frozen scripts; automation performance and stochastic games still vary. No human effectiveness inference.', changes, baselineSegments: baseline.segments, candidateSegments: candidate.segments };
}

async function main() {
  const args = argumentsFrom();
  const out = args.out || 'qa-artifacts/synthetic';
  if (args.baseline && args.candidate) {
    const baseline = JSON.parse(await fs.readFile(args.baseline, 'utf8'));
    const candidate = JSON.parse(await fs.readFile(args.candidate, 'utf8'));
    const comparison = compareReports(baseline, candidate);
    await writeNew(path.join(out, 'before-after.json'), JSON.stringify(comparison, null, 2) + '\n');
    const rows = Object.entries(comparison.changes).map(([name, m]) => `| ${name} | ${m.classification} | ${JSON.stringify(m.baseline)} | ${JSON.stringify(m.candidate)} | ${m.delta ?? 'n/a'} |`);
    await writeNew(path.join(out, 'before-after.md'), `# Paired synthetic comparison\n\n${comparison.interpretation}\n\nBaseline ${comparison.baselineRevision}; candidate ${comparison.candidateRevision}.\n\n| Metric | Classification | Baseline | Candidate | Delta |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`);
    return;
  }
  const envelope = await readPanel(args.panel || path.join(out, 'frozen-panel.json'));
  let observations;
  if (args.observations) observations = JSON.parse(await fs.readFile(args.observations, 'utf8'));
  else {
    const base = localBase(args.base || process.env.BASE_URL || 'http://127.0.0.1:3000');
    const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (args.revision && !revision.startsWith(args.revision)) throw new Error(`Checkout ${revision} does not match requested revision ${args.revision}`);
    const label = args.label || 'candidate';
    if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error('Label must contain only letters, digits, underscores or hyphens');
    const count = Number(args.limit || 500);
    const workers = Number(args.workers || 4);
    if (!Number.isInteger(count) || count < 1 || count > 500 || !Number.isInteger(workers) || workers < 1 || workers > 8) throw new Error('limit must be1..500 and workers1..8');
    const artifactDirectory = path.join(out, label);
    await fs.mkdir(out, { recursive: true });
    await fs.mkdir(artifactDirectory, { recursive: false });
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const journeys = [];
    let cursor = 0;
    try {
      await Promise.all(Array.from({ length: workers }, async () => {
        while (cursor < count) {
          const person = envelope.panel.productProfiles[cursor++];
          const result = await runJourney(browser, base, person, { artifactDirectory, captureScreenshots: person.coverageSentinel });
          journeys.push(result);
          await writeNew(path.join(artifactDirectory, `${person.id}.json`), JSON.stringify(result, null, 2) + '\n');
          console.log(`${label} ${person.id}: ${result.status}, reached=${result.reachedGame}, answers=${result.optionalAnswers.length}`);
        }
      }));
    } finally { await browser.close(); }
    journeys.sort((a, b) => a.id.localeCompare(b.id));
    observations = { schemaVersion: 1, panelSha256: envelope.sha256, revision, label, collectedAt: new Date().toISOString(), journeys };
    await writeNew(path.join(out, `${label}-observations.json`), JSON.stringify(observations, null, 2) + '\n');
  }
  const summary = summarize(observations, envelope);
  await writeNew(path.join(out, `${observations.label}-product-report.json`), JSON.stringify(summary, null, 2) + '\n');
  await writeNew(path.join(out, `${observations.label}-product-report.md`), renderReport(summary));
  if (summary.failures.length || summary.geometryFindings.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
