import { describe, expect, it, beforeEach } from 'vitest';
import { sealData, unsealData } from 'iron-session';
import {
  MAGIC_LINK_TTL_MS,
  MEMBER_COOKIE,
  issueMagicToken,
  memberSessionOptions,
  memberSessionSecret,
  readMagicToken,
} from '@/lib/member-auth';
import { SESSION_COOKIE, isStaffRole, requireRole, sessionOptions } from '@/lib/auth';
import { SITE_KEYS, siteSellsProducts, sites } from '@/sites/registry';
import { resolveRequest, isMemberPath } from '@/sites/resolve';

const prod = { isDev: false as const };

beforeEach(() => {
  process.env.SESSION_SECRET = 'admin-secret-that-is-at-least-32-chars-long';
  delete process.env.MEMBER_SESSION_SECRET;
});

describe('member and admin sessions are separate (plan §1.15, §5.4.5)', () => {
  it('uses a different cookie name', () => {
    expect(MEMBER_COOKIE).not.toBe(SESSION_COOKIE);
    expect(memberSessionOptions().cookieName).toBe(MEMBER_COOKIE);
    expect(sessionOptions().cookieName).toBe(SESSION_COOKIE);
  });

  it('uses a different secret, derived so no second env var is required', () => {
    expect(memberSessionSecret()).not.toBe(sessionOptions().password);
    expect(memberSessionSecret().length).toBeGreaterThanOrEqual(32);
  });

  it('honours MEMBER_SESSION_SECRET when it is set', () => {
    process.env.MEMBER_SESSION_SECRET = 'a-dedicated-member-secret-32-chars-min';
    expect(memberSessionSecret()).toBe('a-dedicated-member-secret-32-chars-min');
  });

  it('a member cookie carries nothing when read as an admin session', async () => {
    // Forge the most privileged member cookie possible: role admin, real id.
    const forged = await sealData(
      { userId: 1, email: 'member@example.com', role: 'admin' },
      { password: memberSessionSecret(), ttl: 3600 },
    );
    // iron-session answers an EMPTY object rather than throwing when the seal
    // does not match, so the assertion is that nothing survives the crossing —
    // and an empty session fails `requireRole` on the very next line.
    const asAdmin = await unsealData<Record<string, unknown>>(forged, {
      password: sessionOptions().password as string,
    });
    expect(asAdmin.userId).toBeUndefined();
    expect(asAdmin.role).toBeUndefined();
    expect(() => requireRole(asAdmin as never, ['admin'])).toThrow('Forbidden');
  });

  it('and an admin cookie carries nothing when read as a member session', async () => {
    const admin = await sealData(
      { userId: 1, email: 'anton@example.com', role: 'admin' },
      { password: sessionOptions().password as string, ttl: 3600 },
    );
    const asMember = await unsealData<Record<string, unknown>>(admin, {
      password: memberSessionSecret(),
    });
    expect(asMember.userId).toBeUndefined();
  });

  it('requireRole rejects the member role outright', () => {
    expect(() => requireRole({ userId: 1, role: 'member' as never }, ['admin'])).toThrow('Forbidden');
    expect(() => requireRole({ userId: 1, role: 'editor' }, ['admin'])).toThrow('Forbidden');
    expect(() => requireRole({ userId: 1, role: 'admin' }, ['admin'])).not.toThrow();
  });

  it('member is never a staff role', () => {
    expect(isStaffRole('member')).toBe(false);
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('editor')).toBe(true);
    expect(isStaffRole(null)).toBe(false);
  });

  it('scopes the admin cookie to /admin and the member cookie to the whole site', () => {
    expect(sessionOptions().cookieOptions?.path).toBe('/admin');
    expect(memberSessionOptions().cookieOptions?.path).toBe('/');
  });
});

describe('magic links', () => {
  const NOW = new Date('2026-06-15T12:00:00Z');

  it('round-trips the email, the issue time and the brand', () => {
    const token = issueMagicToken('Buyer@Example.com ', 'guide', NOW);
    const verdict = readMagicToken(token, NOW);
    expect(verdict).toEqual({
      ok: true,
      email: 'buyer@example.com',
      issuedAt: NOW.getTime(),
      site: 'guide',
    });
  });

  it('expires after 30 minutes', () => {
    const token = issueMagicToken('buyer@example.com', 'guide', NOW);
    const justInside = new Date(NOW.getTime() + MAGIC_LINK_TTL_MS - 1000);
    const justOutside = new Date(NOW.getTime() + MAGIC_LINK_TTL_MS + 1000);
    expect(readMagicToken(token, justInside).ok).toBe(true);
    expect(readMagicToken(token, justOutside)).toEqual({ ok: false, reason: 'expired' });
  });

  it('refuses a tampered or unsigned token', () => {
    const token = issueMagicToken('buyer@example.com', 'guide', NOW);
    expect(readMagicToken(token.replace(/.$/, 'x'), NOW).ok).toBe(false);
    expect(readMagicToken('not-a-token', NOW)).toEqual({ ok: false, reason: 'invalid' });
    expect(readMagicToken('', NOW)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('refuses a token that claims to come from the future', () => {
    const token = issueMagicToken('buyer@example.com', 'guide', new Date(NOW.getTime() + 600_000));
    expect(readMagicToken(token, NOW)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('cannot be forged by rewriting the payload', () => {
    // The unsigned half of the token is base64url of `email|ts|site`.
    const forged = `${Buffer.from('attacker@example.com|' + NOW.getTime() + '|guide').toString('base64url')}.deadbeef`;
    expect(readMagicToken(forged, NOW).ok).toBe(false);
  });
});

describe('/login and /members exist only where something is sold (§5.4.5)', () => {
  it('recognises the member paths', () => {
    expect(isMemberPath('/login')).toBe(true);
    expect(isMemberPath('/members')).toBe(true);
    expect(isMemberPath('/members/module/lesson')).toBe(true);
    expect(isMemberPath('/membership')).toBe(false);
    expect(isMemberPath('/loginx')).toBe(false);
    expect(isMemberPath('/')).toBe(false);
  });

  it('only the guide brand sells anything today', () => {
    const selling = SITE_KEYS.filter(siteSellsProducts);
    expect(selling).toEqual(['guide']);
    expect(sites.guide.products).toEqual(['guide-entry', 'guide-insider']);
  });

  it('serves /login and /members on the guide host', () => {
    for (const path of ['/login', '/members']) {
      expect(resolveRequest({ host: 'paraguayresidencyguide.com', pathname: path, ...prod })).toEqual({
        type: 'rewrite',
        site: 'guide',
        path: `/sites/guide${path}`,
      });
    }
  });

  it('404s them on all six lead-gen brands, in production and in dev', () => {
    const leadGen = SITE_KEYS.filter((k) => !siteSellsProducts(k));
    expect(leadGen).toHaveLength(6);
    for (const key of leadGen) {
      for (const path of ['/login', '/members', '/members/anything']) {
        expect(
          resolveRequest({ host: sites[key].canonicalHost, pathname: path, ...prod }),
          `${key} should 404 ${path}`,
        ).toEqual({ type: 'blocked' });
        expect(
          resolveRequest({ host: `${key}.localhost:3000`, pathname: path, isDev: true }),
        ).toEqual({ type: 'blocked' });
      }
    }
  });

  it('blocks rather than redirects, so a 404 never advertises a member area', () => {
    const result = resolveRequest({ host: 'paraguayfrontier.com', pathname: '/members', ...prod });
    expect(result.type).toBe('blocked');
    expect(result).not.toHaveProperty('url');
  });
});
