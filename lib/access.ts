import type { SupabaseClient } from '@supabase/supabase-js';

export const PREMIUM_ENTITLEMENT = 'premium';

export type AccessState = {
  authenticated: boolean;
  active: boolean;
  paid: boolean;
  source: 'paid' | 'trial' | 'core' | 'signed-out';
  managementUrl: string | null;
  productIdentifier: string | null;
  trial: {
    eligible: boolean;
    active: boolean;
    runId: string | null;
    game: string | null;
    startedAt: string | null;
    endsAt: string | null;
    consumedAt: string | null;
  };
};

type RevenueCatCustomer = {
  subscriber?: {
    entitlements?: Record<string, {
      expires_date?: string | null;
      grace_period_expires_date?: string | null;
      product_identifier?: string | null;
    }>;
    management_url?: string | null;
  };
};

export async function revenueCatPremiumForUser(userId: string) {
  const apiKey = process.env.REVENUECAT_PUBLIC_API_KEY
    ?? process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY
    ?? '';

  if (!apiKey) {
    return { configured: false, active: false, managementUrl: null, productIdentifier: null };
  }

  try {
    const response = await fetch(
      'https://api.revenuecat.com/v1/subscribers/' + encodeURIComponent(userId),
      {
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + apiKey },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      console.error('RevenueCat customer lookup failed', response.status);
      return { configured: true, active: false, managementUrl: null, productIdentifier: null };
    }

    const payload = await response.json() as RevenueCatCustomer;
    const entitlement = payload.subscriber?.entitlements?.[PREMIUM_ENTITLEMENT];
    const now = Date.now();
    const expiry = entitlement?.expires_date ? Date.parse(entitlement.expires_date) : null;
    const grace = entitlement?.grace_period_expires_date ? Date.parse(entitlement.grace_period_expires_date) : null;
    const active = Boolean(
      entitlement
      && (
        entitlement.expires_date == null
        || (Number.isFinite(expiry) && (expiry as number) > now)
        || (Number.isFinite(grace) && (grace as number) > now)
      )
    );

    return {
      configured: true,
      active,
      managementUrl: payload.subscriber?.management_url ?? null,
      productIdentifier: entitlement?.product_identifier ?? null,
    };
  } catch (error) {
    console.error('RevenueCat customer lookup error', error);
    return { configured: true, active: false, managementUrl: null, productIdentifier: null };
  }
}

export async function resolveAccess(supabase: SupabaseClient, userId: string): Promise<AccessState> {
  const [trialResult, paid] = await Promise.all([
    supabase
      .from('user_access')
      .select('trial_run_id,trial_game,trial_started_at,trial_ends_at,trial_consumed_at')
      .eq('user_id', userId)
      .maybeSingle(),
    revenueCatPremiumForUser(userId),
  ]);

  const row = trialResult.data;
  const endsAtMs = row?.trial_ends_at ? Date.parse(row.trial_ends_at) : NaN;
  const trialActive = Boolean(
    row?.trial_run_id
    && !row.trial_consumed_at
    && Number.isFinite(endsAtMs)
    && endsAtMs > Date.now()
  );

  return {
    authenticated: true,
    active: paid.active || trialActive,
    paid: paid.active,
    source: paid.active ? 'paid' : trialActive ? 'trial' : 'core',
    managementUrl: paid.managementUrl,
    productIdentifier: paid.productIdentifier,
    trial: {
      eligible: !row?.trial_run_id,
      active: trialActive,
      runId: row?.trial_run_id ?? null,
      game: row?.trial_game ?? null,
      startedAt: row?.trial_started_at ?? null,
      endsAt: row?.trial_ends_at ?? null,
      consumedAt: row?.trial_consumed_at ?? null,
    },
  };
}

export function signedOutAccess(): AccessState {
  return {
    authenticated: false,
    active: false,
    paid: false,
    source: 'signed-out',
    managementUrl: null,
    productIdentifier: null,
    trial: { eligible: false, active: false, runId: null, game: null, startedAt: null, endsAt: null, consumedAt: null },
  };
}
