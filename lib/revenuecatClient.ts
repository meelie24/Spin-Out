'use client';

import { Purchases } from '@revenuecat/purchases-js';

let configuredUser: string | null = null;

export async function revenueCatForUser(userId: string) {
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY ?? '';
  if (!apiKey || !userId) return null;

  if (!Purchases.isConfigured()) {
    const purchases = Purchases.configure({ apiKey, appUserId: userId });
    configuredUser = userId;
    return purchases;
  }

  const purchases = Purchases.getSharedInstance();
  if (configuredUser !== userId) {
    await purchases.changeUser(userId);
    configuredUser = userId;
  }
  return purchases;
}
