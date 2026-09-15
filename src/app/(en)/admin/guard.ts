import 'server-only';
import { redirect } from 'next/navigation';
import { currentAdmin, type Role } from '@/lib/auth';

/**
 * Page-level guard. Pairs with the per-action `requireRole` in `actions.ts`:
 * this one decides what is rendered, that one decides what may be written.
 * Both are needed — a redirect is not an authorisation check.
 */
export async function requireAdminPage(allowed: Role[] = ['admin']) {
  const admin = await currentAdmin();
  if (!admin || !allowed.includes(admin.role)) redirect('/admin/login');
  return admin;
}
