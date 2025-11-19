// Minimal in-process Redis-compatible shim used when no external Redis is available.
// Supports get, set (with PX), incr, expire, and simple event `on` for 'error'.

type ExpiryEntry = { expiresAt: number };

class MiniRedis {
  private store: Map<string, string> = new Map();
  private expirations: Map<string, number> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // periodic cleanup
    this.cleanupTimer = setInterval(() => this.cleanup(), 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [k, t] of this.expirations.entries()) {
      if (t <= now) {
        this.store.delete(k);
        this.expirations.delete(k);
      }
    }
  }

  async get(key: string) {
    const exp = this.expirations.get(key);
    if (exp && exp <= Date.now()) {
      this.store.delete(key);
      this.expirations.delete(key);
      return null;
    }
    const v = this.store.get(key);
    return v ?? null;
  }

  async set(key: string, value: string, mode?: string, px?: number) {
    this.store.set(key, value);
    if (mode && mode.toUpperCase() === 'PX' && typeof px === 'number') {
      this.expirations.set(key, Date.now() + px);
    }
    return 'OK';
  }

  async incr(key: string) {
    const cur = await this.get(key);
    const n = Number(cur ?? '0');
    const next = (isNaN(n) ? 1 : n + 1);
    this.store.set(key, String(next));
    return next;
  }

  async expire(key: string, seconds: number) {
    if (!this.store.has(key)) return 0;
    this.expirations.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  on(_ev: string, _fn: (...args: any[]) => void) {
    // noop — keep interface compatible
  }

  quit() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }
}

module.exports = MiniRedis;
