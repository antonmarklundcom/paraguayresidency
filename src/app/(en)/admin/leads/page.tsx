import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { retryLeadAction, runDeliveryQueueAction } from '../actions';
import { ActionButton, panel, table, td, th } from '../ui';
import { ALL_LEAD_KINDS } from '@/lib/lead-schema';
import { listLeads, parseLeadFilters } from '@/lib/admin-queries';
import { effectiveLeadKind } from '@/lib/leads';
import { crmStatusLabel } from '@/lib/crm-status';
import { deliveriesForLeads, deliveryHealth, recentDeliveryFailures } from '@/lib/lead-delivery';
import { SITE_KEYS } from '@/sites/registry';
import type { SearchParams } from '@/lib/conversion-pages';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Leads', robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const params = await searchParams;
  const filters = parseLeadFilters(params);
  const { rows, total, page, pages, unavailable } = await listLeads(filters);
  const [deliveries, health, failures] = unavailable
    ? [new Map<number, Record<string, string>>(), null, []]
    : await Promise.all([deliveriesForLeads(rows.map((row) => row.id)), deliveryHealth(), recentDeliveryFailures(10)]);

  const query = new URLSearchParams(
    Object.entries(filters)
      .filter(([key, value]) => key !== 'page' && value)
      .map(([key, value]) => [key, String(value)]),
  );

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-[family-name:var(--display-font)] text-(length:--text-2xl)">Leads</h1>
        <span className="text-(length:--text-sm) text-[var(--fg-muted)]">{total} matching</span>
        <a
          href={`/admin/leads/export?${query.toString()}`}
          className="ml-auto text-(length:--text-sm) underline underline-offset-4"
        >
          Download CSV
        </a>
      </div>

      {health ? (
        <section className={`${panel} mt-4 p-4 text-(length:--text-sm)`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <strong>Delivery queue</strong>
            <span>
              last success: {health.lastSuccessAt ? health.lastSuccessAt.slice(0, 16).replace('T', ' ') : 'never'}
            </span>
            <span className={health.failed24h ? 'text-[var(--danger)]' : ''}>failed 24 h: {health.failed24h}</span>
            <span className={health.dead ? 'text-[var(--danger)]' : ''}>gave up: {health.dead}</span>
            <span className={health.backlog ? 'text-[var(--danger)]' : ''}>
              oldest undelivered:{' '}
              {health.oldestUndeliveredAt ? health.oldestUndeliveredAt.slice(0, 16).replace('T', ' ') : 'none'}
            </span>
            {health.queue === 'legacy' ? (
              <span className="text-[var(--fg-muted)]">
                (migration 0002 not applied: CRM status only — see docs/db-work-later.md)
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <ActionButton action={runDeliveryQueueAction} name="includeSkipped" value="0" label="Run queue now" />
            <ActionButton
              action={runDeliveryQueueAction}
              name="includeSkipped"
              value="1"
              label="Run queue incl. skipped (after setting CRM/mail keys)"
            />
          </div>
          {failures.length ? (
            <ul className="mt-3 space-y-1 text-(length:--text-xs) text-[var(--fg-muted)]">
              {failures.map((failure) => (
                <li key={`${failure.leadId}-${failure.channel}`}>
                  lead {failure.leadId} · {failure.channel} · {failure.status} after {failure.attempts} attempt(s)
                  {failure.nextAttemptAt ? ` · next ${failure.nextAttemptAt.toISOString().slice(0, 16).replace('T', ' ')}` : ''}
                  {failure.lastError ? ` · ${failure.lastError}` : ''}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <form method="get" className={`${panel} mt-4 flex flex-wrap items-end gap-3 p-4`}>
        <label className="text-(length:--text-xs) text-[var(--fg-muted)]">
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
        <label className="text-(length:--text-xs) text-[var(--fg-muted)]">
          Kind
          <select name="kind" defaultValue={filters.kind ?? ''} className={select}>
            <option value="">All</option>
            {ALL_LEAD_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="text-(length:--text-xs) text-[var(--fg-muted)]">
          From
          <input type="date" name="from" defaultValue={filters.from ?? ''} className={select} />
        </label>
        <label className="text-(length:--text-xs) text-[var(--fg-muted)]">
          To
          <input type="date" name="to" defaultValue={filters.to ?? ''} className={select} />
        </label>
        <button
          type="submit"
          className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2 text-(length:--text-xs) font-medium text-[var(--accent-fg)]"
        >
          Filter
        </button>
      </form>

      {unavailable ? (
        <p className={`${panel} mt-6 p-4 text-(length:--text-sm) text-[var(--fg-muted)]`}>
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
                    <span className="text-[var(--fg-muted)]">{effectiveLeadKind(lead)}</span>
                  </td>
                  <td className={td}>
                    {lead.name ?? '—'}
                    <br />
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="underline underline-offset-2">
                        {lead.email}
                      </a>
                    ) : null}
                    {lead.whatsapp ? <div>WhatsApp {lead.whatsapp}</div> : null}
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
                      {crmStatusLabel(lead.crmStatus, lead.crmResponse)}
                    </span>
                    {deliveries.get(lead.id) ? (
                      <div className="mt-1 text-(length:--text-xs) text-[var(--fg-muted)]">
                        {Object.entries(deliveries.get(lead.id)!)
                          .map(([channel, status]) => `${channel}: ${status}`)
                          .join(' · ')}
                      </div>
                    ) : null}
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
        <nav className="mt-4 flex gap-3 text-(length:--text-sm)">
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
  'mt-1 block rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-(length:--text-sm) text-[var(--fg)]';
