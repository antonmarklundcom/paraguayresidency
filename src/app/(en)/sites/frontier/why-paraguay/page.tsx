import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/why-paraguay';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Why Paraguay — the Plan-B Argument, With the Catches Stated',
    description:
      'Cost, land, territorial tax and stability — the honest case for Paraguay as a plan B, including what it is not good for.',
    path: PATH,
  });
}

interface Point {
  title: string;
  body: ReactNode;
  counter: string;
}

const POINTS: Point[] = [
  {
    title: 'Cost',
    body: 'The residency filing itself is inexpensive relative to most alternatives, and day-to-day living costs in Asunción and the interior are low by North American or European standards — housing, food and staff all cost a fraction of what they do at home.',
    counter:
      'Low cost tracks lower average infrastructure quality outside the capital. This is not a place where "cheap" means "as good, but less expensive" — it means genuinely different, and worth seeing before you commit to anything beyond the residency card.',
  },
  {
    title: 'Land',
    body: 'Foreigners can buy land and property here with none of the restrictions some neighbouring countries impose, and agricultural land is genuinely inexpensive by international standards.',
    counter:
      'Land title and boundary records outside major cities are not always as clean as buyers expect. A qualified local lawyer doing real due diligence before any purchase is not optional — we can point you to one, but we do not sell land and we do not pretend the process is risk-free.',
  },
  {
    title: 'Territorial tax',
    body: (
      <>
        Paraguay applies <Fact k="tax.territorial_rate" site="frontier" />, and{' '}
        <Fact k="tax.foreign_income_treatment" site="frontier" />.
      </>
    ),
    counter:
      'Territoriality is not exemption, and it says nothing about your home country\'s own tax obligations to you. We never call this "tax-free," and neither should anyone advising you.',
  },
  {
    title: 'Stability',
    body: 'Paraguay has had a stable currency and a functioning democratic government for decades — an underrated quality in a region where several neighbours have had currency or political shocks in living memory.',
    counter:
      'Stable does not mean identical to home. Bureaucratic processes can be slower than you expect, and the rule of law, while real, does not always move at the speed a first-time visitor assumes. We manage the paperwork side; we do not oversell the rest.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'Why Paraguay', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          The case for Paraguay as a plan B — and the catch on each point
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          You have seen the pitch. Here is the same argument, with the part usually left out.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-10)]">
          {POINTS.map((point) => (
            <div key={point.title} className="border-l-2 border-[var(--accent)] pl-[var(--space-6)]">
              <Heading level={2}>{point.title}</Heading>
              <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{point.body}</p>
              <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--fg-muted)]">
                <strong className="text-[var(--fg)]">The catch: </strong>
                {point.counter}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          None of this is a reason to skip Paraguay — it is a reason to go in with accurate
          expectations. See{' '}
          <a href="/routes" className="text-[var(--accent)] underline underline-offset-2">
            the three routes
          </a>{' '}
          or take the{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Route Finder
          </a>{' '}
          to see where you fit.
        </p>
      </Container>
    </Section>
  );
}
