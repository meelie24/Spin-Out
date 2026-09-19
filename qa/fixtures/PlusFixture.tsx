import { PlusDashboard } from '@/components/PlusDashboard';
import type { RunRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Copied into an ephemeral CI checkout by qa/install-visual-fixture.mjs only.
// These records are synthetic rendering fixtures, never an entitlement decision.
export default async function PlusFixture({ searchParams }: {
  searchParams: Promise<{ state?: string; clock?: string }>;
}) {
  const { state, clock } = await searchParams;
  const now = Number(clock) || 1_790_000_000_000;
  const runs: RunRecord[] = state === 'empty' ? [] : Array.from({ length: 10 }, (_, index) => ({
    id: `qa-history-${index}`,
    startedAt: now - (10 - index) * 86_400_000 - (240 - index * 12) * 1000,
    endedAt: now - (10 - index) * 86_400_000,
    exitReason: 'voluntary',
    timeToExitSeconds: 240 - index * 12,
    intendedWagerCents: 10_000,
    actualWagerCents: index % 3 === 0 ? 2_000 : 0,
    moneyKeptCents: index % 3 === 0 ? 8_000 : 10_000,
    startingUrge: 8,
    endingUrge: 6,
    gamblingType: 'slots',
    triggerType: index % 2 === 0 ? 'win-it-back' : 'switch-off',
    realWorldOutcome: index % 3 === 0 ? 'gambled-less' : 'did-not-gamble',
    context: {
      availableUntilIncomeCents: null, nextIncomeDate: null,
      obligationType: 'car', obligationAmountCents: 43_000,
      obligationDueDate: null, recentLenderName: null,
      recentLenderHelpedRecently: false, recentLenderAmountCents: null,
      personalMoneyGoal: 'Savings',
    },
    pings: [], timeline: [], actions: 8 + index,
  }));
  return <PlusDashboard authenticated premium accessSource={state === 'trial' ? 'trial' : 'paid'}
    trialEligible={false} trialEndsAt={state === 'trial' ? new Date(now + 900_000).toISOString() : null}
    serverRuns={runs} manageUrl={null} />;
}
