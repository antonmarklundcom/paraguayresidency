import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/guide';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
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
        <Breadcrumbs site="frontier" items={[{ label: 'Guide', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Not ready to commit? Read it yourself first.
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Everything on this site describes the done-for-you service, for people who already know
          they want a Paraguay residency in reserve. If you are still weighing whether Paraguay is
          the right plan B at all — the routes, the real costs, the presence rules, the mistakes
          people make chasing a golden-visa headline — the Paraguay Residency Guide covers all of
          it in one evening&apos;s reading, kept current.
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href={guideOrigin} external>
            Read the residency guide
          </Button>
          <Button href="/contact" variant="secondary">
            Or just ask us
          </Button>
        </div>
        <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Guide readers who decide they want it handled are welcomed straight back here — its
          thank-you page links to this team directly.
        </p>
      </Container>
    </Section>
  );
}
