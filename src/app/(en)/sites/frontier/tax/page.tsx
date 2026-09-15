import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, FAQ, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/tax';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Territorial Tax for Residents — What It Covers',
    description:
      'Paraguay taxes territorially. What that means for foreign-source income, what a RUC is for, and what stays your accountant\'s call.',
    path: PATH,
  });
}

const FAQ_ITEMS = [
  {
    question: 'Is Paraguay tax-free?',
    answer:
      'No. Paraguay runs a territorial system, which is a different and narrower claim — see the explanation above. We never call it tax-free, and you should be skeptical of anyone who does.',
  },
  {
    question: 'Does residency here end my tax obligations at home?',
    answer:
      'Not automatically, and not because of anything Paraguay does. Whether and how your home country continues to tax you depends entirely on its own rules — exit tax regimes, day-count tests, centre-of-life tests all vary by country. That is a question for an accountant in your own jurisdiction, not for this page.',
  },
  {
    question: 'Do I need a RUC if I am not running a business here?',
    answer:
      'Often yes — banking and some contracts ask for one regardless. We register it alongside your residency filing so it is one trip, not two.',
  },
  {
    question: 'What income actually gets taxed here?',
    answer:
      'Income sourced in Paraguay. What counts as "sourced here" for your specific income streams is exactly the kind of question we answer on a call rather than in generic terms on a web page.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'Tax', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Territorial tax, RUC, and what neither one promises
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          The single most oversold part of moving to Paraguay online. Here is what the system
          actually does.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>What territorial tax means</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Paraguay applies <Fact k="tax.territorial_rate" site="frontier" />. Under this
              system, <Fact k="tax.foreign_income_treatment" site="frontier" />. That is a real,
              useful feature if your income comes from outside the country — remote work, foreign
              investments, a pension. It is not the same thing as having no tax obligations
              anywhere, and it says nothing at all about what your own country still expects from
              you.
            </p>
          </div>
          <div>
            <Heading level={2}>Why we will not say &ldquo;tax-free&rdquo;</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Territoriality is a tax design choice, not an exemption. It changes which income
              Paraguay itself reaches; it does not touch your home country&apos;s rules on exit
              tax, residency tests or worldwide reporting. Anyone who tells you a residency card
              alone ends your tax obligations at home is skipping the part that actually matters —
              we would rather you hear that from us than find out later.
            </p>
          </div>
          <div>
            <Heading level={2}>The RUC</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              A RUC is Paraguay&apos;s tax identification number. Most residents end up needing one
              for banking or contracts even without running a local business, so we register it
              alongside your residency filing rather than leaving it for a second trip.
            </p>
          </div>
          <div>
            <Heading level={2}>Who this genuinely suits</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              People whose income is sourced outside Paraguay tend to see the clearest benefit
              from the territorial system. People running a business inside Paraguay have a more
              ordinary tax picture, and we say that upfront. Either way, what it means for your
              own country&apos;s rules is a conversation with your own accountant — we tell you
              what Paraguay does, and stop there.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)]">
          <FAQ title="Frequently asked" items={FAQ_ITEMS} />
        </div>

        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-8)]">
          <Heading level={2}>Ask about your specific case</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Tell us where your income comes from and what you are trying to achieve. We tell you
            what Paraguay&apos;s side of the picture looks like, plainly.
          </p>
          <div className="mt-[var(--space-8)]">
            <LeadForm site="frontier" variant="consultation" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
