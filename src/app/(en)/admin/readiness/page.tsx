import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { panel, table, td, th } from '../ui';
import { PROOF } from '@content/shared/proof';
import { facts } from '@content/shared/facts';
import { dbFeatures } from '@/lib/db-features';
import { deliveryHealth } from '@/lib/lead-delivery';
import { processStartedAt, recentErrorCount } from '@/lib/log';
import { checkHost, envChecks, factCounts, proofGaps, type Check, type CheckStatus } from '@/lib/readiness';
import { SITE_KEYS, sites } from '@/sites/registry';
import { pingDatabase } from '@/db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Launch readiness', robots: { index: false, follow: false } };

/**
 * Everything that has to be true before traffic is sent (O24, item 4), on one
 * read-only page: credentials present (never their values), database and
 * migrations, lead delivery, trust content still empty, unverified facts,
 * every domain answering as its own brand, and errors logged since the last
 * restart.
 */
export default async function Page() {
  await requireAdminPage();

  const env = envChecks(process.env, SITE_KEYS);
  const [db, features, delivery, hosts] = await Promise.all([
    pingDatabase(),
    dbFeatures(),
    deliveryHealth(),
    Promise.all(SITE_KEYS.map((key) => checkHost(key, sites[key].canonicalHost))),
  ]);
  const gaps = proofGaps(PROOF);
  const factStats = factCounts(Object.values(facts));
  const errors24h = recentErrorCount();
  const errors1h = recentErrorCount(3_600_000);

  const migrations: Check[] = [
    {
      key: '0002',
      label: 'Migration 0002 (lead queue, WhatsApp kind, click events)',
      status: db !== 'ok' ? 'missing' : features.leadDeliveries && features.siteEvents && features.whatsappKind ? 'ok' : 'warn',
      note:
        db !== 'ok'
          ? 'Database unreachable.'
          : 'Not applied yet: the app runs in its pre-migration mode. See docs/db-work-later.md.',
    },
  ];
  if (features.leadDeliveries && features.siteEvents && features.whatsappKind && db === 'ok') migrations[0].note = '';

  const deliveryRows: Check[] = [
    {
      key: 'last-success',
      label: 'Last successful delivery',
      status: delivery.lastSuccessAt ? 'ok' : 'warn',
      note: delivery.lastSuccessAt
        ? `${delivery.lastSuccessAt.slice(0, 16).replace('T', ' ')} UTC`
        : 'Never — send a test lead through a form.',
    },
    {
      key: 'backlog',
      label: 'Undelivered for over an hour',
      status: delivery.backlog ? 'missing' : 'ok',
      note: delivery.backlog ? `Oldest waiting since ${delivery.oldestUndeliveredAt}. See /admin/leads.` : '',
    },
    {
      key: 'failed',
      label: 'Failed in 24 h / gave up',
      status: delivery.failed24h || delivery.dead ? 'warn' : 'ok',
      note: `${delivery.failed24h} / ${delivery.dead}${delivery.queue === 'legacy' ? ' (CRM only, pre-migration)' : ''}`,
    },
  ];

  const blocking = [...env, ...migrations].filter((c) => c.status === 'missing').length + hosts.filter((h) => h.status !== 'ok').length;

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-[family-name:var(--display-font)] text-(length:--text-2xl)">Launch readiness</h1>
        <span className={`text-(length:--text-sm) ${blocking ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
          {blocking ? `${blocking} thing(s) to fix before sending traffic` : 'Nothing blocking'}
        </span>
      </div>

      <Section title="Credentials and settings (values are never shown)">
        <CheckTable rows={env} />
      </Section>

      <Section title="Database">
        <CheckTable
          rows={[
            { key: 'db', label: 'Database reachable', status: db === 'ok' ? 'ok' : 'missing', note: db === 'ok' ? '' : 'SELECT 1 failed or DATABASE_URL unset.' },
            ...migrations,
          ]}
        />
      </Section>

      <Section title="Lead delivery">
        <CheckTable rows={deliveryRows} />
      </Section>

      <Section title="Errors logged by this server process">
        <CheckTable
          rows={[
            {
              key: 'errors',
              label: 'Errors in the last hour / 24 hours',
              status: errors1h ? 'missing' : errors24h ? 'warn' : 'ok',
              note: `${errors1h} / ${errors24h} since the process started ${processStartedAt().toISOString().slice(0, 16).replace('T', ' ')} UTC (a restart or redeploy resets the count; the lines themselves are in the process log${process.env.LOG_SINK_URL ? ' and the log sink' : ''}).`,
            },
          ]}
        />
      </Section>

      <Section title="Domains (DNS, HTTPS and hPanel attachment, via each host's /api/health)">
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Brand</th>
              <th className={th}>Host</th>
              <th className={th}>Status</th>
              <th className={th}>Note</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((row) => (
              <tr key={row.site}>
                <td className={td}>{row.site}</td>
                <td className={td}>{row.host}</td>
                <td className={td}>
                  <Badge status={row.status === 'ok' ? 'ok' : row.status === 'degraded' ? 'warn' : 'missing'} text={row.status} />
                </td>
                <td className={td}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={`Trust content still empty (content/shared/proof.ts) — ${gaps.length}`}>
        {gaps.length ? <CheckTable rows={gaps} /> : <p className="p-3 text-(length:--text-sm)">Every field is filled.</p>}
      </Section>

      <Section title="Facts">
        <p className="p-3 text-(length:--text-sm)">
          {factStats.total} facts: {factStats.verified} verified by you, {factStats.sourced} published from a cited source
          awaiting your sign-off, {factStats.hedged} hedged (no figure shown). Sign-off list: docs/verify-later.md and
          /admin/facts.
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${panel} mt-6 overflow-x-auto`}>
      <h2 className="px-3 pt-3 text-(length:--text-sm) font-medium">{title}</h2>
      {children}
    </section>
  );
}

const COLORS: Record<CheckStatus, string> = {
  ok: 'text-[var(--success)]',
  missing: 'text-[var(--danger)]',
  warn: 'text-[var(--fg)]',
  info: 'text-[var(--fg-muted)]',
};

function Badge({ status, text }: { status: CheckStatus; text?: string }) {
  return <span className={`font-medium ${COLORS[status]}`}>{text ?? status}</span>;
}

function CheckTable({ rows }: { rows: Check[] }) {
  return (
    <table className={table}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td className={`${td} w-[18rem]`}>{row.label}</td>
            <td className={`${td} w-[6rem]`}>
              <Badge status={row.status} />
            </td>
            <td className={td}>{row.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
