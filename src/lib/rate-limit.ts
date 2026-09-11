/**
 * A fixed-window counter over a `Map`. Nothing else.
 *
 * Built in O17 for the free-access endpoint (plan §14.1.6) and reused by O18
 * for admin login, `/api/subscribe`, `/api/checkout`, the lead actions and the
 * middleware (plan §14.2.1).
 *
 * Why in-process is the right answer here and not a shortcut: the app runs as
 * ONE Node process on one Hostinger slot (plan §1.7, `nextjs-deploy-hostinger`),
 * so a Map IS the shared state. The two honest costs are that a deploy resets
 * every window, and that a second process would double every limit — both
 * acceptable for abuse friction, neither acceptable for anything that grants
 * access, which is why nothing in this file is used as an entitlement.
 *
 * Deliberately NOT `server-only`: it is pure, and the tests exercise it
 * directly with an injected clock.
 */

export interface RateLimitResult {
  /** False means the caller is over the limit and should answer 429. */
  ok: boolean;
  /** How many more calls are allowed in this window. */
  remaining: number;
  /** When the current window ends. */
  resetAt: number;
  /** Seconds until the window ends, for a `Retry-After` header. */
  retryAfterSeconds: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/**
 * Count one hit against `key` and say whether it is allowed.
 *
 * Fixed window rather than sliding: a sliding log stores a timestamp per hit,
 * which is exactly the memory an attacker gets to choose. A fixed window lets
 * through at most `2 * max` across a window boundary, which for "5 free guides
 * an hour" is not a difference worth paying for.
 */
export function take(key: string, max: number, windowMs: number, now = Date.now()): RateLimitResult {
  evictExpired(now);
  const existing = windows.get(key);
  const window: Window =
    existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + windowMs };

  window.count += 1;
  windows.set(key, window);

  const remaining = Math.max(0, max - window.count);
  return {
    ok: window.count <= max,
    remaining,
    resetAt: window.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
  };
}

/** Reads the counter without spending one — for a "was it already over" check. */
export function peek(key: string, max: number, now = Date.now()): boolean {
  const window = windows.get(key);
  if (!window || window.resetAt <= now) return true;
  return window.count < max;
}

/**
 * Forgets one key. Used after a SUCCESSFUL login so a person who mistyped
 * twice is not still counted against.
 *
 * There is deliberately no `clear()` of the whole map: `/api/auth/magic` had
 * one, and spraying 5000 addresses wiped every other limiter in the process
 * (`docs/improvement-report.md` §1.7). Eviction is per-key and lazy, below.
 */
export function reset(key: string): void {
  windows.delete(key);
}

/**
 * Lazy eviction, amortised over calls. Without it the map grows one entry per
 * distinct key for the life of the process, which is one IP header away from
 * being the memory-exhaustion bug the limiter was meant to prevent.
 *
 * Sweeping every `SWEEP_EVERY` calls keeps `take()` O(1) in the common case; a
 * full sweep is O(n) in live keys, which is bounded by the traffic inside one
 * window rather than by all traffic ever seen.
 */
const SWEEP_EVERY = 256;
let sinceSweep = 0;

function evictExpired(now: number): void {
  sinceSweep += 1;
  if (sinceSweep < SWEEP_EVERY) return;
  sinceSweep = 0;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/** Test seam: how many windows are being held right now. */
export function windowCount(): number {
  return windows.size;
}

/** Test seam ONLY — never call this from application code (see `reset`). */
export function __resetAllForTests(): void {
  windows.clear();
  sinceSweep = 0;
}

/* ------------------------------------------------------------------ the IP */

/**
 * The caller's address, as a limiter key.
 *
 * Behind Hostinger's proxy the socket address is the proxy, so the first hop of
 * `x-forwarded-for` is the client (plan §14.2.1). It is client-controlled and
 * therefore spoofable — which is fine for a limiter (the spoofer only splits
 * their own bucket) and never acceptable as an identity.
 */
export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first;
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
