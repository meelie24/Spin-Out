export type EntitlementLike = {
  status?: unknown;
  provider?: unknown;
  provider_payload?: unknown;
};

const LEMON_VALID_STATUSES = new Set([
  'on_trial',
  'active',
  'paused',
  'past_due',
  'unpaid',
  'cancelled',
  'free',
]);

export function entitlementIsActive(entitlement: EntitlementLike | null | undefined) {
  if (!entitlement) return false;

  const status = String(entitlement.status ?? '').toLowerCase();
  const provider = String(entitlement.provider ?? '').toLowerCase();

  if (provider === 'lemonsqueezy') {
    return LEMON_VALID_STATUSES.has(status);
  }

  return status === 'active' || status === 'approved';
}

export function entitlementManageUrl(entitlement: EntitlementLike | null | undefined) {
  if (!entitlement) return null;

  const provider = String(entitlement.provider ?? '').toLowerCase();
  if (provider === 'paypal') {
    return 'https://www.paypal.com/myaccount/autopay/';
  }

  if (provider !== 'lemonsqueezy') return null;

  const payload = entitlement.provider_payload;
  if (!payload || typeof payload !== 'object') return null;

  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return null;

  const attributes = (data as { attributes?: unknown }).attributes;
  if (!attributes || typeof attributes !== 'object') return null;

  const urls = (attributes as { urls?: unknown }).urls;
  if (!urls || typeof urls !== 'object') return null;

  const portal = (urls as { customer_portal?: unknown }).customer_portal;
  return typeof portal === 'string' && portal.startsWith('https://') ? portal : null;
}
