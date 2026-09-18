import { computeReality, daysUntil, formatMoney } from './engine';
import type { PingCandidate, PingLearning, RealityProfile, RunSnapshot } from './types';

const obligationNames: Record<string, string> = {
  rent: 'rent', car: 'car payment', groceries: 'groceries', 'credit-card': 'credit card',
  utilities: 'utilities', childcare: 'childcare', loan: 'loan', insurance: 'insurance', phone: 'phone bill', other: 'bill', none: 'bill',
};

function id(type: string, snapshot: RunSnapshot) { return `${type}-${snapshot.actionCount}-${snapshot.balanceCents}`; }
function dollars(cents: number) { return formatMoney(cents).replace(/\.00$/, ''); }

export function buildPingCandidates(profile: RealityProfile, snapshot: RunSnapshot): PingCandidate[] {
  if (snapshot.actionCount < 2 || snapshot.actionCount - snapshot.lastPingAction < 2) return [];
  const candidates: PingCandidate[] = [];
  const reality = computeReality(profile, snapshot.balanceCents);
  const obligation = obligationNames[profile.obligationType] ?? 'bill';
  const loss = reality.simulatedLossCents;

  if (reality.obligationShortfallCents != null && reality.obligationShortfallCents > 0) {
    candidates.push({ id: id('shortfall', snapshot), type: 'shortfall', level: 4, factual: true,
      message: `You're ${dollars(reality.obligationShortfallCents)} short on the ${obligation} now. Where's that coming from?` });
  }

  if (profile.obligationAmountCents && loss >= Math.max(2_000, Math.round(profile.obligationAmountCents * 0.2))) {
    const part = Math.min(loss, profile.obligationAmountCents);
    candidates.push({ id: id('obligation', snapshot), type: 'obligation', level: 3, factual: true,
      message: `That's ${dollars(part)} of the ${obligation}. How are you replacing it?` });
  }

  if (profile.recentLenderName && loss >= Math.max(5_000, profile.recentLenderAmountCents ?? 0, profile.intendedWagerCents * 0.5)) {
    candidates.push({ id: id('borrowing', snapshot), type: 'borrowing', level: 5, factual: true,
      message: `${profile.recentLenderName} helped before. You really wanna make that call again?` });
  }

  if (profile.personalMoneyGoal && loss >= Math.max(2_000, profile.intendedWagerCents * 0.25)) {
    candidates.push({ id: id('goal', snapshot), type: 'goal', level: 3, factual: false,
      message: `${dollars(Math.min(loss, profile.intendedWagerCents))} could've gone toward ${profile.personalMoneyGoal}. Another one?` });
  }

  const payday = daysUntil(profile.nextIncomeDate);
  if (payday != null && payday > 0 && loss >= Math.max(3_000, profile.intendedWagerCents * 0.3)) {
    candidates.push({ id: id('payday', snapshot), type: 'payday', level: 3, factual: true,
      message: `${payday} day${payday === 1 ? '' : 's'} till more money comes in. Where's the next ${dollars(snapshot.stakeCents)} coming from?` });
  }

  if (profile.triggerType === 'win-it-back' && snapshot.lastNetCents > 0 && snapshot.balanceCents >= snapshot.initialBalanceCents) {
    candidates.push({ id: id('recovery', snapshot), type: 'recovery', level: 3, factual: true,
      message: `You're back where you started. Isn't that what you wanted?` });
  }

  if (profile.triggerType === 'win-money' && snapshot.balanceCents > snapshot.initialBalanceCents && snapshot.lastNetCents > 0) {
    const up = snapshot.balanceCents - snapshot.initialBalanceCents;
    candidates.push({ id: id('win-money', snapshot), type: 'win-money', level: 2, factual: true,
      message: `You're up ${dollars(up)}. What are you trying to turn it into now?` });
  }

  if (profile.triggerType === 'bored' && snapshot.actionCount >= 5) {
    candidates.push({ id: id('bored', snapshot), type: 'bored', level: 2, factual: true,
      message: `${snapshot.actionCount} plays in. Are you choosing this or just repeating it?` });
  }

  if (profile.triggerType === 'rush' && snapshot.actionCount >= 4) {
    candidates.push({ id: id('rush', snapshot), type: 'rush', level: 2, factual: true,
      message: `${snapshot.actionCount} plays already. Are you deciding, or just chasing the pace?` });
  }

  if (profile.triggerType === 'switch-off' && profile.obligationType !== 'none' && profile.obligationDueDate && snapshot.actionCount >= 4) {
    candidates.push({ id: id('switch-off', snapshot), type: 'switch-off', level: 3, factual: true,
      message: `The ${obligation} is still due. Another play doesn't move that date.` });
  }

  if (profile.triggerType === 'habit' && snapshot.actionCount >= 5) {
    candidates.push({ id: id('habit', snapshot), type: 'habit', level: 2, factual: true,
      message: `That's ${snapshot.actionCount} plays. Was this one a decision or muscle memory?` });
  }

  if (snapshot.stakeCents > snapshot.previousStakeCents && snapshot.balanceCents < snapshot.initialBalanceCents) {
    candidates.push({ id: id('stake-up', snapshot), type: 'stake-up', level: 2, factual: true,
      message: `You're down and the bet just went up. What are you chasing now?` });
  }

  if (loss >= Math.max(2_000, profile.intendedWagerCents * 0.1) || snapshot.actionCount >= 4) {
    candidates.push({ id: id('generic', snapshot), type: 'generic', level: loss >= profile.intendedWagerCents * 0.5 ? 2 : 1, factual: true,
      message: `Down ${dollars(loss)}. You doing another one?` });
  }

  return candidates;
}

export function selectPing(candidates: PingCandidate[], learning: PingLearning, recentTypes: string[]) {
  if (!candidates.length) return null;
  const scored = [...candidates].map(candidate => {
    const stat = learning[candidate.type];
    const learned = stat?.shown ? stat.exitsAfter / stat.shown : 0;
    const repeatPenalty = recentTypes.includes(candidate.type) ? 2 : 0;
    return { candidate, score: candidate.level + learned * 2 - repeatPenalty };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].candidate;
}
