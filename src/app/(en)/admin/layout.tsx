import type { ReactNode } from 'react';
import Link from 'next/link';
import { currentAdmin } from '@/lib/auth';
import { logoutAction } from './actions';

/**
 * Admin chrome. The host restriction is enforced upstream in
 * `src/middleware.ts` — `/admin` 404s on the two non-hub brands (plan §2), so
 * this layout only ever renders on the hub.
 *
 * It deliberately does NOT use the brand shell: the admin is a tool, not a
 * page of any of the three sites.
 */
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await currentAdmin();

  return (
    <div data-theme="residency" className="min-h-screen bg-[var(--surface-alt)] text-[var(--fg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[76rem] flex-wrap items-center gap-4 px-5 py-3 text-[var(--text-sm)]">
          <Link href="/admin/leads" className="font-medium">
            Admin
          </Link>
          {admin ? (
            <>
              <nav className="flex gap-4">
                <Link href="/admin/leads" className="hover:underline">
                  Leads
                </Link>
                <Link href="/admin/purchases" className="hover:underline">
                  Purchases
                </Link>
                <Link href="/admin/members" className="hover:underline">
                  Members
                </Link>
                <Link href="/admin/facts" className="hover:underline">
                  Facts
                </Link>
              </nav>
              <form action={logoutAction} className="ml-auto flex items-center gap-3">
                <span className="text-[var(--fg-muted)]">{admin.email}</span>
                <button type="submit" className="underline underline-offset-4">
                  Sign out
                </button>
              </form>
            </>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-[76rem] px-5 py-8">{children}</main>
    </div>
  );
}
