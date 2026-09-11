import { existsSync } from 'node:fs';
import { isAbsolute, join, normalize, resolve, sep } from 'node:path';
import { isUnlocked } from './entitlements';
import type { MinTier, Tier } from '@/db/schema';

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
  purchaseStatus: 'pending' | 'paid' | 'refunded';
}

export function downloadState(
  candidate: DownloadCandidate | null | undefined,
  now: Date = new Date(),
): DownloadState {
  if (!candidate) return 'not-found';
  if (candidate.purchaseStatus !== 'paid') return 'unpaid';
  const expiresAt =
    candidate.expiresAt instanceof Date ? candidate.expiresAt : new Date(candidate.expiresAt);
  if (!Number.isFinite(expiresAt.getTime())) return 'expired';
  // Checked before the counter so an expired-and-exhausted token reads as
  // expired — the message the buyer needs is "ask for a fresh link" either way.
  if (expiresAt.getTime() <= now.getTime()) return 'expired';
  if (candidate.downloads >= candidate.maxDownloads) return 'exhausted';
  return 'ok';
}

/* ------------------------------------------------------ member resources */

/**
 * Drip offset for a member `resources` row (O17 §14.1.7).
 *
 * `modules` and `lessons` carry `drip_days`; `resources` does not, and the
 * schema is FINAL (O9), so the columnless answer is an explicit zero rather
 * than a second gate that quietly ignores the drip. What matters is that the
 * download route now goes through the SAME `isUnlocked()` the lesson pages use,
 * so the day `resources.drip_days` exists (Backlog) one constant changes here
 * and the route needs no edit at all.
 */
export const RESOURCE_DRIP_DAYS = 0;

/**
 * The gate for one member resource: tier AND drip, exactly as a lesson.
 *
 * Before O17 the download route checked `hasTier` only, so it was the one
 * member surface whose rule could drift from the pages around it
 * (`docs/improvement-report.md` §1.10).
 */
export function resourceUnlocked(
  resource: { minTier: MinTier },
  tier: Tier,
  firstEntitledAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  return isUnlocked({ minTier: resource.minTier, dripDays: RESOURCE_DRIP_DAYS }, tier, firstEntitledAt, now);
}

export function expiryFrom(now: Date = new Date(), ttlMs: number = TOKEN_TTL_MS): Date {
  return new Date(now.getTime() + ttlMs);
}

/**
 * Root of the non-public file store. Never under `public/`.
 *
 * `next.config.ts` sets `output: 'standalone'`, and the standalone server runs
 * with its cwd inside `.next/standalone/` — so `cwd/private` is wrong in
 * exactly the environment that matters, production. Found by running the
 * standalone build during O2 verification.
 *
 * Resolution order: an explicit `PRIVATE_DIR` (what the deploy sets when the
 * files live outside the release directory), then `cwd/private`, then the
 * repository root as seen from `.next/standalone/`.
 */
export function privateRoot(): string {
  const configured = (process.env.PRIVATE_DIR ?? '').trim();
  if (configured) return resolve(configured);

  const candidates = [
    resolve(process.cwd(), 'private'),
    // .next/standalone → ../../private
    resolve(process.cwd(), '..', '..', 'private'),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
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
