import { computeReality, daysUntil, formatMoney, isFinancialContextStale, isObligationExpired } from './engine';
import type { PingCandidate, PingLearning, RealityProfile, RunSnapshot } from './types';

const obligationNames: Record<string, string> = {
  rent: 'rent',
  car: 'car payment',
  groceries: 'groceries',
  'credit-card': 'credit card',
  utilities: 'utilities',
  childcare: 'childcare',
  loan: 'loan',
  insurance: 'insurance',
  phone: 'phone bill',
  other: 'bill',
  none: 'bill',
};

function id(type: string, snapshot: RunSnapshot) {
  return `${type}-${snapshot.actionCount}-${snapshot.balanceCents}`;
}

function dollars(cents: number) {
  return formatMoney(cents).replace(/\.00$/, '');
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function choice<T>(values: T[], seed: number) {
  return values[Math.abs(seed) % values.length];
}

function dueLabel(date: string | null, now: Date) {
  if (!date) return null;
  const due = new Date(`${date}T12:00:00`);
  if (!Number.isFinite(due.getTime())) return null;
  const days = Math.round((due.getTime() - now.getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days > 1 && days < 7) return due.toLocaleDateString('en-US', { weekday: 'long' });
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function cleanReason(reason: string | null | undefined) {
  const value = reason?.trim().replace(/\s+/g, ' ');
  if (!value) return null;
  return value.length > 92 ? value.slice(0, 89).trimEnd() + '…' : value;
}

export function buildPingCandidates(profile: RealityProfile, snapshot: RunSnapshot, now = Date.now()): PingCandidate[] {
  const intervals = snapshot.actionIntervalsMs ?? [];
  const lastInterval = intervals.at(-1) ?? null;
  const recentFour = intervals.slice(-4);
  const rapidFour = recentFour.length === 4 && recentFour.every(ms => ms < 1_900);
  const sessionElapsedMs = snapshot.startedAt ? Math.max(0, now - snapshot.startedAt) : 0;
  const sessionMinutes = Math.floor(sessionElapsedMs / 60_000);
  const limitRounds = snapshot.chosenLimitRounds ?? null;
  const limitMinutes = snapshot.chosenLimitMinutes ?? null;
  const roundLimitReached = limitRounds != null && snapshot.actionCount === limitRounds;
  const roundLimitExceeded = limitRounds != null && snapshot.actionCount > limitRounds;
  const timeLimitExceeded = limitMinutes != null && sessionElapsedMs > limitMinutes * 60_000;
  const urgent =
    roundLimitReached
    || roundLimitExceeded
    || timeLimitExceeded
    || rapidFour
    || (snapshot.pingDismissalStreak ?? 0) >= 4;

  if (snapshot.actionCount < 2 && !urgent) return [];
  if (snapshot.lastPingAt && now - snapshot.lastPingAt < 15_000 && !urgent) return [];
  if (snapshot.actionCount - snapshot.lastPingAction < 2 && !urgent) return [];

  const candidates: PingCandidate[] = [];
  const reality = computeReality(profile, snapshot.balanceCents);
  const obligation = obligationNames[profile.obligationType] ?? 'bill';
  const loss = reality.simulatedLossCents;
  const nowDate = new Date(now);
  const financeFresh = !isFinancialContextStale(profile, nowDate);
  const today = nowDate.toISOString().slice(0, 10);
  const obligationFresh = financeFresh && !isObligationExpired(profile.obligationDueDate, today);
  const due = dueLabel(profile.obligationDueDate, nowDate);

  // User-defined stopping point.
  if (limitRounds != null && snapshot.actionCount === limitRounds) {
    candidates.push({
      id: id('limit-reached', snapshot),
      type: 'limit-reached',
      level: 4,
      factual: true,
      message: `That's the ${limitRounds} you chose.`,
      detail: 'Still stopping here?',
    });
  }

  if (roundLimitExceeded) {
    const over = snapshot.actionCount - limitRounds!;
    candidates.push({
      id: id('limit-exceeded', snapshot),
      type: 'limit-exceeded',
      level: over >= 2 ? 5 : 4,
      factual: true,
      requiresChoice: over >= 2,
      message: `You decided on ${limitRounds}. This is ${snapshot.actionCount}.`,
      detail: over >= 2 ? 'What are you waiting to happen before you leave?' : 'What changed?',
    });
  }

  if (limitMinutes != null && sessionElapsedMs >= limitMinutes * 60_000 && sessionElapsedMs < (limitMinutes + 1) * 60_000) {
    candidates.push({
      id: id('time-limit-reached', snapshot),
      type: 'time-limit-reached',
      level: 4,
      factual: true,
      message: `You gave this ${limitMinutes} minute${limitMinutes === 1 ? '' : 's'}.`,
      detail: 'That time is up.',
    });
  }

  if (timeLimitExceeded && sessionElapsedMs >= (limitMinutes! + 1) * 60_000) {
    candidates.push({
      id: id('time-limit-exceeded', snapshot),
      type: 'time-limit-exceeded',
      level: 5,
      factual: true,
      requiresChoice: sessionElapsedMs >= (limitMinutes! + 2) * 60_000,
      message: `You're past the ${limitMinutes} minutes you chose.`,
      detail: 'What changed?',
    });
  }

  // Rapid play and accelerating decisions.
  if (rapidFour) {
    candidates.push({
      id: id('rapid-loop', snapshot),
      type: 'rapid-loop',
      level: 5,
      factual: true,
      requiresChoice: true,
      message: "You haven't stopped long enough to think between the last four.",
      detail: 'Keep going, or leave here.',
    });
  } else if (lastInterval != null && lastInterval < 1_600) {
    candidates.push({
      id: id('rapid-replay', snapshot),
      type: 'rapid-replay',
      level: 3,
      factual: true,
      message: choice([
        'That was fast. Did you even decide to go again?',
        "You're pressing faster now. Was that one a decision?",
      ], snapshot.actionCount),
    });
  }

  if (intervals.length >= 6) {
    const early = average(intervals.slice(0, 3));
    const recent = average(intervals.slice(-3));
    if (early != null && recent != null && recent < early * 0.65 && recent < 3_500) {
      candidates.push({
        id: id('speeding-up', snapshot),
        type: 'speeding-up',
        level: 3,
        factual: true,
        message: "You're making the decisions faster now.",
        detail: 'Did anything actually change?',
      });
    }
  }

  // Repeated dismissals.
  if ((snapshot.pingDismissalStreak ?? 0) >= 4) {
    candidates.push({
      id: id('dismissals', snapshot),
      type: 'dismissals',
      level: 5,
      factual: true,
      message: "You've closed the last four without reading them.",
    });
  }

  // Loss chasing and stake escalation.
  if ((snapshot.consecutiveLosses ?? 0) >= 3) {
    candidates.push({
      id: id('loss-streak', snapshot),
      type: 'loss-streak',
      level: profile.triggerType === 'win-it-back' ? 5 : 4,
      factual: true,
      message: choice([
        `${snapshot.consecutiveLosses} losses. Are you trying to get it back now?`,
        'Were you actually done, or did the losses change your mind?',
      ], snapshot.actionCount),
      explanation: "Those losses didn't make the next result more likely to win.",
    });
  }

  if (snapshot.stakeCents > snapshot.previousStakeCents && snapshot.balanceCents < snapshot.initialBalanceCents) {
    candidates.push({
      id: id('stake-up', snapshot),
      type: 'stake-up',
      level: 5,
      factual: true,
      message: 'You lost, then raised it.',
      detail: 'What were you expecting the bigger amount to fix?',
    });
  }

  // Wins and near misses get interpreted after the result lands.
  if (snapshot.nearMiss) {
    candidates.push({
      id: id('near-miss', snapshot),
      type: 'near-miss',
      level: 4,
      factual: true,
      message: "That looked close. It wasn't.",
      detail: 'The result was still a loss.',
      explanation: "It looked closer. The next result wasn't any more likely to win.",
    });
  }

  if ((snapshot.lossesBeforeLastWin ?? 0) >= 2 && snapshot.lastNetCents > 0) {
    candidates.push({
      id: id('win-after-losses', snapshot),
      type: 'win-after-losses',
      level: 4,
      factual: true,
      message: 'Would this win make you stay longer?',
      detail: 'How much would you give back trying to hit it again?',
      explanation: "That win didn't erase the losses before it. Did it make staying feel easier to justify?",
    });
  } else if ((snapshot.consecutiveWins ?? 0) >= 2) {
    candidates.push({
      id: id('win-streak', snapshot),
      type: 'win-streak',
      level: 3,
      factual: true,
      message: 'Two wins back-to-back.',
      detail: 'Does that make stopping harder?',
    });
  }

  // Time and returning quickly after leaving.
  if (sessionElapsedMs >= 11 * 60_000) {
    candidates.push({
      id: id('long-session', snapshot),
      type: 'long-session',
      level: 4,
      factual: true,
      message: `You've been here ${sessionMinutes} minutes.`,
      detail: 'Were you planning to stay this long?',
    });
  } else if (sessionElapsedMs >= 8 * 60_000 && limitMinutes == null) {
    candidates.push({
      id: id('time-check', snapshot),
      type: 'time-check',
      level: 2,
      factual: true,
      message: `You've been here ${sessionMinutes} minutes.`,
      detail: 'Were you planning to still be playing?',
    });
  }

  if (snapshot.returnedAfterMs != null && snapshot.returnedAfterMs >= 0 && snapshot.returnedAfterMs <= 10 * 60_000) {
    const minutes = Math.max(1, Math.round(snapshot.returnedAfterMs / 60_000));
    candidates.push({
      id: id('quick-return', snapshot),
      type: 'quick-return',
      level: 3,
      factual: true,
      message: `You were back here ${minutes} minute${minutes === 1 ? '' : 's'} after leaving.`,
      detail: 'What pulled you back?',
    });
  }

  // Precise real-life money context, only when the user supplied it and the data is fresh.
  if (obligationFresh && reality.obligationShortfallCents != null && reality.obligationShortfallCents > 0) {
    candidates.push({
      id: id('shortfall', snapshot),
      type: 'shortfall',
      level: 5,
      factual: true,
      message: `You'd be ${dollars(reality.obligationShortfallCents)} short on the ${obligation}.`,
      detail: 'Where would that come from?',
    });
  }

  if (obligationFresh && profile.obligationAmountCents && loss >= Math.max(2_000, Math.round(profile.obligationAmountCents * 0.2))) {
    const part = Math.min(loss, profile.obligationAmountCents);
    const dueText = due ? ` due ${due}` : '';
    candidates.push({
      id: id('obligation', snapshot),
      type: 'obligation',
      level: 4,
      factual: true,
      message: `That's ${dollars(part)} of the ${dollars(profile.obligationAmountCents)} ${obligation}${dueText}.`,
      detail: 'How were you getting that back?',
    });
  }

  if (financeFresh && profile.availableUntilIncomeCents != null && loss > 0) {
    const left = profile.availableUntilIncomeCents - loss;
    if (left >= 0 && left <= Math.max(10_000, profile.availableUntilIncomeCents * 0.35)) {
      candidates.push({
        id: id('money-left', snapshot),
        type: 'money-left',
        level: 4,
        factual: true,
        message: `You'd have ${dollars(left)} left until more money comes in.`,
      });
    }
  }

  if (profile.recentLenderName && profile.recentLenderHelpedRecently && loss >= Math.max(5_000, profile.recentLenderAmountCents ?? 0, profile.intendedWagerCents * 0.5)) {
    candidates.push({
      id: id('borrowing', snapshot),
      type: 'borrowing',
      level: 5,
      factual: true,
      message: `${profile.recentLenderName} helped before.`,
      detail: 'You really wanna make that call again?',
    });
  }

  if (profile.personalMoneyGoal && loss >= Math.max(2_000, profile.intendedWagerCents * 0.25)) {
    candidates.push({
      id: id('goal', snapshot),
      type: 'goal',
      level: 3,
      factual: false,
      message: `${dollars(Math.min(loss, profile.intendedWagerCents))} could've stayed available for ${profile.personalMoneyGoal}.`,
      detail: 'Still going?',
    });
  }

  const payday = financeFresh ? daysUntil(profile.nextIncomeDate, nowDate) : null;
  if (payday != null && payday > 0 && loss >= Math.max(3_000, profile.intendedWagerCents * 0.3)) {
    candidates.push({
      id: id('payday', snapshot),
      type: 'payday',
      level: 3,
      factual: true,
      message: `${payday} day${payday === 1 ? '' : 's'} till more money comes in.`,
      detail: `Where's the next ${dollars(snapshot.stakeCents)} coming from?`,
    });
  }

  if ((snapshot.totalStakedCents ?? 0) >= profile.intendedWagerCents && snapshot.actionCount >= 4) {
    candidates.push({
      id: id('amount-through', snapshot),
      type: 'amount-through',
      level: 2,
      factual: true,
      message: `You've put ${dollars(snapshot.totalStakedCents ?? 0)} through this session.`,
      detail: 'Is that more than you meant to put through?',
    });
  }

  // The person's own reason is rare and only appears once the session has earned the reminder.
  const reason = cleanReason(profile.quitReason);
  if (
    reason
    && (
      roundLimitExceeded
      || timeLimitExceeded
      || sessionElapsedMs >= 8 * 60_000
      || loss >= profile.intendedWagerCents * 0.45
    )
  ) {
    candidates.push({
      id: id('quit-reason', snapshot),
      type: 'quit-reason',
      level: 4,
      factual: true,
      message: `You said: “${reason}”`,
      detail: 'Would this be another one?',
    });
  }

  // Existing trigger-specific context still shapes the conversation.
  const previousReality = computeReality(profile, snapshot.previousBalanceCents);
  const repairedShortfall =
    obligationFresh
    && previousReality.obligationShortfallCents != null
    && previousReality.obligationShortfallCents > 0
    && reality.obligationShortfallCents === 0
    && snapshot.lastNetCents > 0;
  const backToStart =
    snapshot.lastNetCents > 0
    && snapshot.balanceCents >= snapshot.initialBalanceCents
    && snapshot.previousBalanceCents < snapshot.initialBalanceCents;

  if (repairedShortfall || (profile.triggerType === 'win-it-back' && backToStart)) {
    candidates.push({
      id: id('recovery', snapshot),
      type: 'recovery',
      level: 4,
      factual: true,
      message: repairedShortfall ? `The ${obligation} is covered again.` : "You're back where you started.",
      detail: 'What are you still trying to win?',
    });
  }

  if (profile.triggerType === 'win-money' && snapshot.balanceCents > snapshot.initialBalanceCents && snapshot.lastNetCents > 0) {
    const up = snapshot.balanceCents - snapshot.initialBalanceCents;
    candidates.push({
      id: id('win-money', snapshot),
      type: 'win-money',
      level: 3,
      factual: true,
      message: `You're up ${dollars(up)}.`,
      detail: 'What are you trying to turn it into now?',
    });
  }

  if (profile.triggerType === 'bored' && snapshot.actionCount >= 5) {
    candidates.push({
      id: id('bored', snapshot),
      type: 'bored',
      level: 2,
      factual: true,
      message: `${snapshot.actionCount} rounds in.`,
      detail: 'Are you choosing this or just repeating it?',
    });
  }

  if (profile.triggerType === 'habit' && snapshot.actionCount >= 5) {
    candidates.push({
      id: id('habit', snapshot),
      type: 'habit',
      level: 2,
      factual: true,
      message: `That's ${snapshot.actionCount} rounds.`,
      detail: 'Was this one a decision or muscle memory?',
    });
  }

  if (profile.triggerType === 'rush' && snapshot.actionCount >= 4 && lastInterval != null) {
    candidates.push({
      id: id('rush', snapshot),
      type: 'rush',
      level: 2,
      factual: true,
      message: 'Are you playing for the rush now?',
    });
  }

  if (profile.triggerType === 'switch-off' && obligationFresh && profile.obligationType !== 'none' && snapshot.actionCount >= 4) {
    candidates.push({
      id: id('switch-off', snapshot),
      type: 'switch-off',
      level: 3,
      factual: true,
      message: `The ${obligation} is still there.`,
      detail: "Another round doesn't move the date.",
    });
  }

  // A low-priority factual fallback, only after a meaningful amount has moved.
  if (loss >= Math.max(3_000, profile.intendedWagerCents * 0.2)) {
    candidates.push({
      id: id('loss-total', snapshot),
      type: 'loss-total',
      level: 1,
      factual: true,
      message: `You're down ${dollars(loss)}.`,
      detail: 'What number are you trying to get back to?',
    });
  }

  return candidates;
}

export function selectPing(candidates: PingCandidate[], learning: PingLearning, recentTypes: string[]) {
  if (!candidates.length) return null;

  const scored = candidates.map(candidate => {
    const stat = learning[candidate.type];
    const shown = stat?.shown ?? 0;
    const learnedExit = shown ? (stat?.exitsAfter ?? 0) / shown : 0;
    const learnedStakeDown = shown ? (stat?.stakeDownAfter ?? 0) / shown : 0;
    const learnedStakeUp = shown ? (stat?.stakeUpAfter ?? 0) / shown : 0;
    const learnedContinue = shown ? (stat?.continuedAfter ?? 0) / shown : 0;
    const learnedRecoveryExit = shown ? (stat?.recoveryExitAfter ?? 0) / shown : 0;
    const repeatPenalty = (recentTypes.includes(candidate.type) ? 3 : 0)
      + (candidate.type === 'quit-reason' && shown > 0 ? 8 : 0);
    const behaviorScore =
      learnedExit * 1.4
      + learnedStakeDown * .7
      + learnedRecoveryExit
      - learnedStakeUp * .4
      - learnedContinue * .25;

    return {
      candidate,
      score: candidate.level + behaviorScore - repeatPenalty,
    };
  });

  scored.sort((a, b) => b.score - a.score || a.candidate.type.localeCompare(b.candidate.type));
  return scored[0].candidate;
}
