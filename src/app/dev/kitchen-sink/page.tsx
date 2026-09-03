import { notFound } from 'next/navigation';
import {
  Bento,
  Breadcrumbs,
  Button,
  Card,
  Container,
  EditorialHero,
  FAQ,
  Fact,
  Heading,
  Prose,
  Section,
  SplitHero,
} from '@/components';
import { SITE_KEYS, type SiteKey } from '@/sites/registry';
import { factKeys } from '@content/shared/facts';

export const dynamic = 'force-dynamic';

/** Dev-only. Middleware 404s /dev/* when NODE_ENV === 'production'. */
export default function KitchenSink() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div>
      {SITE_KEYS.map((site) => (
        <ThemeBlock key={site} site={site} />
      ))}
    </div>
  );
}

function ThemeBlock({ site }: { site: SiteKey }) {
  return (
    <div data-site={site} data-theme={site} className="border-b-4 border-black">
      <Section>
        <p className="text-[var(--text-xs)] tracking-[0.2em] uppercase">theme: {site}</p>
      </Section>
      <SplitHero
        eyebrow="SplitHero"
        title="Paraguay residency, handled end to end."
        sub="Sub-headline in the brand's body face, on the brand's background."
        actions={
          <>
            <Button href="/">Primary</Button>
            <Button href="/" variant="secondary">
              Secondary
            </Button>
            <Button href="/" variant="ghost">
              Ghost
            </Button>
          </>
        }
        aside={<p className="text-[var(--fg-muted)]">Aside slot</p>}
      />
      <EditorialHero
        eyebrow="EditorialHero"
        title="Permanent residency in Paraguay, in one step."
        sub="The centred, big-type variant."
        actions={<Button href="/">Primary</Button>}
      />
      <Section tone="alt">
        <Heading level={2}>Cards and bento</Heading>
        <div className="mt-[var(--space-8)]">
          <Bento>
            <Card eyebrow="Route" title="Temporary residency" href="/">
              The standard first step.
            </Card>
            <Card eyebrow="Route" title="Permanent residency" href="/">
              Presence rules apply.
            </Card>
            <Card eyebrow="Route" title="Investor Pass" href="/">
              Straight to permanent.
            </Card>
          </Bento>
        </div>
      </Section>
      <Section>
        <Container width="narrow">
          <Breadcrumbs site={site} items={[{ label: 'Guides', href: '/guides' }]} />
          <Prose className="mt-[var(--space-8)]">
            <h2>Prose</h2>
            <p>
              Body copy at the shared measure. Facts always render through the Fact component:
            </p>
            <ul>
              {factKeys.map((key) => (
                <li key={key}>
                  <strong>{key}</strong>: <Fact k={key} />
                </li>
              ))}
            </ul>
          </Prose>
          <div className="mt-[var(--space-12)]">
            <FAQ
              title="FAQ"
              items={[
                { question: 'Does this render JSON-LD?', answer: 'Yes, from the same items array.' },
                { question: 'Is this page public?', answer: 'No. Middleware 404s it in production.' },
              ]}
            />
          </div>
        </Container>
      </Section>
    </div>
  );
}
