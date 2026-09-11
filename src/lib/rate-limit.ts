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

/* --------------------------------------------------------------- the policy */

/**
 * Every limit the app applies, in one table (plan §14.2.1). They live here
 * rather than next to each route so that `docs/runbook.md` has one thing to
 * describe and a change is one diff, not five.
 *
 * The numbers are abuse friction, not capacity planning: each is set high
 * enough that a person using the site normally — mistyping a password, resending
 * a confirmation, buying twice — never meets it, and low enough that a script
 * does.
 */
export const LIMITS = {
  /** Admin password login, per IP **and** per email (both are counted). */
  adminLogin: { max: 5, windowMs: 15 * 60 * 1000 },
  /** Newsletter signup, per email. */
  subscribeEmail: { max: 3, windowMs: 60 * 60 * 1000 },
  /** Newsletter signup, per IP — the shared-NAT-friendly ceiling. */
  subscribeIp: { max: 20, windowMs: 60 * 60 * 1000 },
  /**
   * How often a PENDING address may actually be e-mailed a confirmation.
   * Distinct from `subscribeEmail`: that one answers 429, this one answers the
   * normal success state and simply does not re-send (`docs/improvement-report.md`
   * §1.7 — "re-sends confirmation on every call, inbox bombing").
   */
  subscribeResend: { max: 1, windowMs: 60 * 60 * 1000 },
  /** Checkout session creation, per IP. */
  checkout: { max: 10, windowMs: 60 * 60 * 1000 },
  /** Public lead forms (every brand, every variant), per IP. */
  lead: { max: 10, windowMs: 60 * 60 * 1000 },
  /** Magic sign-in link requests, per email **and** per IP. */
  magicLink: { max: 5, windowMs: 15 * 60 * 1000 },
  /** The coarse middleware net over every `POST /api/*`, per IP. */
  apiPost: { max: 120, windowMs: 60 * 1000 },
} as const satisfies Record<string, { max: number; windowMs: number }>;

export type LimitName = keyof typeof LIMITS;

/**
 * Spend one call against a named limit. Thin sugar over `take`, but it keeps
 * the numbers out of the call sites and makes a miswired limit a type error
 * rather than a silently generous window.
 */
export function takeLimit(name: LimitName, key: string, now = Date.now()): RateLimitResult {
  const { max, windowMs } = LIMITS[name];
  return take(`${name}:${key}`, max, windowMs, now);
}

/**
 * The one message every limited surface shows. Deliberately plain and free of
 * numbers: telling a script the exact window is telling it how long to sleep.
 */
export const RATE_LIMIT_MESSAGE = 'Too many attempts. Please wait a little and try again.';

/**
 * Count against BOTH keys, always — never `a() || b()`.
 *
 * Short-circuiting was the actual shape of the magic-link bug: once the email
 * bucket was full the IP bucket stopped being incremented, so an attacker who
 * kept one address hot never accumulated an IP count at all
 * (`docs/improvement-report.md` §1.7).
 */
export function takeBoth(
  name: LimitName,
  keys: [string, string],
  now = Date.now(),
): RateLimitResult {
  const first = takeLimit(name, keys[0], now);
  const second = takeLimit(name, keys[1], now);
  // The stricter verdict wins, and the longer wait is the honest one to report.
  if (first.ok && second.ok) return first;
  const over = !first.ok ? first : second;
  const other = over === first ? second : first;
  return other.ok ? over : { ...over, retryAfterSeconds: Math.max(over.retryAfterSeconds, other.retryAfterSeconds) };
}

/**
 * Whether a confirmation mail may go out to this address now, spending the
 * allowance if so. Separate from the 429 limit above on purpose: the caller
 * still stores the subscriber and still answers "check your inbox", it just
 * does not put a second identical mail in a stranger's inbox.
 */
export function claimConfirmationSend(site: string, email: string, now = Date.now()): boolean {
  return takeLimit('subscribeResend', `${site}:${email.trim().toLowerCase()}`, now).ok;
}

/**
 * The newsletter's gate, shared by the server action and `/api/subscribe` —
 * two doors onto one list (plan §5.2.5), so they must count into one bucket.
 *
 * It lives here rather than beside the action because `src/app/actions/lead.ts`
 * carries `'use server'`, and such a module may export ONLY async functions
 * (see the comment in `src/app/actions/lead-state.ts` — S14 learned this at
 * request time, not at build time).
 *
 * Three decisions, in order:
 *  - the per-IP ceiling, generous enough for an office behind one NAT;
 *  - the per-email ceiling, which is what an inbox-bomber meets;
 *  - the resend claim, which is not a refusal: it is the difference between
 *    "stored you and mailed you" and "mailed you again".
 *
 * Both counters are always spent — never `a() || b()` — so neither can be
 * starved by keeping the other full.
 */
export type SubscribeGate = 'ok' | 'limited' | 'already-sent';

export const SUBSCRIBE_PENDING_MESSAGE =
  'Check your inbox — click the link in the confirmation email to finish.';

export function subscribeLimit(input: {
  ip: string;
  email: string;
  site: string;
  now?: number;
}): SubscribeGate {
  const now = input.now ?? Date.now();
  const email = input.email.trim().toLowerCase();
  const byIp = takeLimit('subscribeIp', input.ip, now);
  const byEmail = email ? takeLimit('subscribeEmail', email, now) : { ok: true };
  if (!byIp.ok || !byEmail.ok) return 'limited';
  // A missing or malformed address never claims the send allowance: zod
  // rejects it a moment later, and a real subscriber must not be locked out
  // for an hour by somebody else's typo.
  if (!email.includes('@')) return 'ok';
  return claimConfirmationSend(input.site, email, now) ? 'ok' : 'already-sent';
}
