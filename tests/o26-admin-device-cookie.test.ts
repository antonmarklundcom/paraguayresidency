import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * O26 bug 4: the known-device cookie that exempts the real admin's browser
 * from the per-email backstop. It must be bound to one address and unforgeable.
 */
const jar = vi.hoisted(() => new Map<string, string>());
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => { jar.set(name, value); },
  }),
}));
import { DEVICE_COOKIE, isKnownAdminDevice, rememberAdminDevice } from '@/lib/auth';

beforeEach(() => {
  jar.clear();
  vi.stubEnv('SESSION_SECRET', 'o26-test-secret-that-is-long-enough-0123456789');
});

describe('known admin device cookie', () => {
  it('is unknown until a successful login remembers it', async () => {
    expect(await isKnownAdminDevice('anton@example.com')).toBe(false);
    await rememberAdminDevice('Anton@Example.com');
    expect(jar.has(DEVICE_COOKIE)).toBe(true);
    expect(await isKnownAdminDevice('anton@example.com')).toBe(true);
  });

  it('is bound to the address it was issued for', async () => {
    await rememberAdminDevice('editor@example.com');
    expect(await isKnownAdminDevice('anton@example.com')).toBe(false);
  });

  it('cannot be forged or carried across a secret rotation', async () => {
    jar.set(DEVICE_COOKIE, 'Fe26.2**forged');
    expect(await isKnownAdminDevice('anton@example.com')).toBe(false);
    await rememberAdminDevice('anton@example.com');
    vi.stubEnv('SESSION_SECRET', 'a-completely-different-secret-0123456789abcdef');
    expect(await isKnownAdminDevice('anton@example.com')).toBe(false);
  });

  it('is never issued or honoured without a strong secret', async () => {
    vi.stubEnv('SESSION_SECRET', 'short');
    await rememberAdminDevice('anton@example.com');
    expect(jar.has(DEVICE_COOKIE)).toBe(false);
  });
});
