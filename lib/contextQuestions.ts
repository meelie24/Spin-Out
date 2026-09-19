import { isFinancialContextStale } from './engine';
import type { OnboardingQuestionKey, RealityProfile } from './types';

const FINANCIAL_KEYS: OnboardingQuestionKey[] = [
  'income-date',
  'available-money',
  'obligation-amount',
  'obligation-date',
];

const DEEPER_KEYS: OnboardingQuestionKey[] = [
  'quit-reason',
  'money-goal',
  'difficult-times',
  'lender-name',
  'lender-helped',
  'lender-amount',
  'payday-plan',
];

export function completedContextKeys(profile: RealityProfile) {
  const completed = new Set<OnboardingQuestionKey>(profile.onboardingCompleted ?? []);

  // Legacy profiles predate explicit completion markers. Infer only for those
  // profiles so a deliberate null / "not sure" marker remains authoritative.
  if (!profile.onboardingCompleted) {
    if (profile.nextIncomeDate) completed.add('income-date');
    if (profile.availableUntilIncomeCents != null) completed.add('available-money');

    if (profile.obligationType === 'none') {
      completed.add('obligation-amount');
      completed.add('obligation-date');
    } else {
      if (profile.obligationAmountCents != null) completed.add('obligation-amount');
      if (profile.obligationDueDate) completed.add('obligation-date');
    }

    if (profile.quitReason?.trim()) completed.add('quit-reason');
    if (profile.personalMoneyGoal?.trim()) completed.add('money-goal');
    if (profile.difficultTimes?.length) completed.add('difficult-times');

    if (profile.recentLenderName?.trim()) {
      completed.add('lender-name');
      completed.add('lender-helped');
      if (!profile.recentLenderHelpedRecently || profile.recentLenderAmountCents != null) {
        completed.add('lender-amount');
      }
    }

    if (profile.paydayPlanActions?.length) completed.add('payday-plan');
  }

  if (isFinancialContextStale(profile)) {
    for (const key of FINANCIAL_KEYS) completed.delete(key);
  }

  // A bill that does not exist has no amount or due date to collect.
  if (profile.obligationType === 'none') {
    completed.add('obligation-amount');
    completed.add('obligation-date');
  }

  // If there is nobody to call, the dependent lender questions have no job.
  if (completed.has('lender-name') && !profile.recentLenderName?.trim()) {
    completed.add('lender-helped');
    completed.add('lender-amount');
  }

  if (completed.has('lender-helped') && !profile.recentLenderHelpedRecently) {
    completed.add('lender-amount');
  }

  return completed;
}

export function getAutomaticInRunContextKeys(profile: RealityProfile) {
  const completed = completedContextKeys(profile);
  return FINANCIAL_KEYS.filter(key => !completed.has(key));
}

export function getManualContextKeys(profile: RealityProfile) {
  const completed = completedContextKeys(profile);
  const keys = [...FINANCIAL_KEYS, ...DEEPER_KEYS];

  return keys.filter(key => {
    if (completed.has(key)) return false;
    if ((key === 'obligation-amount' || key === 'obligation-date') && profile.obligationType === 'none') return false;
    if ((key === 'lender-helped' || key === 'lender-amount') && !profile.recentLenderName?.trim()) return false;
    if (key === 'lender-amount' && !profile.recentLenderHelpedRecently) return false;
    return true;
  });
}

export interface PostRunContextSignals {
  runCount: number;
  moneyKeptCents: number;
  exitedAfterPing: boolean;
  limitExceeded: boolean;
  financialPressure: boolean;
  paydaySoon: boolean;
}

export function nextPostRunContextQuestion(
  profile: RealityProfile,
  context: PostRunContextSignals,
): OnboardingQuestionKey | null {
  const completed = completedContextKeys(profile);

  if (!completed.has('money-goal') && context.moneyKeptCents > 0) {
    return 'money-goal';
  }

  if (!completed.has('quit-reason') && (context.exitedAfterPing || context.limitExceeded)) {
    return 'quit-reason';
  }

  if (!completed.has('difficult-times') && context.runCount >= 2) {
    return 'difficult-times';
  }

  if (!completed.has('quit-reason') && context.runCount >= 3) {
    return 'quit-reason';
  }

  if (!completed.has('payday-plan') && context.runCount >= 2 && context.paydaySoon) {
    return 'payday-plan';
  }

  if (!context.financialPressure || context.runCount < 3) return null;

  if (!completed.has('lender-name')) {
    return 'lender-name';
  }

  if (profile.recentLenderName?.trim() && !completed.has('lender-helped')) {
    return 'lender-helped';
  }

  if (
    profile.recentLenderName?.trim()
    && profile.recentLenderHelpedRecently
    && !completed.has('lender-amount')
  ) {
    return 'lender-amount';
  }

  return null;
}
