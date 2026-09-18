export class PresenceRegistry {
  private readonly sessions = new Map<string, number>();

  constructor(private readonly ttlMs = 75_000) {}

  touch(id: string, now = Date.now()) {
    if (!id || id.length > 128) return false;
    this.sweep(now);
    this.sessions.set(id, now);
    return true;
  }

  count(now = Date.now()) {
    this.sweep(now);
    return this.sessions.size;
  }

  private sweep(now: number) {
    for (const [id, seenAt] of this.sessions) {
      if (now - seenAt > this.ttlMs) this.sessions.delete(id);
    }
  }
}

export function companionCount(totalPresence: number) {
  if (!Number.isFinite(totalPresence)) return 0;
  return Math.max(0, Math.round(totalPresence) - 1);
}
