import { isAbsolute, join, normalize, resolve, sep } from 'node:path';

/**
 * Delivery rules for the paid guide, as pure functions (plan §5.2.4 traps:
 * the file streams from `private/`, never `public/`, and the token limits are
 * enforced, not decorative).
 */

/** Plan §5.2.4: 72 hours, 5 downloads. */
export const TOKEN_TTL_MS = 72 * 60 * 60 * 1000;
export const MAX_DOWNLOADS = 5;

export type DownloadState = 'ok' | 'not-found' | 'unpaid' | 'expired' | 'exhausted';

export interface DownloadCandidate {
  expiresAt: Date | string;
  downloads: number;
  maxDownloads: number;
  orderStatus: 'pending' | 'paid' | 'refunded';
}

export function downloadState(
  candidate: DownloadCandidate | null | undefined,
  now: Date = new Date(),
): DownloadState {
  if (!candidate) return 'not-found';
  if (candidate.orderStatus !== 'paid') return 'unpaid';
  const expiresAt =
    candidate.expiresAt instanceof Date ? candidate.expiresAt : new Date(candidate.expiresAt);
  if (!Number.isFinite(expiresAt.getTime())) return 'expired';
  // Checked before the counter so an expired-and-exhausted token reads as
  // expired — the message the buyer needs is "ask for a fresh link" either way.
  if (expiresAt.getTime() <= now.getTime()) return 'expired';
  if (candidate.downloads >= candidate.maxDownloads) return 'exhausted';
  return 'ok';
}

export function expiryFrom(now: Date = new Date(), ttlMs: number = TOKEN_TTL_MS): Date {
  return new Date(now.getTime() + ttlMs);
}

/** Root of the non-public file store. Never under `public/`. */
export function privateRoot(): string {
  return resolve(process.cwd(), 'private');
}

/**
 * Resolves a `products.file_key` to an absolute path inside `private/`.
 * Returns null for anything that would escape it — an absolute path, a
 * `..` segment, or a key with a null byte.
 */
export function resolvePrivateFile(fileKey: string | null | undefined): string | null {
  if (!fileKey || typeof fileKey !== 'string') return null;
  if (fileKey.includes('\0')) return null;
  if (isAbsolute(fileKey) || /^[a-zA-Z]:[\\/]/.test(fileKey)) return null;

  const root = privateRoot();
  const candidate = resolve(join(root, normalize(fileKey)));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}
