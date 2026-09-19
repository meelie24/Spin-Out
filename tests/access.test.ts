import test from 'node:test';
import assert from 'node:assert/strict';
import { revenueCatServerApiKey } from '../lib/access';

test('RevenueCat server lookup prefers the server-only secret key', () => {
  const key = revenueCatServerApiKey({
    REVENUECAT_SECRET_API_KEY: 'sk_server_secret',
    REVENUECAT_PUBLIC_API_KEY: 'legacy_public',
    NEXT_PUBLIC_REVENUECAT_WEB_API_KEY: 'web_public',
  });
  assert.equal(key, 'sk_server_secret');
});

test('RevenueCat server lookup keeps public-key fallback for existing environments', () => {
  assert.equal(revenueCatServerApiKey({
    REVENUECAT_PUBLIC_API_KEY: 'legacy_public',
    NEXT_PUBLIC_REVENUECAT_WEB_API_KEY: 'web_public',
  }), 'legacy_public');

  assert.equal(revenueCatServerApiKey({
    NEXT_PUBLIC_REVENUECAT_WEB_API_KEY: 'web_public',
  }), 'web_public');
});
