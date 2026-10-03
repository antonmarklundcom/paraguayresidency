import 'server-only';
import { forbidden, redirect } from 'next/navigation';
import { currentAdmin, type Role } from '@/lib/auth';

/**
 * What a page does with the current session. Not signed in → the login page.
 * Signed in but without the role → 403 (`./forbidden.tsx`), NEVER the login
 * page: the login page sends any signed-in staff user on to `/admin/leads`, so
 * redirecting an `editor` there was an endless loop (O26 bug 3). What an
 * editor may see is designed in O27; until then every page is admin-only.
 */
export function adminPageVerdict(
  admin: { role: Role } | null,
  allowed: Role[],
): 'ok' | 'login' | 'forbidden' {
  if (!admin) return 'login';
  return allowed.includes(admin.role) ? 'ok' : 'forbidden';
}

/**
 * Page-level guard. Pairs with the per-action `requireRole` in `actions.ts`:
 * this one decides what is rendered, that one decides what may be written.
 * Both are needed — a redirect is not an authorisation check.
 */
export async function requireAdminPage(allowed: Role[] = ['admin']) {
  const admin = await currentAdmin();
  const verdict = adminPageVerdict(admin, allowed);
  if (verdict === 'login') redirect('/admin/login');
  if (verdict === 'forbidden') forbidden();
  return admin!;
}
