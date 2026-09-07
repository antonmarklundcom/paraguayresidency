import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDb, hasDatabase } from '@/db';
import { users } from '@/db/schema';
import { hasStrongSecret, signingSecret } from './signing';

/**
 * Admin auth: iron-session cookie + bcrypt passwords on the `users` table
 * (stack skill §2 — the lighter option, no OAuth). Role checks always run on
 * the server; hiding a button is UX, not security.
 *
 * The host restriction is separate and comes first: `src/middleware.ts` 404s
 * `/admin` on any host that is not the hub (plan §2), so nothing here is even
 * reachable from the other two brands.
 */

export interface AdminSession {
  userId?: number;
  email?: string;
  role?: 'admin' | 'editor';
}

export const SESSION_COOKIE = 'pyrg_admin';

export function sessionOptions(): SessionOptions {
  return {
    password: signingSecret(),
    cookieName: SESSION_COOKIE,
    ttl: 60 * 60 * 8,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/admin',
    },
  };
}

export async function getSession(): Promise<IronSession<AdminSession>> {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

export type Role = 'admin' | 'editor';

/** Throws rather than returning a boolean, so a forgotten check cannot pass. */
export function requireRole(session: AdminSession | null, allowed: Role[]): asserts session is AdminSession & { userId: number; role: Role } {
  if (!session?.userId || !session.role || !allowed.includes(session.role)) {
    throw new Error('Forbidden');
  }
}

/** For server components: the session, or null when not signed in. */
export async function currentAdmin(): Promise<(AdminSession & { userId: number; role: Role }) | null> {
  const session = await getSession();
  if (!session.userId || !session.role) return null;
  return session as AdminSession & { userId: number; role: Role };
}

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return { ok: false, error: 'Enter your email and password.' };
  if (!hasDatabase()) {
    console.error('[auth] DATABASE_URL is not set — no admin login possible');
    return { ok: false, error: 'The admin database is not configured.' };
  }
  if (!hasStrongSecret()) {
    // Signing in against the development fallback key would mint a session
    // cookie anyone could forge. Refuse rather than pretend.
    console.error('[auth] SESSION_SECRET is missing or shorter than 32 characters');
    return { ok: false, error: 'SESSION_SECRET is not configured on this server.' };
  }

  const [user] = await getDb().select().from(users).where(eq(users.email, normalized)).limit(1);
  // Compare against a dummy hash when the user does not exist so a missing
  // account and a wrong password take the same time to answer.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
  const matches = await bcrypt.compare(password, hash);
  if (!user || !matches) return { ok: false, error: 'Those details do not match an account.' };

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  await session.save();
  return { ok: true };
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
