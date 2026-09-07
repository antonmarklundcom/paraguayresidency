import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('guide', {
    title: 'About the Paraguay Investor Guide',
    description:
      'Written by the team that files Paraguay residency, cédula and tax cases every week in Asunción.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="guide" items={[{ label: 'About', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          The guide we wish existed before we did this ourselves
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          We run{' '}
          <a
            href={siteOrigin('residency')}
            rel="noopener"
            className="text-[var(--accent)] underline underline-offset-2"
          >
            paraguayresidency.com
          </a>
          , filing temporary residency, permanent residency and cédula cases every week in
          Asunción. Every client asks roughly the same questions in roughly the same order. This
          guide is those answers, written down once instead of repeated on every call.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>Why it costs money</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              A low price keeps it worth writing properly and worth updating for a year, rather
              than being a lead magnet nobody maintains. It also means we have no reason to
              exaggerate how easy the process is — you already paid.
            </p>
          </div>
          <div>
            <Heading level={2}>Why the numbers are hedged</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Every legal or financial figure in the guide follows the same rule as this site:
              nothing is published as a bare number until our legal partner has verified it.
              Where a figure is not yet verified, the guide says so and tells you how to confirm
              it, rather than guessing.
            </p>
          </div>
          <div>
            <Heading level={2}>If you would rather not DIY it</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              The guide is for people doing some or all of this themselves. If you would rather
              the team filed it for you, that is the done-for-you service on{' '}
              <a
                href={siteOrigin('residency')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayresidency.com
              </a>
              , or, for a qualifying investment,{' '}
              <a
                href={siteOrigin('investorpass')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayinvestorpass.com.py
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/#price">Get the guide</Button>
          <Button href="/blog" variant="secondary">
            Read the blog
          </Button>
        </div>
      </Container>
    </Section>
  );
}
