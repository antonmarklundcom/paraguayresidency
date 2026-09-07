import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/refunds';

export function generateMetadata(): Metadata {
  return siteMetadata('guide', {
    title: 'Refund Policy — Paraguay Investor Guide',
    description: '14 days, no questions. How to ask for a refund and what happens next.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Refund Policy</Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          14 days, no questions.
        </p>
        <Prose className="mt-[var(--space-8)]">
          <p>
            If the guide is not useful to you, email us within 14 days of your purchase and we
            refund it in full. You do not need to explain why, and you do not need to prove
            anything — a purchase you regret is reason enough.
          </p>
          <h2>How to ask</h2>
          <p>
            Use the <a href="/contact">contact page</a> with the email address you paid with. We
            process refunds within a few business days, back to the original payment method.
          </p>
          <h2>After 14 days</h2>
          <p>
            Past the 14-day window we generally do not refund, since by then you have had the
            guide (and its updates) for two weeks. If something specific went wrong — a broken
            download, a duplicate charge — tell us anyway; those are fixed regardless of the
            window.
          </p>
          <h2>The updates you keep</h2>
          <p>
            If you keep the guide, your 12 months of free updates run from the original purchase
            date, refund window or not.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
