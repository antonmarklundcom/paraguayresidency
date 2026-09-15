import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { grantTierAction } from '../actions';
import { ActionButton, panel, table, td, th } from '../ui';
import { listMembers } from '@/lib/admin-queries';
import { TIERS } from '@/lib/entitlements';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Members', robots: { index: false, follow: false } };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const raw = params.q;
  const search = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  const { rows, unavailable } = await listMembers(search);

  return (
    <>
      <h1 className="font-[family-name:var(--display-font)] text-[var(--text-2xl)]">Members</h1>
      <p className="mt-2 text-[var(--text-sm)] text-[var(--fg-muted)]">
        Everyone who has bought something. The tier column is the cached value on the
        user row; the truth is computed from their purchases and subscriptions on
        every request.
      </p>

      <form method="get" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by email"
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text-sm)]"
        />
        <button type="submit" className="underline underline-offset-4">
          Search
        </button>
      </form>

      {unavailable ? (
        <p className={`${panel} mt-6 p-4 text-[var(--text-sm)] text-[var(--fg-muted)]`}>
          DATABASE_URL is not set on this server, so there is nothing to list.
        </p>
      ) : (
        <div className={`${panel} mt-6 overflow-x-auto`}>
          <table className={table}>
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>Email</th>
                <th className={th}>Tier (cached)</th>
                <th className={th}>Expires</th>
                <th className={th}>Brand</th>
                <th className={th}>Provider ids</th>
                <th className={th}>Last login</th>
                <th className={th}>Grant</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member) => (
                <tr key={member.id}>
                  <td className={td}>{member.id}</td>
                  <td className={td}>
                    {member.name ? `${member.name} · ` : ''}
                    <a href={`mailto:${member.email}`} className="underline underline-offset-2">
                      {member.email}
                    </a>
                  </td>
                  <td className={td}>{member.tier}</td>
                  <td className={td}>{member.tierExpiresAt?.toISOString().slice(0, 10) ?? '—'}</td>
                  <td className={td}>{member.homeSite ?? '—'}</td>
                  <td className={td}>
                    {member.providerIds.length ? (
                      <span className="text-[var(--text-xs)]">{member.providerIds.join(', ')}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={td}>{member.lastLoginAt?.toISOString().slice(0, 10) ?? 'never'}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <ActionButton
                        action={grantTierAction}
                        name="userId"
                        value={member.id}
                        label="Grant"
                        busyLabel="Saving…"
                      >
                        <select
                          name="tier"
                              defaultValue={member.tier}
                              className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--text-xs)]"
                            >
                              {TIERS.map((tier) => (
                                <option key={tier} value={tier}>
                                  {tier}
                                </option>
                              ))}
                            </select>
                            <input
                              name="until"
                              type="date"
                              defaultValue={member.tierExpiresAt?.toISOString().slice(0, 10) ?? ''}
                              className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--text-xs)]"
                            />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className={td} colSpan={8}>
                    No members yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
