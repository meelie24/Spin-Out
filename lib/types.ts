export type GamblingType = 'slots' | 'sports' | 'casino' | 'poker' | 'lottery' | 'other';
export type TriggerType = 'win-money' | 'win-it-back' | 'bored' | 'rush' | 'switch-off' | 'habit' | 'other';
export type ObligationType = 'rent' | 'car' | 'groceries' | 'credit-card' | 'utilities' | 'childcare' | 'loan' | 'insurance' | 'phone' | 'other' | 'none';
export type OutcomeBand = 'loss' | 'partial-loss' | 'push' | 'win' | 'big-win';
export type ExitReason = 'voluntary' | 'timeout' | 'balance';

export interface RealityProfile {
  version: 1;
  intendedWagerCents: number;
  gamblingType: GamblingType;
  triggerType: TriggerType;
  triggerCustom?: string | null;
  availableUntilIncomeCents: number | null;
  nextIncomeDate: string | null;
  obligationType: ObligationType;
  obligationAmountCents: number | null;
  obligationDueDate: string | null;
  recentLenderName: string | null;
  recentLenderHelpedRecently: boolean;
  recentLenderAmountCents: number | null;
  personalMoneyGoal: string | null;
  additionalMoneyGoal?: string | null;
  startingUrge: number;
  financialContextUpdatedAt: string;
  createdAt: string;
}

export interface PingCandidate {
  id: string;
  type: string;
  level: 1 | 2 | 3 | 4 | 5;
  message: string;
  factual: boolean;
}

export interface PingLearningStat { shown: number; exitsAfter: number; stakeDownAfter?: number; stakeUpAfter?: number; continuedAfter?: number; recoveryExitAfter?: number }
export type PingLearning = Record<string, PingLearningStat>;

export interface RunSnapshot {
  lastPingAt?: number | null;
  initialBalanceCents: number;
  balanceCents: number;
  previousBalanceCents: number;
  stakeCents: number;
  previousStakeCents: number;
  actionCount: number;
  lastNetCents: number;
  lastPingAction: number;
}

export interface PingRecord {
  id: string;
  type: string;
  level: number;
  message: string;
  shownAt: number;
  dismissedAt: number | null;
}

export interface RunEvent {
  kind: 'action' | 'stake' | 'ping-shown' | 'ping-dismissed';
  at: number;
  balanceCents?: number;
  stakeCents?: number;
  netCents?: number;
  pingType?: string;
}

export interface RunContextSnapshot {
  availableUntilIncomeCents: number | null;
  nextIncomeDate: string | null;
  obligationType: ObligationType;
  obligationAmountCents: number | null;
  obligationDueDate: string | null;
  recentLenderName: string | null;
  recentLenderHelpedRecently: boolean;
  recentLenderAmountCents: number | null;
  personalMoneyGoal: string | null;
}

export type RealWorldOutcome = 'did-not-gamble' | 'gambled-less' | 'gambled-planned' | 'gambled-more';

export interface RunRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  exitReason: ExitReason;
  timeToExitSeconds: number | null;
  intendedWagerCents: number;
  actualWagerCents: number;
  moneyKeptCents: number;
  startingUrge: number;
  endingUrge: number;
  gamblingType: GamblingType;
  triggerType: TriggerType;
  realWorldOutcome: RealWorldOutcome;
  context: RunContextSnapshot;
  pings: PingRecord[];
  timeline: RunEvent[];
  actions: number;
}

export interface ActiveRun {
  id: string;
  startedAt: number;
  initialBalanceCents: number;
  balanceCents: number;
  previousBalanceCents: number;
  stakeCents: number;
  previousStakeCents: number;
  actionCount: number;
  largestLossCents: number;
  simulatedLossesCents: number;
  simulatedRecoveriesCents: number;
  lastNetCents: number;
  lastPingAction: number;
  pings: PingRecord[];
  timeline: RunEvent[];
}

export interface RealityMath {
  simulatedLossCents: number;
  availableAfterLossCents: number | null;
  obligationShortfallCents: number | null;
}
