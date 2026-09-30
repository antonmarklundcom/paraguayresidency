import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { panel, table, td, th } from '../ui';
import { attributionData } from '@/lib/admin-queries';
import { buildAttributionReport, MIN_LEADS_PER_VARIANT, type Bucket } from '@/lib/attribution-report';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Attribution', robots: { index: false, follow: false } };

/**
 * Where leads come from (O24, items 3 and 10): by brand, page, landing page,
 * first-touch source and kind, last 7 and 30 days; WhatsApp clicks by page and
 * source; and the A/B readout. Counts only — the leads list has the people.
 */
export default async function Page() {
  await requireAdminPage();
  const data = await attributionData();

  if (data.unavailable) {
    return (
      <>
        <h1 className="font-[family-name:var(--display-font)] text-(length:--text-2xl)">Attribution</h1>
        <p className={`${panel} mt-6 p-4 text-(length:--text-sm) text-[var(--fg-muted)]`}>
          DATABASE_URL is not set on this server, so there is nothing to report.
        </p>
      </>
    );
  }

  const report = buildAttributionReport(data.leads, data.clicks);

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-[family-name:var(--display-font)] text-(length:--text-2xl)">Attribution</h1>
        <span className="text-(length:--text-sm) text-[var(--fg-muted)]">
          {report.totals.last7} leads in 7 days · {report.totals.last30} in 30 days ·{' '}
          {data.clicksAvailable
            ? `${report.clicks.totals.last30} WhatsApp clicks in 30 days`
            : 'WhatsApp clicks not recorded yet (migration 0002 pending)'}
        </span>
        <a href="/admin/attribution/export" className="ml-auto text-(length:--text-sm) underline underline-offset-4">
          Download CSV (30 days)
        </a>
      </div>
      <p className="mt-2 max-w-[60rem] text-(length:--text-xs) text-[var(--fg-muted)]">
        Source is the first touch: the campaign (utm_source) or site that first sent the visitor, then last-touch
        utm, then the referrer&apos;s host, else (direct). Page is where the form was sent from; landing is the first
        page of the visit that earned the lead.
      </p>

      <section className="mt-6">
        <h2 className="text-(length:--text-lg) font-medium">A/B tests</h2>
        {report.experiments.map((experiment) => (
          <div key={experiment.id} className={`${panel} mt-3 p-4`}>
            <div className="flex flex-wrap items-baseline gap-3">
              <strong>{experiment.id}</strong>
              <span className="text-(length:--text-sm) text-[var(--fg-muted)]">
                {experiment.enoughData
                  ? experiment.ahead
                    ? `Most leads so far: ${experiment.ahead}. Counts only — no significance test is run.`
                    : 'Tied so far.'
                  : `Not enough data yet — needs ${MIN_LEADS_PER_VARIANT} leads per variant before comparing.`}
              </span>
            </div>
            <table className={`${table} mt-2`}>
              <thead>
                <tr>
                  <th className={th}>Variant (shown to the visitor)</th>
                  <th className={th}>Leads, 30 days</th>
                  <th className={th}>WhatsApp clicks, 30 days</th>
                </tr>
              </thead>
              <tbody>
                {experiment.variants.map((row) => (
                  <tr key={row.variant}>
                    <td className={td}>{row.variant}</td>
                    <td className={td}>{row.leads}</td>
                    <td className={td}>{row.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BucketTable title="Leads by brand" rows={report.bySite} />
        <BucketTable title="Leads by kind" rows={report.byKind} />
        <BucketTable title="Leads by source (first touch)" rows={report.bySource} />
        <BucketTable title="Leads by page (form)" rows={report.byPage} />
        <BucketTable title="Leads by landing page" rows={report.byLanding} />
        {data.clicksAvailable ? (
          <>
            <BucketTable title="WhatsApp clicks by page" rows={report.clicks.byPage} />
            <BucketTable title="WhatsApp clicks by source" rows={report.clicks.bySource} />
          </>
        ) : null}
      </div>
    </>
  );
}

function BucketTable({ title, rows }: { title: string; rows: Bucket[] }) {
  const shown = rows.slice(0, 25);
  return (
    <section className={`${panel} overflow-x-auto`}>
      <h2 className="px-3 pt-3 text-(length:--text-sm) font-medium">{title}</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>&nbsp;</th>
            <th className={th}>7 days</th>
            <th className={th}>30 days</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr key={row.key}>
              <td className={`${td} break-all`}>{row.key}</td>
              <td className={td}>{row.last7}</td>
              <td className={td}>{row.last30}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className={td} colSpan={3}>
                Nothing in the last 30 days.
              </td>
            </tr>
          ) : null}
          {rows.length > shown.length ? (
            <tr>
              <td className={`${td} text-[var(--fg-muted)]`} colSpan={3}>
                {rows.length - shown.length} more in the CSV.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
