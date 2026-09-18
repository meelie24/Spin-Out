export type GamblingType = 'slots' | 'sports' | 'casino' | 'poker' | 'lottery' | 'other';
export type TriggerType = 'win-money' | 'win-it-back' | 'bored' | 'rush' | 'switch-off' | 'habit' | 'other';
export type ObligationType = 'rent' | 'car' | 'groceries' | 'credit-card' | 'utilities' | 'childcare' | 'loan' | 'insurance' | 'phone' | 'other' | 'none';
export type OutcomeBand = 'loss' | 'partial-loss' | 'push' | 'win' | 'big-win';
export type ExitReason = 'voluntary' | 'timeout' | 'balance';

export interface SessionLimit {
  rounds: number | null;
  minutes: number | null;
}

export interface RealityProfile {
  version: 1;
  intendedWagerCents: number;
  gamblingType: GamblingType;
  triggerType: TriggerType;
  triggerCustom?: string | null;
  quitReason?: string | null;
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
  detail?: string;
  explanation?: string;
  requiresChoice?: boolean;
  factual: boolean;
}

export interface PingLearningStat {
  shown: number;
  exitsAfter: number;
  stakeDownAfter?: number;
  stakeUpAfter?: number;
  continuedAfter?: number;
  recoveryExitAfter?: number;
}
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
  startedAt?: number;
  lastActionAt?: number | null;
  actionIntervalsMs?: number[];
  consecutiveLosses?: number;
  consecutiveWins?: number;
  lossesBeforeLastWin?: number;
  lastOutcomeBand?: OutcomeBand | null;
  nearMiss?: boolean;
  pingDismissalStreak?: number;
  chosenLimitRounds?: number | null;
  chosenLimitMinutes?: number | null;
  limitExceededAt?: number | null;
  returnedAfterMs?: number | null;
  totalStakedCents?: number;
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
  decision?: string;
  intervalMs?: number | null;
  outcomeBand?: OutcomeBand;
  nearMiss?: boolean;
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
  quitReason?: string | null;
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
  sessionDurationSeconds?: number;
  totalStakedCents?: number;
  averageActionIntervalMs?: number | null;
  chosenLimitRounds?: number | null;
  chosenLimitMinutes?: number | null;
  limitExceededByRounds?: number;
  limitExceededSeconds?: number;
  exitedAfterPing?: boolean;
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
  lastActionAt?: number | null;
  actionIntervalsMs?: number[];
  consecutiveLosses?: number;
  consecutiveWins?: number;
  lossesBeforeLastWin?: number;
  lastOutcomeBand?: OutcomeBand | null;
  lastNearMiss?: boolean;
  pingDismissalStreak?: number;
  chosenLimitRounds?: number | null;
  chosenLimitMinutes?: number | null;
  limitExceededAt?: number | null;
  returnedAfterMs?: number | null;
  totalStakedCents?: number;
  gameState?: {
    poker?: {
      hand: string[];
      deck: string[];
      held: boolean[];
      phase: 'hold';
      wagerCents: number;
      balanceBeforeCents: number;
    };
  };
}

export interface RealityMath {
  simulatedLossCents: number;
  availableAfterLossCents: number | null;
  obligationShortfallCents: number | null;
}
