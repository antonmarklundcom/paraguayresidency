import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/guide';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Not Ready to File Yet? Read the Paraguay Residency Guide',
    description:
      'Not ready for a done-for-you filing yet? Read the complete Paraguay residency guide first — every step, cost and mistake, written down once.',
    path: PATH,
  });
}

export default function Page() {
  const guideOrigin = siteOrigin('guide');
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residency" items={[{ label: 'Guide', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Not ready for us to file it yet? Read it yourself first.
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Everything on this site describes the done-for-you service. If you would rather
          understand the whole process before booking anyone — the routes, the documents, the real
          costs, the mistakes people make — we wrote it down once, in one evening&apos;s worth of
          reading, and keep it current.
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href={guideOrigin} external>
            Read the residency guide
          </Button>
          <Button href="/book" variant="secondary">
            Or just book a call
          </Button>
        </div>
        <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Buyers of the guide who decide they would rather have it handled are welcomed straight
          back here — the guide&apos;s thank-you page links to this team directly.
        </p>
      </Container>
    </Section>
  );
}
