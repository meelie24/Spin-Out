import type { RealityMath, RealityProfile, RunRecord } from './types.js';

export const MAX_RUN_MS = 900_000;

export function sampleOutcome(random: number, stakeCents: number) {
  if (!Number.isFinite(random) || random < 0 || random >= 1) throw new RangeError('random must be in [0,1)');
  if (!Number.isFinite(stakeCents) || stakeCents <= 0) throw new RangeError('stake must be positive');
  if (random < 0.38) return { band: 'loss' as const, netCents: -stakeCents };
  if (random < 0.60) return { band: 'partial-loss' as const, netCents: -Math.round(stakeCents / 2) };
  if (random < 0.76) return { band: 'push' as const, netCents: 0 };
  if (random < 0.94) return { band: 'win' as const, netCents: stakeCents };
  return { band: 'big-win' as const, netCents: Math.round(stakeCents * 2.5) };
}

export function shouldAutoEnd(startedAt: number, now: number) {
  return now - startedAt >= MAX_RUN_MS;
}

export function computeReality(profile: RealityProfile, balanceCents: number): RealityMath {
  const simulatedLossCents = Math.max(0, profile.intendedWagerCents - balanceCents);
  const availableAfterLossCents = profile.availableUntilIncomeCents == null
    ? null
    : profile.availableUntilIncomeCents - simulatedLossCents;
  const obligationShortfallCents = profile.obligationAmountCents == null || availableAfterLossCents == null
    ? null
    : Math.max(0, profile.obligationAmountCents - availableAfterLossCents);
  return { simulatedLossCents, availableAfterLossCents, obligationShortfallCents };
}

export function computeMoneyKept(intendedWagerCents: number, actualWagerCents: number) {
  return {
    keptCents: Math.max(0, intendedWagerCents - actualWagerCents),
    overspentCents: Math.max(0, actualWagerCents - intendedWagerCents),
  };
}

export function recentExitAverageSeconds(runs: RunRecord[]) {
  const values = runs.filter(r => r.exitReason === 'voluntary' && r.timeToExitSeconds != null)
    .slice(-5)
    .map(r => r.timeToExitSeconds as number);
  if (!values.length) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function isObligationExpired(dueDate: string | null, todayIso: string) {
  if (!dueDate) return false;
  return dueDate < todayIso;
}

export function stakeOptionsFor(intendedWagerCents: number): [number, number, number] {
  const roundDollar = (n: number) => Math.max(100, Math.round(n / 100) * 100);
  return [roundDollar(intendedWagerCents * 0.05), roundDollar(intendedWagerCents * 0.10), roundDollar(intendedWagerCents * 0.20)];
}

export function formatMoney(cents: number) {
  const abs = Math.abs(cents) / 100;
  const text = Number.isInteger(abs) ? abs.toFixed(0) : abs.toFixed(2);
  return `${cents < 0 ? '-' : ''}$${text}`;
}

export function daysUntil(dateIso: string | null, now = new Date()) {
  if (!dateIso) return null;
  const target = new Date(`${dateIso}T12:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000));
}
