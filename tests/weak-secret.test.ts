import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  WeakSecretError,
  hasStrongSecret,
  pack,
  secretHealth,
  sign,
  signingSecret,
  unpack,
} from '@/lib/signing';
import { issueMagicToken, memberSessionSecret } from '@/lib/member-auth';

/**
 * O17 P0 #3 (plan §14.1.3): production refuses a weak secret.
 *
 * Before O17, `SESSION_SECRET` unset in production fell back to a literal
 * published in this repo, and `currentAdmin()` would unseal a cookie sealed
 * with it — a forgeable admin session (`docs/improvement-report.md` §1.2).
 */
const STRONG = 'a'.repeat(32);

afterEach(() => {
  vi.unstubAllEnvs();
});

const production = (secret?: string) => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('SESSION_SECRET', secret ?? '');
};

describe('signingSecret in production', () => {
  it('throws when SESSION_SECRET is missing', () => {
    production();
    expect(() => signingSecret()).toThrow(WeakSecretError);
  });

  it('throws when SESSION_SECRET is under 32 characters', () => {
    production('too-short');
    expect(() => signingSecret()).toThrow(/32 characters/);
  });

  it('returns the real secret when it is strong', () => {
    production(STRONG);
    expect(signingSecret()).toBe(STRONG);
  });

  it('never returns the published development fallback in production', () => {
    production('short');
    expect(() => signingSecret()).toThrow();
    production();
    expect(() => sign('anything', 'download')).toThrow(WeakSecretError);
  });
});

describe('signingSecret outside production', () => {
  it('falls back so a clean checkout builds and tests (plan §4.5)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SESSION_SECRET', '');
    expect(signingSecret()).toContain('dev-insecure');
    expect(() => pack('x', 'unsubscribe')).not.toThrow();
  });
});

describe('the session and magic-link consumers refuse too', () => {
  it('memberSessionSecret throws rather than deriving from the fallback', () => {
    production();
    expect(() => memberSessionSecret()).toThrow(WeakSecretError);
  });

  it('memberSessionSecret is happy with its own strong secret', () => {
    production();
    vi.stubEnv('MEMBER_SESSION_SECRET', 'm'.repeat(40));
    expect(memberSessionSecret()).toBe('m'.repeat(40));
  });

  it('issueMagicToken throws rather than minting a forgeable sign-in link', () => {
    production();
    expect(() => issueMagicToken('buyer@example.com', 'guide')).toThrow(WeakSecretError);
  });

  it('unsubscribe tokens refuse as well — they are a credential', () => {
    production();
    expect(() => pack('buyer@example.com', 'unsubscribe')).toThrow(WeakSecretError);
    expect(() => unpack('abc.def', 'unsubscribe')).toThrow(WeakSecretError);
  });
});

describe('the public forms degrade instead of taking the site down', () => {
  it('the anti-bot render timestamp still signs with a weak secret', () => {
    production();
    // `form-timestamp` is friction, not a boundary: throwing here would 500
    // every marketing page carrying a <LeadForm>, and break `next build`.
    const token = pack(String(Date.now()), 'form-timestamp');
    expect(unpack(token, 'form-timestamp')).not.toBeNull();
  });

  it('and that exception does not leak to any other purpose', () => {
    production();
    expect(() => pack('x', 'form-timestamps')).toThrow(WeakSecretError);
    expect(() => pack('x', 'member-magic-link')).toThrow(WeakSecretError);
  });
});

describe('what /api/health reports', () => {
  it('says "weak" without throwing, so the endpoint stays curl-able', () => {
    production();
    expect(secretHealth()).toBe('weak');
    expect(hasStrongSecret()).toBe(false);
  });

  it('says "ok" once a 32+ character secret is set', () => {
    production(STRONG);
    expect(secretHealth()).toBe('ok');
    expect(hasStrongSecret()).toBe(true);
  });
});
