'use client';

import type { PingLearning, RealityProfile, RunRecord } from './types';

const KEY = 'spinout.v2';

export type BillingState = 'free' | 'premium' | 'payment-failed' | 'canceled';
export interface LocalAccount { signedIn: boolean; email: string | null; billing: BillingState; paypalSubscriptionId: string | null; paypalPlan: 'monthly' | 'yearly' | null }
export interface LocalEvent { name: string; at: number; data?: Record<string, string | number | boolean | null> }

export interface StoredData {
  version: 2;
  profile: RealityProfile | null;
  runs: RunRecord[];
  pingLearning: PingLearning;
  account: LocalAccount;
  events: LocalEvent[];
}

const EMPTY: StoredData = {
  version: 2,
  profile: null,
  runs: [],
  pingLearning: {},
  account: { signedIn: false, email: null, billing: 'free', paypalSubscriptionId: null, paypalPlan: null },
  events: [],
};

function isBrowser() { return typeof window !== 'undefined'; }

export function loadData(): StoredData {
  if (!isBrowser()) return structuredClone(EMPTY);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const parsed = JSON.parse(raw) as Partial<StoredData>;
    if (parsed.version !== 2) return structuredClone(EMPTY);
    return {
      ...structuredClone(EMPTY),
      ...parsed,
      runs: Array.isArray(parsed.runs) ? parsed.runs.slice(-80) : [],
      events: Array.isArray(parsed.events) ? parsed.events.slice(-400) : [],
      pingLearning: parsed.pingLearning && typeof parsed.pingLearning === 'object' ? parsed.pingLearning : {},
      account: { ...EMPTY.account, ...(parsed.account ?? {}) },
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function saveData(data: StoredData) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...data, runs: data.runs.slice(-80), events: data.events.slice(-400) }));
    return true;
  } catch {
    return false;
  }
}

export function updateData(mutator: (data: StoredData) => StoredData) {
  const next = mutator(loadData());
  saveData(next);
  return next;
}

export function track(name: string, data?: LocalEvent['data']) {
  return updateData(current => ({ ...current, events: [...current.events, { name, at: Date.now(), data }].slice(-400) }));
}

export function totalMoneyKept(runs: RunRecord[]) {
  return runs.reduce((sum, run) => sum + Math.max(0, run.moneyKeptCents), 0);
}

export function currentMonthMoneyKept(runs: RunRecord[], now = new Date()) {
  const y = now.getFullYear(); const m = now.getMonth();
  return runs.filter(run => { const d = new Date(run.endedAt); return d.getFullYear() === y && d.getMonth() === m; })
    .reduce((sum, run) => sum + Math.max(0, run.moneyKeptCents), 0);
}

const ACTIVE_KEY = 'spinout.active.v2';
export function loadActiveRun<T>() {
  if (!isBrowser()) return null as T | null;
  try { const raw = window.localStorage.getItem(ACTIVE_KEY); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
export function saveActiveRun<T>(run: T) {
  if (!isBrowser()) return false;
  try { window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(run)); return true; } catch { return false; }
}
export function clearActiveRun() {
  if (!isBrowser()) return;
  try { window.localStorage.removeItem(ACTIVE_KEY); } catch {}
}
