import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { eq, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { users, type User } from '@/db/schema';
import { siteOrigin, type SiteKey } from '@/sites/registry';
import { pack, signingSecret, unpack } from './signing';

/**
 * Passwordless member auth (plan §1.15, §5.4.5).
 *
 * A $7 buyer never sets a password: the email a processor gives us is the
 * identity, and a signed, single-use, short-lived link is the credential.
 *
 * The member session is deliberately a DIFFERENT COOKIE with a DIFFERENT
 * SECRET from the admin session in `src/lib/auth.ts`. A member cookie
 * therefore cannot be unsealed as an admin one, so it can never satisfy
 * `requireRole('admin')` even if the role field were tampered with —
 * `tests/member-session.test.ts` asserts exactly that.
 */

export const MEMBER_COOKIE = 'pyrg_member';
const MAGIC_PURPOSE = 'member-magic-link';

/** A link is worth little if it lives long. 30 minutes, single use. */
export const MAGIC_LINK_TTL_MS = 30 * 60 * 1000;

export interface MemberSession {
  userId?: number;
  email?: string;
  /** Which brand they signed in on; drives where /logout returns them. */
  site?: SiteKey;
}

/**
 * Domain-separated from the admin secret. Deriving rather than requiring a
 * second env var keeps §4.5 (missing keys never block) while guaranteeing the
 * two cookies can never be interchanged.
 */
export function memberSessionSecret(): string {
  const base = process.env.MEMBER_SESSION_SECRET;
  if (base && base.length >= 32) return base;
  // `pack` is HMAC over the admin secret with a distinct purpose, so this is a
  // key the admin session can neither produce nor verify.
  return `member:${pack('session', 'member-session-key', signingSecret())}`.slice(0, 64);
}

export function memberSessionOptions(): SessionOptions {
  return {
    password: memberSessionSecret(),
    cookieName: MEMBER_COOKIE,
    ttl: 60 * 60 * 24 * 30,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // Deliberately NOT scoped to /admin: members live at /members and /login.
      path: '/',
    },
  };
}

export async function getMemberSession(): Promise<IronSession<MemberSession>> {
  return getIronSession<MemberSession>(await cookies(), memberSessionOptions());
}

/* ------------------------------------------------------------ magic links */

/**
 * The token is `<email>|<issuedAt>|<site>` signed with the shared HMAC secret.
 * It is stateless, so nothing has to be stored or cleaned up; single use comes
 * from `users.last_login_at` moving past the issue time when it is redeemed.
 */
export function issueMagicToken(email: string, site: SiteKey, now: Date = new Date()): string {
  return pack(`${email.trim().toLowerCase()}|${now.getTime()}|${site}`, MAGIC_PURPOSE);
}

export type MagicVerdict =
  | { ok: true; email: string; issuedAt: number; site: SiteKey }
  | { ok: false; reason: 'invalid' | 'expired' };

/** Pure — tested without a database or a request. */
export function readMagicToken(token: string, now: Date = new Date()): MagicVerdict {
  const raw = unpack(token, MAGIC_PURPOSE);
  if (raw === null) return { ok: false, reason: 'invalid' };
  const [email, issued, site] = raw.split('|');
  const issuedAt = Number(issued);
  if (!email || !Number.isFinite(issuedAt) || !site) return { ok: false, reason: 'invalid' };
  // A token from the future is a forged clock, not an expiry.
  if (issuedAt - now.getTime() > 60_000) return { ok: false, reason: 'invalid' };
  if (now.getTime() - issuedAt > MAGIC_LINK_TTL_MS) return { ok: false, reason: 'expired' };
  return { ok: true, email, issuedAt, site: site as SiteKey };
}

export function magicLinkUrl(token: string, site: SiteKey): string {
  return `${siteOrigin(site)}/api/auth/magic/${encodeURIComponent(token)}`;
}

/* ------------------------------------------------------- the current member */

/** The signed-in member's row, re-read every time. The cookie is not authority. */
export async function currentMember(): Promise<User | null> {
  if (!hasDatabase()) return null;
  const session = await getMemberSession();
  if (!session.userId) return null;
  try {
    const [row] = await getDb().select().from(users).where(eq(users.id, session.userId)).limit(1);
    // A member whose role was raised to staff still signs in at /admin with a
    // password; this session never grants it.
    return row ?? null;
  } catch (error) {
    console.error('[member-auth] could not load the member', error);
    return null;
  }
}

/** Redeems a verified token: sets the cookie and stamps `last_login_at`. */
export async function signInMember(userId: number, email: string, site: SiteKey): Promise<void> {
  const session = await getMemberSession();
  session.userId = userId;
  session.email = email;
  session.site = site;
  await session.save();
  if (hasDatabase()) {
    try {
      await getDb().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
    } catch (error) {
      console.error('[member-auth] could not stamp last_login_at', error);
    }
  }
}

export async function signOutMember(): Promise<void> {
  (await getMemberSession()).destroy();
}

/**
 * Find or create the account behind an email. Called by both webhooks and by
 * the login endpoint's lookup — never by a public "register" route, because
 * there is no such route (an account exists because someone paid).
 */
export async function findOrCreateUser(input: {
  email: string;
  name?: string | null;
  site: SiteKey;
}): Promise<User | null> {
  if (!hasDatabase()) return null;
  const email = input.email.trim().toLowerCase();
  if (!email) return null;
  const db = getDb();

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    // Fill in a name or a home site we did not have before; never overwrite.
    const patch: Partial<typeof users.$inferInsert> = {};
    if (!existing.name && input.name) patch.name = input.name;
    if (!existing.homeSite) patch.homeSite = input.site;
    if (Object.keys(patch).length) {
      await db.update(users).set(patch).where(eq(users.id, existing.id));
      return { ...existing, ...patch } as User;
    }
    return existing;
  }

  await db
    .insert(users)
    .values({ email, name: input.name ?? null, role: 'member', homeSite: input.site, tier: 'none' })
    // Two webhooks for the same new buyer can race; the unique index decides.
    .onDuplicateKeyUpdate({ set: { email: sql`values(email)` } });
  const [created] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return created ?? null;
}


