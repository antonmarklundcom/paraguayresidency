import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/process';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency Process & Documents by Nationality',
    description:
      'The Paraguay residency process step by step, and how the document checklist changes for US, Canadian, UK, Australian and EU applicants.',
    path: PATH,
  });
}

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: '1. The call',
    body: 'We ask what you actually want out of this — reserve card, real move, land, a business — and quote your fixed fee before anything is filed.',
  },
  {
    title: '2. Your document checklist',
    body: 'Built for your nationality specifically, not a generic list. The apostille chain, accepted clearance offices and required translations differ enough by country that a US checklist and a UK checklist are not interchangeable.',
  },
  {
    title: '3. Legalisation',
    body: 'Apostilles and sworn translations, sequenced so nothing expires before its appointment. This is where delays happen when nobody manages the order — we manage it.',
  },
  {
    title: '4. Filing and appointments',
    body: 'We schedule the appointments in Asunción and file your application. You need to be present for these; you do not need to be present for anything else.',
  },
  {
    title: '5. Approval and the cédula',
    body: 'Once residency is approved, the cédula follows within a window we confirm rather than promise. You can hold the card in reserve from this point without further action from you.',
  },
];

const BY_NATIONALITY: { nationality: string; note: string }[] = [
  {
    nationality: 'United States',
    note: 'FBI background checks take longer to apostille than most first-timers expect — start this document first.',
  },
  {
    nationality: 'Canada',
    note: 'RCMP clearance and provincial vital-records offices vary in turnaround; we tell you which province-specific quirks apply to your case.',
  },
  {
    nationality: 'United Kingdom',
    note: 'ACRO police certificates and FCDO legalisation both have their own separate queues — we sequence them so neither one blocks the other.',
  },
  {
    nationality: 'Australia',
    note: 'State-level birth certificates and federal police checks come from different offices; postal timing to Asunción is the usual bottleneck.',
  },
  {
    nationality: 'EU countries',
    note: 'Apostille chains are generally faster inside the EU, but requirements vary enough by member state that we confirm yours specifically before you start.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'Process', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          What actually happens, and how it differs by passport
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          No step here is hidden until you have paid for it. This is the whole process, in order,
          plus the specific snag each nationality tends to hit.
        </p>

        <ol className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          {STEPS.map((step) => (
            <li key={step.title} className="border-l-2 border-[var(--accent)] pl-[var(--space-6)]">
              <Heading level={3}>{step.title}</Heading>
              <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--space-16)]">
          <Heading level={2}>By nationality</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            The steps above are the same for everyone; the documents and their timing are not.
          </p>
          <div className="mt-[var(--space-6)] overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-[var(--text-sm)]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                  <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Nationality</th>
                  <th className="py-[var(--space-3)] font-normal">What to watch for</th>
                </tr>
              </thead>
              <tbody>
                {BY_NATIONALITY.map((row) => (
                  <tr key={row.nationality} className="border-b border-[var(--border)]">
                    <td className="py-[var(--space-4)] pr-[var(--space-4)] whitespace-nowrap font-medium">
                      {row.nationality}
                    </td>
                    <td className="py-[var(--space-4)] text-[var(--fg-muted)]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          Temporary residency runs <Fact k="temporary.duration" site="frontier" />, and the cédula
          is <Fact k="cedula.timeline" site="frontier" />. Ready to see your real checklist?{' '}
          <a href="/contact" className="text-[var(--accent)] underline underline-offset-2">
            Tell us your nationality
          </a>{' '}
          or take the{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Route Finder
          </a>{' '}
          first.
        </p>
      </Container>
    </Section>
  );
}
