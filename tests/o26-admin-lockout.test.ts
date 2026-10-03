import { beforeEach, describe, expect, it } from 'vitest';
import { __resetAllForTests, adminLoginGate, adminLoginSucceeded, LIMITS } from '@/lib/rate-limit';

/**
 * O26 bug 4 (KNOWN-ISSUES "An admin can be locked out by someone spraying
 * their email"). Two properties, both must hold:
 *  1. a third party cannot lock the real admin out;
 *  2. brute force against one account stays bounded.
 */
const t0 = 1_800_000_000_000;
const ADMIN = 'anton@example.com';
const HOME = '198.51.100.7';

beforeEach(() => __resetAllForTests());

describe('a third party cannot lock the admin out', () => {
  it('one attacker IP hammering the admin email does not touch the admin at home', () => {
    for (let i = 0; i < 500; i += 1) adminLoginGate({ ip: '203.0.113.9', email: ADMIN, knownDevice: false, now: t0 });
    // The attacker is refused…
    expect(adminLoginGate({ ip: '203.0.113.9', email: ADMIN, knownDevice: false, now: t0 }).ok).toBe(false);
    // …the admin, from a browser that has signed in before, is not.
    expect(adminLoginGate({ ip: HOME, email: ADMIN, knownDevice: true, now: t0 }).ok).toBe(true);
  });

  it('a botnet filling the per-email backstop still leaves a known device able to sign in', () => {
    for (let n = 0; n < 1000; n += 1) {
      adminLoginGate({ ip: `10.0.${n >> 8}.${n & 255}`, email: ADMIN, knownDevice: false, now: t0 });
    }
    expect(adminLoginGate({ ip: HOME, email: ADMIN, knownDevice: true, now: t0 }).ok).toBe(true);
    // Mistyping a few times from home is still allowed (the pair limit is the admin's own).
    for (let i = 0; i < LIMITS.adminLoginPair.max - 2; i += 1) {
      expect(adminLoginGate({ ip: HOME, email: ADMIN, knownDevice: true, now: t0 }).ok).toBe(true);
    }
  });

  it('the attacker spelling the address differently does not escape the backstop', () => {
    for (let n = 0; n < LIMITS.adminLoginEmail.max; n += 1) {
      adminLoginGate({ ip: `10.1.0.${n}`, email: n % 2 ? ADMIN.toUpperCase() : ` ${ADMIN} `, knownDevice: false, now: t0 });
    }
    expect(adminLoginGate({ ip: '10.1.1.1', email: ADMIN, knownDevice: false, now: t0 }).ok).toBe(false);
  });
});

describe('brute force stays bounded', () => {
  it('one IP gets 5 guesses per account per 15 minutes', () => {
    for (let i = 0; i < 5; i += 1) expect(adminLoginGate({ ip: '203.0.113.9', email: ADMIN, knownDevice: false, now: t0 }).ok).toBe(true);
    const refused = adminLoginGate({ ip: '203.0.113.9', email: ADMIN, knownDevice: false, now: t0 });
    expect(refused.ok).toBe(false);
    expect(refused.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('one IP cannot spray many accounts past the per-IP cap', () => {
    let allowed = 0;
    for (let i = 0; i < 100; i += 1) {
      if (adminLoginGate({ ip: '203.0.113.9', email: `user${i}@example.com`, knownDevice: false, now: t0 }).ok) allowed += 1;
    }
    expect(allowed).toBe(LIMITS.adminLoginIp.max);
  });

  it('a botnet of unknown devices gets at most the backstop per hour at one account', () => {
    let allowed = 0;
    for (let n = 0; n < 1000; n += 1) {
      if (adminLoginGate({ ip: `10.2.${n >> 8}.${n & 255}`, email: ADMIN, knownDevice: false, now: t0 }).ok) allowed += 1;
    }
    expect(allowed).toBe(LIMITS.adminLoginEmail.max);
    expect(LIMITS.adminLoginEmail.windowMs).toBe(60 * 60 * 1000);
  });

  it('a successful login forgets the pair and the IP, but not what strangers did', () => {
    for (let n = 0; n < LIMITS.adminLoginEmail.max; n += 1) {
      adminLoginGate({ ip: `10.3.0.${n}`, email: ADMIN, knownDevice: false, now: t0 });
    }
    for (let i = 0; i < 4; i += 1) adminLoginGate({ ip: HOME, email: ADMIN, knownDevice: true, now: t0 });
    adminLoginSucceeded({ ip: HOME, email: ADMIN });
    for (let i = 0; i < 5; i += 1) expect(adminLoginGate({ ip: HOME, email: ADMIN, knownDevice: true, now: t0 }).ok).toBe(true);
    // An unknown device is still behind the backstop.
    expect(adminLoginGate({ ip: '10.3.9.9', email: ADMIN, knownDevice: false, now: t0 }).ok).toBe(false);
  });
});
