import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default async function Page() {
  if (await currentAdmin()) redirect('/admin/leads');
  return (
    <div className="mx-auto max-w-[26rem] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <h1 className="font-[family-name:var(--display-font)] text-[var(--text-2xl)]">Sign in</h1>
      <p className="mt-2 text-[var(--text-sm)] text-[var(--fg-muted)]">
        Admin accounts are created by <code>npm run db:seed</code>. There is no public signup.
      </p>
      <LoginForm />
    </div>
  );
}
