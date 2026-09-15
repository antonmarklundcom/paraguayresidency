import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/routes';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency Routes for a Plan B, Compared',
    description:
      'Temporary residency, permanent residency and the Investor Pass compared for people who may never live in Paraguay full-time.',
    path: PATH,
  });
}

export default function Page() {
  const residencyOrigin = siteOrigin('residency');
  const investorpassOrigin = siteOrigin('investorpass');

  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'Routes', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Three routes, for people who may never live here full-time
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          None of these require relocating. Each one asks something different of you — here is
          what, honestly.
        </p>

        <div id="temporary" className="mt-[var(--space-12)] scroll-mt-24">
          <Heading level={2}>Temporary residency</Heading>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            The standard first step for almost everyone. It runs{' '}
            <Fact k="temporary.duration" site="frontier" />, and the paperwork itself is filed in
            person in Asunción — a handful of appointments, not a permanent presence. The filing
            work and requirements are identical whether you plan to stay or hold the card in
            reserve.
          </p>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            The full filing is handled the same way it is for anyone else who works with our
            team — see{' '}
            <a
              href={`${residencyOrigin}/residency/temporary-residency`}
              rel="noopener"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              the service page on paraguayresidency.co.uk
            </a>{' '}
            for the document checklist and process.
          </p>
        </div>

        <div id="permanent" className="mt-[var(--space-12)] scroll-mt-24">
          <Heading level={2}>Permanent residency</Heading>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            Filed after temporary residency, or in some cases directly. This is the one where the
            presence rule actually matters for a plan-B case: it carries{' '}
            <Fact k="permanent.presence_rule" site="frontier" />. Read that carefully before you
            assume a card you never use stays valid on its own — we walk through what it means for
            your specific travel pattern before you file.
          </p>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            See{' '}
            <a
              href={`${residencyOrigin}/residency/permanent-residency`}
              rel="noopener"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              the permanent residency service page
            </a>{' '}
            for what follows temporary status, including the cédula (
            <Fact k="cedula.timeline" site="frontier" />
            ).
          </p>
        </div>

        <div id="investor-pass" className="mt-[var(--space-12)] scroll-mt-24">
          <Heading level={2}>Investor Pass</Heading>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            A separate brand, same team, for people bringing qualifying capital into the country.
            It skips the temporary stage entirely and files directly for permanent residency. It
            is not for everyone — most plan-B cases do better on the standard route above and keep
            their capital doing something else — but if you already have the capital allocated,
            it is worth a look.
          </p>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            <a
              href={investorpassOrigin}
              rel="noopener"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              See the Investor Pass on paraguayinvestorpass.com
            </a>{' '}
            for the qualifying routes and current thresholds.
          </p>
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          Not sure which of these fits? The{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Route Finder
          </a>{' '}
          asks about your timeline and goal directly, or{' '}
          <a href="/contact" className="text-[var(--accent)] underline underline-offset-2">
            tell us your case
          </a>{' '}
          and we will point you at the right one.
        </p>
      </Container>
    </Section>
  );
}
