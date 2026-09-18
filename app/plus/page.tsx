import { PlusDashboard } from '@/components/PlusDashboard';
import { resolveAccess } from '@/lib/access';
import { createServerSupabase } from '@/lib/supabase/server';
import type { RunRecord } from '@/lib/types';

export const metadata = { title: 'Spin Out+ | Spin Out' };
export const dynamic = 'force-dynamic';

export default async function PlusPage() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return <PlusDashboard authenticated={false} premium={false} accessSource="signed-out" trialEligible={false} trialEndsAt={null} serverRuns={[]} manageUrl={null} />;
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return <PlusDashboard authenticated={false} premium={false} accessSource="signed-out" trialEligible={false} trialEndsAt={null} serverRuns={[]} manageUrl={null} />;
  }

  const access = await resolveAccess(supabase, auth.user.id);
  const runsResult = access.active
    ? await supabase.from('run_history').select('data').eq('user_id', auth.user.id).order('ended_at', { ascending: true }).limit(200)
    : { data: [] };

  const serverRuns = (runsResult.data ?? [])
    .map(row => row.data as RunRecord)
    .filter(run => run && typeof run.id === 'string');

  return <PlusDashboard
    authenticated
    premium={access.active}
    accessSource={access.source}
    trialEligible={access.trial.eligible}
    trialEndsAt={access.trial.endsAt}
    serverRuns={serverRuns}
    manageUrl={access.managementUrl}
  />;
}
