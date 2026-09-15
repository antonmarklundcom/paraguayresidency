import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'About Paraguay Residency — Who Files Your Case',
    description:
      'A team based in Asunción, filing Paraguay residency, cédula and tax residency every week. Who we are and how we work.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residency" items={[{ label: 'About', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          A team in Asunción, doing this every week
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Paraguay residency is not complicated in principle. It is complicated in the details —
          which apostille chain a specific country needs, which document expires before which
          appointment, what a bank actually wants to see before it opens an account. We handle the
          details because we handle them constantly, not because they are secret.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>How we work</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              One fixed fee per route, quoted before you commit. A document checklist built for
              your nationality, not a generic PDF. And when the standard route is wrong for your
              case, we tell you that on the first call — and point you to the Investor Pass, or to
              waiting, rather than filing something that will not serve you.
            </p>
          </div>
          <div>
            <Heading level={2}>What we do not do</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              We do not quote figures we cannot stand behind — every legal or financial number on
              this site is either confirmed or clearly marked as an estimate we will confirm on
              your call. We do not advise on your home country&apos;s own tax rules; that is a
              question for your own accountant, and we say so rather than guessing.
            </p>
          </div>
          <div>
            <Heading level={2}>The rest of what we run</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              This site handles the done-for-you residency services. The{' '}
              <a href="/investor-pass" className="text-[var(--accent)] underline underline-offset-2">
                Investor Pass
              </a>{' '}
              is our dedicated brand for direct permanent residency by investment, and the{' '}
              <a href="/guide" className="text-[var(--accent)] underline underline-offset-2">
                residency guide
              </a>{' '}
              is a written-down, kept-current reference if you would rather read the whole process
              yourself first.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/book">Book a call</Button>
          <Button href="/route-finder" variant="secondary">
            Find your route
          </Button>
        </div>
      </Container>
    </Section>
  );
}
