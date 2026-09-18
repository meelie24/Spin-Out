import { PlusDashboard } from '@/components/PlusDashboard';
import { createServerSupabase } from '@/lib/supabase/server';
import type { RunRecord } from '@/lib/types';

export const metadata = { title: 'Spin Out+ | Spin Out' };
export const dynamic = 'force-dynamic';

export default async function PlusPage() {
  const supabase = await createServerSupabase();
  if (!supabase) return <PlusDashboard authenticated={false} premium={false} serverRuns={[]} />;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <PlusDashboard authenticated={false} premium={false} serverRuns={[]} />;

  const [entitlementResult, runsResult] = await Promise.all([
    supabase.from('entitlements').select('status').eq('user_id', auth.user.id).maybeSingle(),
    supabase.from('run_history').select('data').eq('user_id', auth.user.id).order('ended_at', { ascending: true }).limit(200),
  ]);

  const premium = Boolean(
    entitlementResult.data
    && ['active','approved'].includes(String(entitlementResult.data.status).toLowerCase())
  );
  const serverRuns = (runsResult.data ?? [])
    .map(row => row.data as RunRecord)
    .filter(run => run && typeof run.id === 'string');

  return <PlusDashboard authenticated premium={premium} serverRuns={serverRuns} />;
}
