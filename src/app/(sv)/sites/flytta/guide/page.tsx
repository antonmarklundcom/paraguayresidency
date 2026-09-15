import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const SITE = 'flytta' as const;
const PATH = '/guide';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Inte redo att boka än? Läs Paraguay Residency Guide först',
    description:
      'Vill du förstå hela processen själv innan du bokar oss? Paraguay Residency Guide går igenom varje steg, kostnad och misstag på engelska.',
    path: PATH,
  });
}

/**
 * Guide upsell allowed on this brand only among the four consolidated
 * spokes (plan §11.8 — "Swedes read English"). Bridges to
 * paraguayresidencyguide.com through `siteOrigin`, never a typed domain
 * (plan §6.8 quality bar).
 */
export default function Page() {
  const guideOrigin = siteOrigin('guide');
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site={SITE} items={[{ label: 'Guide', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Inte redo att boka ännu? Läs på själv först.
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Allt på den här sajten beskriver vår historia och vad vägen kräver. Vill du hellre läsa
          hela processen i detalj innan du pratar med någon — vägarna, dokumenten, de verkliga
          kostnaderna, misstagen folk gör — finns den samlad i Paraguay Residency Guide (på
          engelska).
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href={guideOrigin} external>
            Läs Paraguay Residency Guide
          </Button>
          <Button href="/route-finder" variant="secondary">
            Eller hitta din väg direkt
          </Button>
        </div>
      </Container>
    </Section>
  );
}
