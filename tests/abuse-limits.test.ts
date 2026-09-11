import { beforeEach, describe, expect, it } from 'vitest';
import {
  __resetAllForTests,
  claimConfirmationSend,
  LIMITS,
  peek,
  resetLimit,
  subscribeLimit,
  takeBoth,
  takeLimit,
} from '@/lib/rate-limit';

/**
 * O18 §14.2.1 — the limit POLICY, as opposed to the counter underneath it
 * (O17's `take`, covered in `tests/rate-limit.test.ts`).
 *
 * Every case injects its own clock, so nothing here waits on a real window.
 */

const t0 = 1_800_000_000_000;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

beforeEach(() => __resetAllForTests());

describe('takeLimit — the numbers plan §14.2.1 names', () => {
  it('admin login is 5 per 15 minutes', () => {
    expect(LIMITS.adminLogin).toEqual({ max: 5, windowMs: 15 * MINUTE });
    for (let i = 1; i <= 5; i += 1) expect(takeLimit('adminLogin', 'ip:1.1.1.1', t0).ok).toBe(true);
    expect(takeLimit('adminLogin', 'ip:1.1.1.1', t0).ok).toBe(false);
    // …and the sixth attempt a quarter of an hour later is fine again.
    expect(takeLimit('adminLogin', 'ip:1.1.1.1', t0 + 15 * MINUTE + 1).ok).toBe(true);
  });

  it('names every limit the plan asked for, at the value it asked for', () => {
    expect(LIMITS.subscribeEmail).toEqual({ max: 3, windowMs: HOUR });
    expect(LIMITS.subscribeIp).toEqual({ max: 20, windowMs: HOUR });
    expect(LIMITS.checkout).toEqual({ max: 10, windowMs: HOUR });
    expect(LIMITS.lead).toEqual({ max: 10, windowMs: HOUR });
    expect(LIMITS.magicLink).toEqual({ max: 5, windowMs: 15 * MINUTE });
    expect(LIMITS.apiPost).toEqual({ max: 120, windowMs: MINUTE });
  });

  it('namespaces its keys, so two limits cannot share a bucket', () => {
    for (let i = 0; i < 10; i += 1) takeLimit('checkout', '9.9.9.9', t0);
    expect(takeLimit('checkout', '9.9.9.9', t0).ok).toBe(false);
    // Same key string, different limit: untouched.
    expect(takeLimit('lead', '9.9.9.9', t0).ok).toBe(true);
  });
});

describe('takeBoth — the short-circuit that made the magic-link limiter leak', () => {
  it('spends the second key even when the first is already over', () => {
    // Fill the email bucket on its own.
    for (let i = 0; i < 5; i += 1) takeLimit('magicLink', 'e:spray@example.com', t0);
    expect(peek('magicLink:i:203.0.113.5', LIMITS.magicLink.max, t0)).toBe(true);

    takeBoth('magicLink', ['e:spray@example.com', 'i:203.0.113.5'], t0);
    takeBoth('magicLink', ['e:spray@example.com', 'i:203.0.113.5'], t0);

    // The IP has been counted twice despite the email bucket being full. The
    // old `rateLimited(email) || rateLimited(ip)` never got this far, which is
    // how one hot address bought unlimited attempts from one IP.
    expect(peek('magicLink:i:203.0.113.5', 2, t0)).toBe(false);
  });

  it('refuses when EITHER key is over, and reports the longer wait', () => {
    for (let i = 0; i < 5; i += 1) takeLimit('adminLogin', 'ip:hot', t0);
    const verdict = takeBoth('adminLogin', ['ip:hot', 'email:cold@example.com'], t0);
    expect(verdict.ok).toBe(false);
    expect(verdict.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('allows while both keys are under', () => {
    expect(takeBoth('adminLogin', ['ip:a', 'email:b@example.com'], t0).ok).toBe(true);
  });
});

describe('subscribeLimit — one gate for the action and the API route', () => {
  const call = (over: Partial<{ ip: string; email: string; site: string; now: number }> = {}) =>
    subscribeLimit({
      ip: '198.51.100.1',
      email: 'reader@example.com',
      site: 'guide',
      now: t0,
      ...over,
    });

  it('mails a pending address once an hour, then stops re-mailing it', () => {
    expect(call()).toBe('ok');
    // Second and third calls are inside the per-email allowance of 3, so they
    // are NOT refused — they simply do not put a second identical confirmation
    // in the inbox (`docs/improvement-report.md` §1.7).
    expect(call()).toBe('already-sent');
    expect(call()).toBe('already-sent');
  });

  it('refuses the fourth call for one address inside the hour', () => {
    call();
    call();
    call();
    expect(call()).toBe('limited');
  });

  it('lets the same address through again once the hour has passed', () => {
    call();
    expect(call({ now: t0 + HOUR + 1 })).toBe('ok');
  });

  it('refuses the 21st address from one IP inside the hour', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(call({ email: `reader${i}@example.com` })).toBe('ok');
    }
    expect(call({ email: 'reader20@example.com' })).toBe('limited');
  });

  it('never lets a typo burn the real subscriber\'s send allowance', () => {
    expect(call({ email: 'not-an-address' })).toBe('ok');
    expect(call({ email: '' })).toBe('ok');
    // The real address is still owed its first mail.
    expect(call()).toBe('ok');
  });

  it('counts each brand separately — the same reader may join two lists', () => {
    expect(claimConfirmationSend('guide', 'reader@example.com', t0)).toBe(true);
    expect(claimConfirmationSend('guide', 'READER@example.com', t0)).toBe(false);
    expect(claimConfirmationSend('residency', 'reader@example.com', t0)).toBe(true);
  });
});

describe('resetLimit — what a successful login forgets', () => {
  it('clears the named limit without touching its neighbours', () => {
    for (let i = 0; i < 5; i += 1) takeLimit('adminLogin', 'ip:2.2.2.2', t0);
    for (let i = 0; i < 5; i += 1) takeLimit('adminLogin', 'email:someone@example.com', t0);
    expect(takeLimit('adminLogin', 'ip:2.2.2.2', t0).ok).toBe(false);

    resetLimit('adminLogin', 'ip:2.2.2.2');

    // The person who finally typed their password correctly starts fresh…
    expect(takeLimit('adminLogin', 'ip:2.2.2.2', t0).ok).toBe(true);
    // …and nothing else was forgotten.
    expect(takeLimit('adminLogin', 'email:someone@example.com', t0).ok).toBe(false);
  });

  it('applies the same key namespace takeLimit does', () => {
    // The bug this guards: a call site that rebuilt the prefix by hand would
    // silently stop resetting anything the day `takeLimit` renamed its keys.
    takeLimit('lead', '4.4.4.4', t0);
    resetLimit('lead', '4.4.4.4');
    expect(peek('lead:4.4.4.4', 1, t0)).toBe(true);
  });
});
