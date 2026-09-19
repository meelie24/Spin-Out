import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const VERSION = 2;
export const DEFAULT_SEED = 'spin-out-panel-2026-09-19-v1';
export const GAMES = ['slots', 'sports', 'casino', 'poker', 'lottery', 'other'];
export const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440];
export const SPECIALTIES = ['consumer mobile', 'interaction design', 'visual hierarchy', 'accessibility', 'content design', 'motion', 'information architecture', 'onboarding/growth', 'design systems', 'behavioral UX', 'data visualization', 'premium consumer UI'];
export const CRITERIA = ['hierarchy', 'density', 'typography', 'spacing', 'mobile ergonomics', 'tap clarity', 'discoverability', 'action clarity', 'content clarity', 'accessibility', 'visual coherence', 'motion appropriateness', 'restraint', 'perceived quality', 'brand distinctiveness', 'trust', 'consistency', 'cognitive load'];
export const SPECIALTY_CRITERIA = [
  ['mobile ergonomics', 'tap clarity', 'density'],
  ['action clarity', 'discoverability', 'consistency'],
  ['hierarchy', 'density', 'spacing'],
  ['accessibility', 'typography', 'mobile ergonomics'],
  ['content clarity', 'action clarity', 'trust'],
  ['motion appropriateness', 'restraint', 'accessibility'],
  ['discoverability', 'hierarchy', 'cognitive load'],
  ['action clarity', 'discoverability', 'cognitive load'],
  ['consistency', 'typography', 'visual coherence'],
  ['trust', 'restraint', 'cognitive load'],
  ['content clarity', 'hierarchy', 'typography'],
  ['perceived quality', 'brand distinctiveness', 'visual coherence'],
];

export function randomFor(seed) {
  let value = createHash('sha256').update(seed).digest().readUInt32LE(0);
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function level(value) { return Math.max(1, Math.min(5, Math.round(value))); }

export function buildPanel(seed = DEFAULT_SEED) {
  const random = randomFor(seed);
  const motives = ['escape/coping', 'chasing', 'financial', 'excitement'];
  const productProfiles = Array.from({ length: 500 }, (_, index) => {
    const motive = motives[index % motives.length];
    const pressure = level(1 + random() * 4 + (motive === 'financial' || motive === 'chasing' ? 1 : 0));
    const urge = Math.min(10, Math.round(2 + random() * 6 + pressure / 3));
    const patience = level(5 - urge / 2.6 + random() * 2);
    const digitalLiteracy = level(1 + random() * 4);
    const skepticism = level(1 + random() * 4);
    const privacySensitivity = level(skepticism * .5 + random() * 3);
    const trust = level(6 - skepticism + random() - .5);
    const readiness = level(1 + random() * 3 + pressure * .2);
    const attention = level(patience * .45 + random() * 3);
    const completionTendency = level(patience * .55 + random() * 3);
    const returning = random() < .3;
    const coverageSentinel = index < GAMES.length * WIDTHS.length;
    const width = WIDTHS[Math.floor(index / GAMES.length) % WIDTHS.length];
    const optionalBudget = completionTendency >= 4 ? 12 : patience >= 3 ? 3 : 1;
    const privacyRefusal = privacySensitivity >= 4 && trust <= 2;
    return {
      id: `product-${String(index + 1).padStart(3, '0')}`,
      motive, urge, financialPressure: pressure, stoppingReadiness: readiness,
      patience, trust, privacySensitivity, digitalLiteracy,
      readingBehavior: attention <= 2 ? 'scan' : 'read', attention, skepticism,
      impulsivity: level(urge / 2.7 + random()), completionTendency,
      device: width <= 430 ? 'phone' : width <= 768 ? 'tablet' : 'desktop',
      viewport: { width, height: width === 320 ? 568 : width < 768 ? 844 : 900 },
      game: GAMES[index % GAMES.length],
      returning: coverageSentinel ? false : returning,
      priorKnowledge: returning ? 'prior session' : 'none',
      contextAvailability: random() < .2 ? 'limited' : 'known',
      reducedMotion: index % 5 === 0,
      coverageSentinel,
      policy: {
        // Stress-scenario assumptions, not population frequencies or calibrated probabilities.
        preGameActionBudget: coverageSentinel ? 12 : patience <= 2 ? 2 + index % 4 : 12,
        optionalAnswerBudget: coverageSentinel ? Math.max(1, optionalBudget) : privacyRefusal ? 0 : optionalBudget,
        refuseOptionalContext: privacyRefusal,
        skipFirst: privacyRefusal || index % 5 === 1,
        reopenAfterSkip: !privacyRefusal && completionTendency >= 3,
        hiddenChoice: digitalLiteracy <= 2 && attention <= 2 ? 'choose visible answer' : 'look for More',
        playActions: 1 + index % 3,
        strongPingAction: readiness >= 4 ? 'exit' : 'continue',
        reloadAfterAnswers: index % 7 === 0,
      },
      truth: {
        wagerLabel: '$100', intendedWagerCents: 10000, obligationType: 'car',
        incomeChoice: index % 3 === 0 ? 'Next week' : 'This week',
        availableUntilIncomeCents: (700 + index) * 100,
        obligationAmountCents: 43000,
        obligationDateChoice: 'This week', quitReason: 'Keep money for the car payment',
        personalMoneyGoal: 'Savings', difficultTime: 'When I’m stressed',
        lenderName: 'Sam', lenderHelped: true, lenderAmountCents: 12000,
        paydayChoice: 'Move bill money first',
      },
    };
  });
  const reviewerProfiles = Array.from({ length: 300 }, (_, index) => {
    const specialtyIndex = index % SPECIALTIES.length;
    return {
      id: `lens-${String(index + 1).padStart(3, '0')}`,
      specialty: SPECIALTIES[specialtyIndex],
      focus: [...SPECIALTY_CRITERIA[specialtyIndex]],
      secondaryCriterion: CRITERIA[(Math.floor(index / SPECIALTIES.length) + specialtyIndex) % CRITERIA.length],
      preferredWidth: WIDTHS[Math.floor(index / SPECIALTIES.length) % WIDTHS.length],
      interpretation: 'Deterministic review lens. Not an independent visual inspection or person.',
    };
  });
  return {
    schemaVersion: VERSION, seed,
    method: 'Deterministic correlated stress scenarios; no empirical calibration or population inference.',
    freezeScope: 'Frozen before panel browser execution. Authors previously saw product code and QA screenshots; this is not a blinded study.',
    baseline: '09d5778', games: GAMES, widths: WIDTHS, criteria: CRITERIA,
    productProfiles, reviewerProfiles,
  };
}

export function panelHash(panel) {
  return createHash('sha256').update(JSON.stringify(panel)).digest('hex');
}

export async function readPanel(filename) {
  const envelope = JSON.parse(await fs.readFile(filename, 'utf8'));
  if (envelope.sha256 !== panelHash(envelope.panel)) throw new Error('Frozen panel hash mismatch');
  if (envelope.panel.productProfiles.length !== 500 || envelope.panel.reviewerProfiles.length !== 300) throw new Error('Panel must contain exactly 500 product profiles and 300 reviewer lenses');
  if (new Set(envelope.panel.productProfiles.map(p => p.id)).size !== 500 || new Set(envelope.panel.reviewerProfiles.map(p => p.id)).size !== 300) throw new Error('Profile IDs must be unique');
  return envelope;
}

export function argumentsFrom(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i]?.startsWith('--') || !argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Expected --name value: ${argv[i]}`);
    args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

export async function writeNew(filename, contents) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, contents, { flag: 'wx' });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = argumentsFrom();
  const panel = buildPanel(args.seed || DEFAULT_SEED);
  const envelope = { sha256: panelHash(panel), panel };
  const output = args.out || 'qa-artifacts/synthetic/frozen-panel.json';
  await writeNew(output, JSON.stringify(envelope, null, 2) + '\n');
  console.log(`Frozen 500 product profiles + 300 reviewer lenses: ${envelope.sha256}`);
}
