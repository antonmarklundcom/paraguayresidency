import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/investor-pass';

/**
 * A short bridge page (plan §6.1): the Investor Pass brand is canonical for
 * this content, so this page stays deliberately thin and noindex to avoid
 * competing with paraguayinvestorpass.com in search.
 */
export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Investor Pass — Direct Permanent Residency by Investment',
    description:
      'Skip temporary residency with a qualifying investment. The Investor Pass is our dedicated brand for direct permanent residency — same team.',
    path: PATH,
    noindex: true,
  });
}

export default function Page() {
  const investorpassOrigin = siteOrigin('investorpass');
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residency" items={[{ label: 'Investor Pass', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Permanent residency in one step
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          The Investor Pass lets a qualifying investment skip temporary residency entirely and go
          straight to the permanent card — <Fact k="investorpass.min_investment_usd" site="residency" />
          , across four routes, filed by the same team that handles everything on this site.
        </p>
        <p className="mt-[var(--space-6)] text-[var(--fg-muted)]">
          Because it targets a different kind of applicant — investors, family offices, migration
          agents — it lives on its own dedicated brand with its own detail: qualifying routes,
          requirements, timeline and a straight answer on whether you qualify.
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href={investorpassOrigin} external variant="primary">
            Visit the Investor Pass site
          </Button>
          <Button href="/residency/permanent-residency" variant="secondary">
            See standard permanent residency
          </Button>
        </div>
        <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Not sure which route fits your capital and timeline?{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Take the Route Finder
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
