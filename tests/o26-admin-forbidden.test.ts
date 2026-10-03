import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * O26 bug 3: a signed-in `editor` was redirected from every admin page to
 * `/admin/login`, and the login page redirected any signed-in staff user back
 * to `/admin/leads` — an endless loop. A signed-in user without the role now
 * gets a 403 (`forbidden()`), never the login page.
 */
const mocks = vi.hoisted(() => ({ admin: null as null | { userId: number; role: 'admin' | 'editor' } }));
vi.mock('@/lib/auth', () => ({ currentAdmin: async () => mocks.admin }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => { throw new Error(`REDIRECT ${url}`); },
  forbidden: () => { throw new Error('FORBIDDEN'); },
}));
import { adminPageVerdict, requireAdminPage } from '@/app/(en)/admin/guard';
import LoginPage from '@/app/(en)/admin/login/page';

beforeEach(() => { mocks.admin = null; });

describe('admin page guard', () => {
  it('decides login / forbidden / ok', () => {
    expect(adminPageVerdict(null, ['admin'])).toBe('login');
    expect(adminPageVerdict({ role: 'editor' }, ['admin'])).toBe('forbidden');
    expect(adminPageVerdict({ role: 'admin' }, ['admin'])).toBe('ok');
    expect(adminPageVerdict({ role: 'editor' }, ['admin', 'editor'])).toBe('ok');
  });

  it('sends a visitor who is not signed in to the login page', async () => {
    await expect(requireAdminPage()).rejects.toThrow('REDIRECT /admin/login');
  });

  it('answers 403 to a signed-in editor instead of the login page', async () => {
    mocks.admin = { userId: 2, role: 'editor' };
    await expect(requireAdminPage()).rejects.toThrow('FORBIDDEN');
  });

  it('lets an admin through', async () => {
    mocks.admin = { userId: 1, role: 'admin' };
    await expect(requireAdminPage()).resolves.toEqual({ userId: 1, role: 'admin' });
  });

  it('no longer loops: login → /admin/leads → 403, and the guard never points back at login', async () => {
    mocks.admin = { userId: 2, role: 'editor' };
    await expect(LoginPage()).rejects.toThrow('REDIRECT /admin/leads');
    await expect(requireAdminPage()).rejects.not.toThrow(/REDIRECT \/admin\/login/);
  });
});
