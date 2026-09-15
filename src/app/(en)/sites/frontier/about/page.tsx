import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'About Paraguay Frontier — Who Files Your Case',
    description:
      'The Asunción team behind paraguayresidency.co.uk, running a dedicated brand for plan-B residency for Americans, Canadians, Britons and Australians.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'About', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          One team, a dedicated brand for a plan-B case
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Paraguay Frontier is run by the same team that files standard residency, cédula and tax
          cases every week in Asunción — on{' '}
          <a
            href={siteOrigin('residency')}
            rel="noopener"
            className="text-[var(--accent)] underline underline-offset-2"
          >
            paraguayresidency.co.uk
          </a>
          . We separated this brand because Americans, Canadians, Britons and Australians weighing
          optionality — a residency and tax ID in reserve, not necessarily a full move — ask a
          different set of questions than someone already committed to relocating.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>How we work</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              A fixed fee per route, quoted before you commit, a document checklist built for your
              nationality, and filing handled in Asunción. You attend the appointments; the rest is
              ours.
            </p>
          </div>
          <div>
            <Heading level={2}>Why we state the catch</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              This niche has a hype problem — golden-visa blog posts that skip the presence rules,
              the bureaucracy, and the difference between territorial tax and no tax at all. We
              would rather be the site that says so than the one that oversells it, because a
              client who knows what to expect is easier to serve well.
            </p>
          </div>
          <div>
            <Heading level={2}>The rest of what we run</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Done-for-you standard residency services live on{' '}
              <a
                href={siteOrigin('residency')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayresidency.co.uk
              </a>
              , direct permanent residency by investment is on{' '}
              <a
                href={siteOrigin('investorpass')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayinvestorpass.com
              </a>
              , and a written-down, kept-current reference guide is at{' '}
              <a
                href={siteOrigin('guide')}
                rel="noopener"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                paraguayresidencyguide.com
              </a>{' '}
              if you would rather read the whole process yourself first.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/route-finder">Find your route</Button>
          <Button href="/why-paraguay" variant="secondary">
            Why Paraguay
          </Button>
        </div>
      </Container>
    </Section>
  );
}
