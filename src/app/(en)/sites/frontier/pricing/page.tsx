import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/pricing';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency Pricing for a Plan B — Fixed Fees',
    description:
      'What a plan-B Paraguay residency costs. Fixed fees, quoted before you commit — real figures confirmed on your call until published here.',
    path: PATH,
  });
}

interface Row {
  service: string;
  href: string;
  note: string;
}

/**
 * Anton has not supplied real packages/prices yet (plan §7, mirrored from
 * residency's own /pricing). Every row renders as "from" with a TODO note
 * rather than an invented number (plan §4.11).
 */
const ROWS: Row[] = [
  {
    service: 'Temporary residency',
    href: '/routes#temporary',
    note: 'Document checklist, filing and appointments in Asunción — held in reserve or used fully, same filing.',
  },
  {
    service: 'Permanent residency',
    href: '/routes#permanent',
    note: 'After temporary status, with the presence rules explained for a plan-B travel pattern.',
  },
  {
    service: 'Territorial tax setup (RUC)',
    href: '/tax',
    note: 'RUC registration alongside your residency filing.',
  },
  {
    service: 'Family filing (per additional person)',
    href: '/routes',
    note: 'Spouse, children and qualifying dependents alongside the primary applicant.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'Pricing', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          One fixed fee per route, quoted before you commit
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          We do not publish one universal number because your nationality changes what has to be
          prepared, and we would rather quote your real fee than a figure that turns out wrong for
          your case. What follows is every route we file, with the real fee confirmed on your
          call.
        </p>

        <div className="mt-[var(--space-12)] overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Service</th>
                <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Fee</th>
                <th className="py-[var(--space-3)] font-normal">What it covers</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.service} className="border-b border-[var(--border)]">
                  <td className="py-[var(--space-4)] pr-[var(--space-4)]">
                    <a href={row.href} className="text-[var(--accent)] underline underline-offset-2">
                      {row.service}
                    </a>
                  </td>
                  <td className="py-[var(--space-4)] pr-[var(--space-4)] whitespace-nowrap">
                    from <span title="TODO: real figure pending — plan §7">USD —</span>
                  </td>
                  <td className="py-[var(--space-4)] text-[var(--fg-muted)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Filing on a qualifying investment instead? The Investor Pass has its own fee structure —
          see <a href="/routes#investor-pass" className="text-[var(--accent)] underline underline-offset-2">the Investor Pass route</a>.
        </p>

        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Get your real fee</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Tell us your nationality, route and timeline. We quote the fixed fee for your case
            before you commit to anything.
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
            <Button href="/route-finder" variant="secondary">
              Find your route first
            </Button>
          </div>
          <div className="mt-[var(--space-8)]">
            <LeadForm site="frontier" variant="consultation" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
