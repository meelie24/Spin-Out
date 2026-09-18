import type { InterventionDirectorState, PingCandidate } from '../types';

export type InterventionSurface = 'ping' | 'xray' | 'strong';
export type AmbientMode = 'normal' | 'cooling' | 'ledger' | 'strong';

export type DirectorState = InterventionDirectorState;

export interface DirectorInput {
  now: number;
  candidates: PingCandidate[];
  foregroundOpen: boolean;
  state: DirectorState;
}

export interface DirectorForeground {
  family: string;
  surface: InterventionSurface;
  candidate: PingCandidate;
}

export interface DirectorDecision {
  foreground: DirectorForeground | null;
  ambientMode: AmbientMode;
  nextState: DirectorState;
  suppressed: string[];
}

const FAMILY: Record<string, string> = {
  'limit-reached': 'limit',
  'limit-exceeded': 'limit',
  'time-limit-reached': 'limit',
  'time-limit-exceeded': 'limit',
  'stake-up': 'chasing',
  'loss-streak': 'chasing',
  recovery: 'chasing',
  'rapid-loop': 'pace',
  'rapid-replay': 'pace',
  'speeding-up': 'pace',
  rush: 'pace',
  'near-miss': 'near-miss',
  'win-after-losses': 'win',
  'win-streak': 'win',
  'win-money': 'win',
  shortfall: 'ledger',
  obligation: 'ledger',
  'money-left': 'ledger',
  payday: 'ledger',
  goal: 'ledger',
  borrowing: 'ledger',
  'amount-through': 'ledger',
  'quit-reason': 'personal',
  dismissals: 'dismissal',
  'long-session': 'session',
  'time-check': 'session',
  'quick-return': 'return',
  bored: 'trigger',
  habit: 'trigger',
  'switch-off': 'trigger',
  'loss-total': 'loss',
};

const TYPE_PRIORITY: Record<string, number> = {
  'limit-exceeded': 12,
  'time-limit-exceeded': 12,
  'stake-up': 10,
  'loss-streak': 8,
  'rapid-loop': 7,
  dismissals: 6,
  'near-miss': 5,
  'win-after-losses': 5,
};

const FAMILY_PRIORITY: Record<string, number> = {
  limit: 100,
  chasing: 90,
  pace: 78,
  dismissal: 76,
  'near-miss': 70,
  win: 68,
  ledger: 58,
  personal: 56,
  return: 52,
  session: 48,
  trigger: 42,
  loss: 35,
};

const X_RAY_TYPES = new Set([
  'near-miss',
  'stake-up',
  'loss-streak',
  'win-after-losses',
  'speeding-up',
  'rapid-replay',
]);

const STRONG_TYPES = new Set([
  'limit-exceeded',
  'time-limit-exceeded',
  'rapid-loop',
  'dismissals',
]);

const LEDGER_TYPES = new Set([
  'shortfall',
  'obligation',
  'money-left',
  'payday',
  'goal',
  'borrowing',
  'amount-through',
]);

const CHASING_TYPES = new Set([
  'stake-up',
  'loss-streak',
  'recovery',
  'rapid-loop',
  'rapid-replay',
  'speeding-up',
]);

const BASE_FOREGROUND_COOLDOWN_MS = 15_000;
const FAMILY_COOLDOWN_MS = 45_000;
const STRONG_FAMILY_COOLDOWN_MS = 20_000;
const RECENT_FAMILY_RETENTION_MS = 3 * 60_000;

export function initialDirectorState(): DirectorState {
  return {
    lastForegroundAt: null,
    lastForegroundFamily: null,
    recentFamilies: [],
    ambientMode: 'normal',
  };
}

export function interventionFamily(type: string) {
  return FAMILY[type] ?? 'general';
}

function surfaceFor(candidate: PingCandidate): InterventionSurface {
  if (candidate.requiresChoice || STRONG_TYPES.has(candidate.type)) return 'strong';
  if (X_RAY_TYPES.has(candidate.type)) return 'xray';
  return 'ping';
}

function priority(candidate: PingCandidate) {
  const family = interventionFamily(candidate.type);
  return (FAMILY_PRIORITY[family] ?? 25) + candidate.level + (TYPE_PRIORITY[candidate.type] ?? 0);
}

function ambientFor(candidates: PingCandidate[]): AmbientMode {
  if (candidates.some(candidate =>
    candidate.type === 'limit-exceeded'
    || candidate.type === 'time-limit-exceeded'
    || candidate.type === 'dismissals'
  )) return 'strong';

  if (candidates.some(candidate => CHASING_TYPES.has(candidate.type))) return 'cooling';
  if (candidates.some(candidate => LEDGER_TYPES.has(candidate.type))) return 'ledger';
  return 'normal';
}

function recentFamilies(state: DirectorState, now: number) {
  return state.recentFamilies.filter(item => now - item.at <= RECENT_FAMILY_RETENTION_MS);
}

function familyRecentlyShown(
  family: string,
  state: DirectorState,
  now: number,
  surface: InterventionSurface,
) {
  const latest = [...state.recentFamilies]
    .reverse()
    .find(item => item.family === family);
  if (!latest) return false;
  const cooldown = surface === 'strong' && family === 'limit'
    ? STRONG_FAMILY_COOLDOWN_MS
    : FAMILY_COOLDOWN_MS;
  return now - latest.at < cooldown;
}

function baseCooldownActive(state: DirectorState, now: number, surface: InterventionSurface) {
  if (state.lastForegroundAt == null) return false;
  if (surface === 'strong') return false;
  return now - state.lastForegroundAt < BASE_FOREGROUND_COOLDOWN_MS;
}

export function decideIntervention(input: DirectorInput): DirectorDecision {
  const ambientMode = ambientFor(input.candidates);
  const currentRecent = recentFamilies(input.state, input.now);
  const baseState: DirectorState = {
    ...input.state,
    recentFamilies: currentRecent,
    ambientMode,
  };

  if (!input.candidates.length || input.foregroundOpen) {
    return {
      foreground: null,
      ambientMode,
      nextState: baseState,
      suppressed: input.foregroundOpen ? input.candidates.map(candidate => candidate.type) : [],
    };
  }

  const ranked = [...input.candidates]
    .sort((a, b) => priority(b) - priority(a) || a.type.localeCompare(b.type));

  const suppressed: string[] = [];
  for (const candidate of ranked) {
    const family = interventionFamily(candidate.type);
    const surface = surfaceFor(candidate);

    if (baseCooldownActive(baseState, input.now, surface)) {
      suppressed.push(candidate.type);
      continue;
    }

    if (familyRecentlyShown(family, baseState, input.now, surface)) {
      suppressed.push(candidate.type);
      continue;
    }

    const foreground: DirectorForeground = { family, surface, candidate };
    const nextState: DirectorState = {
      lastForegroundAt: input.now,
      lastForegroundFamily: family,
      recentFamilies: [...currentRecent, { family, at: input.now }].slice(-8),
      ambientMode,
    };

    return { foreground, ambientMode, nextState, suppressed };
  }

  return {
    foreground: null,
    ambientMode,
    nextState: baseState,
    suppressed,
  };
}
