import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { argumentsFrom, readPanel, writeNew, CRITERIA } from './panel-config.mjs';

export async function validateObservations(observations, screenshotRoot = process.cwd()) {
  if (!observations.revision || !Array.isArray(observations.surfaces) || !observations.surfaces.length) throw new Error('Observation JSON needs revision and actual surface observations');
  const seen = new Set();
  const root = await fs.realpath(screenshotRoot);
  for (const surface of observations.surfaces) {
    if (!surface.id || !surface.observerId || !surface.screenshot || !surface.loudest || !Number.isInteger(surface.width)) throw new Error('Each surface needs id, observerId, screenshot, width and loudest');
    const key = `${surface.id}:${surface.width}:${surface.observerId}`;
    if (seen.has(key)) throw new Error(`Duplicate observer/surface record: ${key}`);
    seen.add(key);
    const filename = await fs.realpath(path.resolve(root, surface.screenshot));
    if (filename !== root && !filename.startsWith(root + path.sep)) throw new Error('Screenshot path escapes the declared screenshot root');
    const bytes = await fs.readFile(filename);
    if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Actual PNG screenshot required: ${surface.screenshot}`);
    if (bytes.readUInt32BE(16) !== surface.width) throw new Error(`Screenshot width differs from declared viewport: ${surface.screenshot}`);
    surface.screenshotSha256 = createHash('sha256').update(bytes).digest('hex');
    for (const criterion of CRITERIA) {
      const observation = surface.criteria?.[criterion];
      if (!observation || !['pass', 'issue', 'not-assessed'].includes(observation.status)) throw new Error(`Explicit observation or not-assessed required: ${key}/${criterion}`);
      if (!observation.evidence) throw new Error(`Evidence or reason not assessed required: ${key}/${criterion}`);
      if (observation.status === 'issue' && (!observation.finding || !['critical', 'high', 'medium', 'low'].includes(observation.severity))) throw new Error(`Issue requires finding and severity: ${key}/${criterion}`);
      if (criterion === 'motion appropriateness' && observation.status !== 'not-assessed' && observation.evidenceType !== 'browser observation') throw new Error('Static PNGs cannot establish motion behavior; supply actual browser evidence or mark not-assessed');
    }
  }
  return observations;
}

export function evaluateLenses(envelope, observations) {
  const lenses = envelope.panel.reviewerProfiles.map(profile => {
    const criteria = new Set([...profile.focus, profile.secondaryCriterion]);
    const surfaces = observations.surfaces.filter(surface => surface.width === profile.preferredWidth);
    const findings = surfaces.flatMap(surface => [...criteria].filter(criterion => surface.criteria[criterion].status === 'issue').map(criterion => ({ surface: surface.id, width: surface.width, observerId: surface.observerId, criterion, finding: surface.criteria[criterion].finding })));
    return {
      id: profile.id, specialty: profile.specialty, preferredWidth: profile.preferredWidth,
      assessedSourceRecords: surfaces.length, applicableCriteria: [...criteria], findings,
      classification: 'modeled relevance lens applied to existing observations, not an independent visual review',
    };
  });
  const grouped = new Map();
  for (const surface of observations.surfaces) {
    for (const criterion of CRITERIA) {
      const observation = surface.criteria[criterion];
      if (observation.status !== 'issue') continue;
      const key = JSON.stringify([surface.id, surface.width, criterion, observation.finding]);
      if (!grouped.has(key)) grouped.set(key, { surface: surface.id, width: surface.width, criterion, finding: observation.finding, severity: observation.severity, observers: new Set(), screenshots: new Set(), evidence: [] });
      const entry = grouped.get(key);
      entry.observers.add(surface.observerId);
      entry.screenshots.add(surface.screenshot);
      entry.evidence.push(observation.evidence);
    }
  }
  const findings = [...grouped.values()].map(entry => ({ ...entry, actualObserverCount: entry.observers.size, observerIds: [...entry.observers], observers: undefined, screenshots: [...entry.screenshots], applicableLensCount: lenses.filter(lens => lens.findings.some(f => f.surface === entry.surface && f.width === entry.width && f.criterion === entry.criterion && f.finding === entry.finding)).length }));
  const disagreements = [];
  for (const surface of observations.surfaces) {
    const peers = observations.surfaces.filter(other => other.id === surface.id && other.width === surface.width);
    if (peers[0] !== surface || peers.length < 2) continue;
    const loudest = [...new Set(peers.map(peer => peer.loudest))];
    if (loudest.length > 1) disagreements.push({ surface: surface.id, width: surface.width, kind: 'loudest element differs', observations: peers.map(peer => ({ observerId: peer.observerId, loudest: peer.loudest })) });
    for (const criterion of CRITERIA) {
      const statuses = new Set(peers.map(peer => peer.criteria[criterion].status));
      if (statuses.has('pass') && statuses.has('issue')) disagreements.push({ surface: surface.id, width: surface.width, kind: 'rubric disagreement', criterion, observations: peers.map(peer => ({ observerId: peer.observerId, ...peer.criteria[criterion] })) });
    }
  }
  return {
    schemaVersion: 1, revision: observations.revision, panelSha256: envelope.sha256,
    reviewerLensCount: lenses.length, actualObserverCount: new Set(observations.surfaces.map(s => s.observerId)).size,
    actualScreenshotCount: new Set(observations.surfaces.map(s => s.screenshotSha256)).size,
    interpretation: '300 deterministic review lenses organize supplied screenshot/browser findings. They do not constitute 300 independent inspections, human votes or measured user perception.',
    lensesWithoutMatchingViewportEvidence: lenses.filter(lens => lens.assessedSourceRecords === 0).length,
    rubricCoverage: CRITERIA.map(criterion => ({ criterion, assessed: observations.surfaces.filter(s => s.criteria[criterion].status !== 'not-assessed').length, notAssessed: observations.surfaces.filter(s => s.criteria[criterion].status === 'not-assessed').length })),
    findings, disagreements, lenses, sourceObservations: observations,
    psychologicalLimits: 'Trust, perceived quality and cognitive load are observer interpretations of visible cues. This panel does not measure human trust, aesthetic preference or cognitive load.',
  };
}

function markdown(report) {
  const lines = [
    '# Synthetic UI/UX review lenses', '',
    `Revision: ${report.revision}. Frozen panel: ${report.panelSha256}.`, '',
    report.interpretation, '',
    `${report.reviewerLensCount} lenses; ${report.actualObserverCount} actual supplied observer identities; ${report.actualScreenshotCount} distinct PNGs. ${report.lensesWithoutMatchingViewportEvidence} lenses lack screenshots at their assigned viewport.`, '',
    report.psychologicalLimits, '',
    '| Surface | Width | Criterion | Severity | Finding | Actual observers | Applicable lenses |',
    '| --- | ---: | --- | --- | --- | ---: | ---: |',
  ];
  for (const f of report.findings) lines.push(`| ${f.surface} | ${f.width} | ${f.criterion} | ${f.severity} | ${f.finding.replaceAll('|', '/').replaceAll('\n', ' ')} | ${f.actualObserverCount} | ${f.applicableLensCount} |`);
  lines.push('', 'Lens counts indicate coverage, not independent agreement. Findings repeated by the same source are counted once per source/surface/criterion.', '', '## Rubric coverage', '', '| Criterion | Assessed records | Not assessed |', '| --- | ---: | ---: |');
  for (const c of report.rubricCoverage) lines.push(`| ${c.criterion} | ${c.assessed} | ${c.notAssessed} |`);
  lines.push('', '## Disagreements', '', `${report.disagreements.length} recorded disagreements across actual source observations. No disagreement was manufactured to populate the panel.`, '');
  for (const d of report.disagreements) lines.push(`- ${d.surface}, ${d.width}px: ${d.kind}${d.criterion ? ` (${d.criterion})` : ''}. Source observations are retained in JSON.`);
  lines.push('', 'No universal visual score is produced. Missing screenshots, motion evidence and human validation remain explicit gaps.', '');
  return lines.join('\n');
}

async function main() {
  const args = argumentsFrom();
  if (!args.observations) throw new Error('--observations must identify real screenshot/browser assessments');
  const out = args.out || 'qa-artifacts/synthetic';
  const envelope = await readPanel(args.panel || path.join(out, 'frozen-panel.json'));
  const observations = await validateObservations(JSON.parse(await fs.readFile(args.observations, 'utf8')), args['screenshot-root'] || process.cwd());
  const report = evaluateLenses(envelope, observations);
  const label = args.label || 'candidate';
  if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error('Invalid label');
  await writeNew(path.join(out, `${label}-uiux-report.json`), JSON.stringify(report, null, 2) + '\n');
  await writeNew(path.join(out, `${label}-uiux-report.md`), markdown(report));
  console.log(`${report.reviewerLensCount} reviewer lenses applied to ${report.actualScreenshotCount} actual screenshots; ${report.actualObserverCount} source observers`);
  if (report.findings.some(f => f.severity === 'critical' || f.severity === 'high')) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
