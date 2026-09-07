import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'About Paraguay Investor Pass — Who Files Your Case',
    description:
      'The same Asunción team behind paraguayresidency.com, running a dedicated brand for direct permanent residency by investment.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="investorpass" items={[{ label: 'About', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          One team, a dedicated brand for a different kind of case
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Paraguay Investor Pass is run by the same team that files standard residency, cédula and
          tax cases every week in Asunción — on{' '}
          <a
            href={siteOrigin('residency')}
            rel="noopener"
            className="text-[var(--accent)] underline underline-offset-2"
          >
            paraguayresidency.com
          </a>
          . We separated the brand because investors, family offices and migration agents ask
          different questions and need a different depth of detail than someone filing for
          temporary residency for the first time.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>How we work</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              We structure the investment, file the application, and stay with you until the
              permanent card is in your hand. Nothing is filed until you have seen the full cost,
              timeline and exit options in writing.
            </p>
          </div>
          <div>
            <Heading level={2}>Why the numbers are hedged</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              The Investor Pass is a new program, and public sources genuinely disagree on the
              minimum investment and other thresholds. Rather than pick one figure and hope it is
              right, we confirm the current numbers against the resolution text on your call — every
              figure on this site is marked as such until it is.
            </p>
          </div>
          <div>
            <Heading level={2}>The rest of what we run</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              The done-for-you standard residency services live on{' '}
              <a
                href={siteOrigin('residency')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayresidency.com
              </a>
              , and a written-down, kept-current reference guide is at{' '}
              <a
                href={siteOrigin('guide')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayinvestorguide.com
              </a>{' '}
              if you would rather read the whole process yourself first.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/contact">See if you qualify</Button>
          <Button href="/investor-pass/investment-routes" variant="secondary">
            Investment routes
          </Button>
        </div>
      </Container>
    </Section>
  );
}
