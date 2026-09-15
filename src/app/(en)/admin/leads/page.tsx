import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { retryLeadAction } from '../actions';
import { ActionButton, panel, table, td, th } from '../ui';
import { LEAD_KINDS } from '@/lib/lead-schema';
import { listLeads, parseLeadFilters } from '@/lib/admin-queries';
import { SITE_KEYS } from '@/sites/registry';
import type { SearchParams } from '@/lib/conversion-pages';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Leads', robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const params = await searchParams;
  const filters = parseLeadFilters(params);
  const { rows, total, page, pages, unavailable } = await listLeads(filters);

  const query = new URLSearchParams(
    Object.entries(filters)
      .filter(([key, value]) => key !== 'page' && value)
      .map(([key, value]) => [key, String(value)]),
  );

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-[family-name:var(--display-font)] text-[var(--text-2xl)]">Leads</h1>
        <span className="text-[var(--text-sm)] text-[var(--fg-muted)]">{total} matching</span>
        <a
          href={`/admin/leads/export?${query.toString()}`}
          className="ml-auto text-[var(--text-sm)] underline underline-offset-4"
        >
          Download CSV
        </a>
      </div>

      <form method="get" className={`${panel} mt-4 flex flex-wrap items-end gap-3 p-4`}>
        <label className="text-[var(--text-xs)] text-[var(--fg-muted)]">
          Site
          <select name="site" defaultValue={filters.site ?? ''} className={select}>
            <option value="">All</option>
            {SITE_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[var(--text-xs)] text-[var(--fg-muted)]">
          Kind
          <select name="kind" defaultValue={filters.kind ?? ''} className={select}>
            <option value="">All</option>
            {LEAD_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[var(--text-xs)] text-[var(--fg-muted)]">
          From
          <input type="date" name="from" defaultValue={filters.from ?? ''} className={select} />
        </label>
        <label className="text-[var(--text-xs)] text-[var(--fg-muted)]">
          To
          <input type="date" name="to" defaultValue={filters.to ?? ''} className={select} />
        </label>
        <button
          type="submit"
          className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2 text-[var(--text-xs)] font-medium text-[var(--accent-fg)]"
        >
          Filter
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
                <th className={th}>When</th>
                <th className={th}>Site / kind</th>
                <th className={th}>Contact</th>
                <th className={th}>Detail</th>
                <th className={th}>CRM</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id}>
                  <td className={td}>{lead.id}</td>
                  <td className={td}>{lead.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                  <td className={td}>
                    {lead.site}
                    <br />
                    <span className="text-[var(--fg-muted)]">{lead.kind}</span>
                  </td>
                  <td className={td}>
                    {lead.name ?? '—'}
                    <br />
                    <a href={`mailto:${lead.email}`} className="underline underline-offset-2">
                      {lead.email}
                    </a>
                    {lead.phone ? (
                      <>
                        <br />
                        {lead.phone}
                      </>
                    ) : null}
                  </td>
                  <td className={`${td} max-w-[24rem] whitespace-pre-wrap`}>
                    {lead.quizResult ? (
                      <div className="text-[var(--fg-muted)]">route: {lead.quizResult}</div>
                    ) : null}
                    {lead.message ?? '—'}
                  </td>
                  <td className={td}>
                    <span
                      className={
                        lead.crmStatus === 'sent'
                          ? 'text-[var(--success)]'
                          : lead.crmStatus === 'failed'
                            ? 'text-[var(--danger)]'
                            : 'text-[var(--fg-muted)]'
                      }
                    >
                      {lead.crmStatus}
                    </span>
                    <div className="mt-1">
                      <ActionButton
                        action={retryLeadAction}
                        name="leadId"
                        value={lead.id}
                        label="Retry"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className={td} colSpan={6}>
                    No leads match these filters yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav className="mt-4 flex gap-3 text-[var(--text-sm)]">
          {page > 1 ? (
            <Link href={`/admin/leads?${query}&page=${page - 1}`} className="underline">
              Previous
            </Link>
          ) : null}
          <span className="text-[var(--fg-muted)]">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={`/admin/leads?${query}&page=${page + 1}`} className="underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

const select =
  'mt-1 block rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text-sm)] text-[var(--fg)]';
