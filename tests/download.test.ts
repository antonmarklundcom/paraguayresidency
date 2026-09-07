import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  downloadState,
  expiryFrom,
  MAX_DOWNLOADS,
  privateRoot,
  resolvePrivateFile,
  TOKEN_TTL_MS,
} from '@/lib/download-policy';

/**
 * Plan §5.2 exit criteria: "6th download rejected, expired token rejected",
 * and the phase trap "streams from `private/`, never from `public/`".
 */
const NOW = new Date('2026-09-07T12:00:00Z');
const later = (ms: number) => new Date(NOW.getTime() + ms);

const paid = {
  expiresAt: later(TOKEN_TTL_MS),
  downloads: 0,
  maxDownloads: MAX_DOWNLOADS,
  purchaseStatus: 'paid' as const,
};

describe('downloadState', () => {
  it('allows a fresh token on a paid order', () => {
    expect(downloadState(paid, NOW)).toBe('ok');
  });

  it('allows the 5th download and rejects the 6th', () => {
    expect(downloadState({ ...paid, downloads: MAX_DOWNLOADS - 1 }, NOW)).toBe('ok');
    expect(downloadState({ ...paid, downloads: MAX_DOWNLOADS }, NOW)).toBe('exhausted');
    expect(downloadState({ ...paid, downloads: MAX_DOWNLOADS + 3 }, NOW)).toBe('exhausted');
  });

  it('rejects a token past its expiry, including exactly at it', () => {
    expect(downloadState({ ...paid, expiresAt: later(-1) }, NOW)).toBe('expired');
    expect(downloadState({ ...paid, expiresAt: NOW }, NOW)).toBe('expired');
    expect(downloadState({ ...paid, expiresAt: later(1) }, NOW)).toBe('ok');
  });

  it('expires 72 hours after issue (plan §5.2.4)', () => {
    const expiry = expiryFrom(NOW);
    expect(expiry.getTime() - NOW.getTime()).toBe(72 * 60 * 60 * 1000);
    expect(downloadState({ ...paid, expiresAt: expiry }, later(TOKEN_TTL_MS - 1000))).toBe('ok');
    expect(downloadState({ ...paid, expiresAt: expiry }, later(TOKEN_TTL_MS + 1000))).toBe('expired');
  });

  it('refuses an unpaid or refunded order however good the token is', () => {
    expect(downloadState({ ...paid, purchaseStatus: 'pending' }, NOW)).toBe('unpaid');
    expect(downloadState({ ...paid, purchaseStatus: 'refunded' }, NOW)).toBe('unpaid');
  });

  it('reports a missing token rather than throwing', () => {
    expect(downloadState(null, NOW)).toBe('not-found');
    expect(downloadState(undefined, NOW)).toBe('not-found');
  });

  it('treats an unparseable expiry as expired, not as valid', () => {
    expect(downloadState({ ...paid, expiresAt: 'never' }, NOW)).toBe('expired');
  });

  it('accepts an ISO string expiry, as MySQL hands it back', () => {
    expect(downloadState({ ...paid, expiresAt: later(1000).toISOString() }, NOW)).toBe('ok');
  });
});

describe('resolvePrivateFile', () => {
  it('resolves a plain key inside private/', () => {
    expect(resolvePrivateFile('guide-placeholder.pdf')).toBe(
      resolve(privateRoot(), 'guide-placeholder.pdf'),
    );
    expect(resolvePrivateFile('editions/es/guide.pdf')).toBe(
      resolve(privateRoot(), 'editions/es/guide.pdf'),
    );
  });

  it('never resolves outside private/', () => {
    for (const key of [
      '../public/secret.pdf',
      '../../etc/passwd',
      'a/../../outside.pdf',
      './../.env',
    ]) {
      expect(resolvePrivateFile(key)).toBeNull();
    }
  });

  it('refuses absolute paths and null bytes', () => {
    expect(resolvePrivateFile('/etc/passwd')).toBeNull();
    expect(resolvePrivateFile('C:\\Windows\\win.ini')).toBeNull();
    expect(resolvePrivateFile('guide.pdf\0.txt')).toBeNull();
  });

  it('refuses an empty or missing key', () => {
    expect(resolvePrivateFile('')).toBeNull();
    expect(resolvePrivateFile(null)).toBeNull();
    expect(resolvePrivateFile(undefined)).toBeNull();
  });

  it('serves from private/, never from public/', () => {
    expect(privateRoot().endsWith(`${'private'}`)).toBe(true);
    expect(resolvePrivateFile('guide.pdf')).not.toContain('/public/');
  });
});

describe('privateRoot', () => {
  const before = process.env.PRIVATE_DIR;
  afterEach(() => {
    if (before === undefined) delete process.env.PRIVATE_DIR;
    else process.env.PRIVATE_DIR = before;
  });

  it('honours an explicit PRIVATE_DIR — the standalone build needs it', () => {
    process.env.PRIVATE_DIR = '/srv/paraguayresidency/private';
    expect(privateRoot()).toBe('/srv/paraguayresidency/private');
    expect(resolvePrivateFile('guide.pdf')).toBe('/srv/paraguayresidency/private/guide.pdf');
    expect(resolvePrivateFile('../public/guide.pdf')).toBeNull();
  });

  it('falls back to <cwd>/private when nothing is configured', () => {
    delete process.env.PRIVATE_DIR;
    expect(privateRoot()).toBe(resolve(process.cwd(), 'private'));
  });
});
