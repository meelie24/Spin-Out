'use client';

const LEASE_KEY = 'spinout.run.lease.v1';
const TAB_KEY = 'spinout.tab.id.v1';
const TTL_MS = 15_000;

export interface RunLease {
  runId: string;
  tabId: string;
  expiresAt: number;
}

function tabId() {
  try {
    const existing = sessionStorage.getItem(TAB_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(TAB_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function readLease(): RunLease | null {
  try {
    const raw = localStorage.getItem(LEASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RunLease>;
    if (typeof parsed.runId !== 'string' || typeof parsed.tabId !== 'string' || typeof parsed.expiresAt !== 'number') return null;
    return parsed as RunLease;
  } catch {
    return null;
  }
}

export function createRunLease(runId: string) {
  const id = tabId();

  const claim = (force = false) => {
    const now = Date.now();
    const existing = readLease();
    if (!force && existing && existing.expiresAt > now && existing.tabId !== id && existing.runId === runId) return false;
    try {
      localStorage.setItem(LEASE_KEY, JSON.stringify({ runId, tabId: id, expiresAt: now + TTL_MS }));
      const confirmed = readLease();
      return confirmed?.tabId === id && confirmed.runId === runId;
    } catch {
      return true;
    }
  };

  const renew = () => {
    const existing = readLease();
    if (!existing || existing.tabId !== id || existing.runId !== runId) return false;
    try {
      localStorage.setItem(LEASE_KEY, JSON.stringify({ ...existing, expiresAt: Date.now() + TTL_MS }));
      return true;
    } catch {
      return true;
    }
  };

  const release = () => {
    const existing = readLease();
    if (existing?.tabId !== id || existing.runId !== runId) return;
    try { localStorage.removeItem(LEASE_KEY); } catch {}
  };

  const heldByThisTab = () => {
    const existing = readLease();
    if (!existing || existing.expiresAt <= Date.now()) return false;
    return existing.tabId === id && existing.runId === runId;
  };

  return { claim, renew, release, heldByThisTab };
}
