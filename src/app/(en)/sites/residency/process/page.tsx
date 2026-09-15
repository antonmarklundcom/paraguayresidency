import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/process';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'The Paraguay Residency Process, Step by Step',
    description:
      'From first call to cédula in hand: the Paraguay residency process step by step, with the documents checklist and what happens at each stage.',
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
    body: 'We ask about your nationality, goal and timeline, tell you which route fits, and quote your fixed fee — before anything is filed.',
  },
  {
    title: '2. Your document checklist',
    body: 'Built for your specific nationality: which clearance offices are accepted, which apostille chain applies, which translations Paraguay’s immigration office actually recognises. We tell you which item to start first because it is the slowest.',
  },
  {
    title: '3. Legalisation',
    body: 'Apostilles and sworn translations, sequenced so nothing expires before its appointment. This is where most delays happen when nobody manages the order — we manage it.',
  },
  {
    title: '4. Filing and appointments',
    body: 'We schedule the appointments in Asunción and file your application. Where your family is involved, we schedule everyone together wherever the office allows it.',
  },
  {
    title: '5. Approval and the cédula',
    body: 'Once residency is approved, the cédula application follows. It is issued within a window we confirm rather than promise, and we keep you posted rather than leaving you checking a status page.',
  },
  {
    title: '6. What comes next',
    body: 'Temporary residency runs its term, after which most clients apply for permanent residency. Some, having seen the country, look at the Investor Pass instead. We stay with you either way.',
  },
];

const DOCUMENT_CHECKLIST = [
  'Birth certificate, apostilled',
  'Police clearance from your country of residence, apostilled',
  'Proof of means (varies by route — we confirm what qualifies for yours)',
  'Sworn translations of every foreign-language document',
  'Passport, valid for the duration of the process',
  'Marriage certificate and dependents’ documents, if filing as a family',
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residency" items={[{ label: 'Process', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          What actually happens, step by step
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          No step here is hidden until you have paid for it. This is the whole process, in the
          order it actually runs, for temporary residency, permanent residency and the cédula that
          follows.
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
          <Heading level={2}>The document checklist, at a glance</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            The generic version, for orientation. Your real checklist is built against your
            nationality — see{' '}
            <a href="/guides/documents/what-you-need-to-apply" className="text-[var(--accent)] underline underline-offset-2">
              what you need before you apply
            </a>
            .
          </p>
          <ul className="mt-[var(--space-6)] list-disc space-y-[var(--space-2)] pl-6 text-[var(--fg-muted)]">
            {DOCUMENT_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          Temporary residency runs for <Fact k="temporary.duration" site="residency" />, and the
          cédula is <Fact k="cedula.timeline" site="residency" />. Ready to start?{' '}
          <a href="/book" className="text-[var(--accent)] underline underline-offset-2">
            Book a call
          </a>{' '}
          or take the <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">Route Finder</a> first.
        </p>
      </Container>
    </Section>
  );
}
