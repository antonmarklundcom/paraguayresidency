import { describe, expect, it } from 'vitest';
import { requireRole } from '@/lib/auth';
import { resolveRequest } from '@/sites/resolve';
import { HUB_SITE, SITE_KEYS, sites } from '@/sites/registry';
import { DISALLOWED } from '@/lib/seo-files';
import { LEAD_CSV_COLUMNS, parseLeadFilters, toCsv } from '@/lib/admin-queries';

/**
 * Plan §5.2 exit criterion: "admin cannot be reached on non-hub hosts", plus
 * the role check every mutating action runs (stack skill §2).
 */
describe('admin is reachable on the hub host only', () => {
  const adminPaths = ['/admin', '/admin/', '/admin/login', '/admin/leads', '/admin/leads/export'];

  it('passes /admin through on the hub', () => {
    for (const pathname of adminPaths) {
      expect(
        resolveRequest({ host: sites[HUB_SITE].canonicalHost, pathname, isDev: false }),
      ).toEqual({ type: 'pass', site: HUB_SITE });
    }
  });

  it('blocks /admin on every non-hub brand, in production and in dev', () => {
    for (const key of SITE_KEYS.filter((k) => k !== HUB_SITE)) {
      // `www.` hosts 301 to their own apex first; the apex is what must block,
      // and it is in this list.
      for (const host of sites[key].hosts.filter((h) => !h.startsWith('www.'))) {
        for (const pathname of adminPaths) {
          expect(resolveRequest({ host, pathname, isDev: false })).toEqual({ type: 'blocked' });
          expect(resolveRequest({ host, pathname, isDev: true })).toEqual({ type: 'blocked' });
        }
      }
    }
  });

  it('sends a www non-hub admin request to its own apex, which then blocks', () => {
    const first = resolveRequest({
      host: 'www.paraguayinvestorpass.com',
      pathname: '/admin/leads',
      isDev: false,
    });
    expect(first).toEqual({
      type: 'redirect',
      url: 'https://paraguayinvestorpass.com/admin/leads',
      status: 301,
    });
    expect(
      resolveRequest({ host: 'paraguayinvestorpass.com', pathname: '/admin/leads', isDev: false }),
    ).toEqual({ type: 'blocked' });
  });

  it('blocks /admin via the dev ?site= override too', () => {
    expect(
      resolveRequest({
        host: 'localhost',
        pathname: '/admin/leads',
        isDev: true,
        siteOverride: 'guide',
      }),
    ).toEqual({ type: 'blocked' });
  });

  it('never rewrites an admin path into a per-brand folder', () => {
    for (const key of SITE_KEYS) {
      for (const host of sites[key].hosts) {
        const result = resolveRequest({ host, pathname: '/admin/purchases', isDev: false });
        expect(result.type).not.toBe('rewrite');
      }
    }
  });

  it('does not block a path that merely starts with the same letters', () => {
    const result = resolveRequest({
      host: 'paraguayinvestorpass.com',
      pathname: '/administration-of-estates',
      isDev: false,
    });
    expect(result.type).toBe('rewrite');
  });

  it('keeps /admin out of every robots.txt', () => {
    expect(DISALLOWED).toContain('/admin');
  });
});

describe('requireRole', () => {
  it('accepts an admin', () => {
    expect(() => requireRole({ userId: 1, email: 'a@b.co', role: 'admin' }, ['admin'])).not.toThrow();
  });

  it('refuses a signed-out visitor, a session with no role, and the wrong role', () => {
    expect(() => requireRole(null, ['admin'])).toThrow('Forbidden');
    expect(() => requireRole({}, ['admin'])).toThrow('Forbidden');
    expect(() => requireRole({ userId: 1, email: 'a@b.co' }, ['admin'])).toThrow('Forbidden');
    expect(() => requireRole({ userId: 2, role: 'editor' }, ['admin'])).toThrow('Forbidden');
  });

  it('accepts an editor only where editors are allowed', () => {
    expect(() => requireRole({ userId: 2, role: 'editor' }, ['admin', 'editor'])).not.toThrow();
  });
});

describe('lead filters and CSV export', () => {
  it('keeps only recognised filter values', () => {
    expect(
      parseLeadFilters({
        site: 'guide',
        kind: 'quiz',
        from: '2026-01-01',
        to: 'whenever',
        page: '3',
      }),
    ).toEqual({ site: 'guide', kind: 'quiz', from: '2026-01-01', to: undefined, page: 3 });
  });

  it('discards an injected site, kind or page', () => {
    expect(
      parseLeadFilters({ site: "guide' OR 1=1", kind: 'DROP', page: '-4' }),
    ).toEqual({ site: undefined, kind: undefined, from: undefined, to: undefined, page: 1 });
  });

  it('quotes commas, quotes and newlines so a message cannot break a row', () => {
    const csv = toCsv(
      [{ id: 1, message: 'He said "hi", then\nleft', email: 'a@b.co' }],
      ['id', 'email', 'message'],
    );
    const [header, row] = csv.split('\r\n');
    expect(header).toBe('id,email,message');
    expect(row).toBe('1,a@b.co,"He said ""hi"", then\nleft"');
  });

  it('renders dates, objects, nulls and undefined predictably', () => {
    const csv = toCsv(
      [{ createdAt: new Date('2026-09-07T12:00:00Z'), utm: { s: 'g' }, name: null }],
      ['createdAt', 'utm', 'name', 'missing'],
    );
    expect(csv.split('\r\n')[1]).toBe('2026-09-07T12:00:00.000Z,"{""s"":""g""}",,');
  });

  it('never exports a column the leads table does not have', () => {
    expect(LEAD_CSV_COLUMNS).toContain('email');
    expect(LEAD_CSV_COLUMNS).not.toContain('passwordHash');
  });
});
