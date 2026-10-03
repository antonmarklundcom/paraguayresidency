import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'No access', robots: { index: false, follow: false } };

/**
 * The 403 `requireAdminPage` renders for a signed-in staff user whose role does
 * not cover the page (O26 bug 3). The admin layout around it still shows the
 * email and "Sign out", so switching account is one click.
 */
export default function AdminForbidden() {
  return (
    <div className="mx-auto max-w-[32rem] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <h1 className="font-[family-name:var(--display-font)] text-(length:--text-2xl)">No access</h1>
      <p className="mt-2 text-(length:--text-sm) text-[var(--fg-muted)]">
        You are signed in, but your account does not have access to this page. Ask an admin to change your
        role, or sign out and sign in with an admin account.
      </p>
    </div>
  );
}
