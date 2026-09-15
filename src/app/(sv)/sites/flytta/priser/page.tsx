import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/priser';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Priser — uppehållstillstånd i Paraguay',
    description:
      'Vad en väg till uppehållstillstånd i Paraguay brukar kosta, uppdelat på hur mycket du gör själv — fast pris per väg, bekräftat innan du bestämmer dig.',
    path: PATH,
  });
}

interface Tier {
  name: string;
  tagline: string;
  includes: string[];
}

/**
 * Tier names and shape ported from `antonmarklundcom/flyttatillparaguay`'s
 * `content/packages.ts` (plan §12.4); the EUR figures there were the old
 * site's own TODO placeholders and are dropped rather than ported — a
 * "from" row with no invented number, exactly like `residency`'s
 * `/pricing` (plan §4.11, quality bar).
 */
const TIERS: Tier[] = [
  {
    name: 'Start',
    tagline: 'Du gör mycket själv — vi ser till att du gör rätt.',
    includes: [
      'Genomgångssamtal om din situation',
      'Skriftlig bedömning med tidslinje och total kostnad',
      'Dokumentlista i rätt ordning, anpassad efter svenska myndigheter',
      'Checklista för apostille och auktoriserad översättning',
    ],
  },
  {
    name: 'Komplett',
    tagline: 'Hela vägen till uppehållstillstånd, från första samtalet till cédulan.',
    includes: [
      'Allt i Start',
      'Lokal jurist och ombud i Asunción som företräder dig',
      'Bokade myndighetsbesök under din vecka här, i rätt ordning',
      'Hjälp med bankkonto och RUC',
    ],
  },
  {
    name: 'Familj',
    tagline: 'Samma sak, för hela hushållet, samordnat till en resa.',
    includes: [
      'Allt i Komplett för två vuxna',
      'Barn under 18 inkluderade i ansökan',
      'Extra familjehandlingar: vigselbevis, födelsebevis, samtycken',
      'Alla ansökningar samordnade till samma vecka på plats',
    ],
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site={SITE} items={[{ label: 'Priser', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Ett fast pris per väg, bekräftat innan du bestämmer dig
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Vi publicerar inte en enda universalsiffra eftersom ditt medborgarskap och din situation
          ändrar vad som måste förberedas. Nivåerna nedan är riktmärken tills de är slutgiltigt
          satta — du får alltid en skriftlig offert innan något startar.
        </p>

        <div className="mt-[var(--space-12)] grid gap-[var(--space-6)] md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)]"
            >
              <Heading level={3}>{tier.name}</Heading>
              <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--fg-muted)]">
                {tier.tagline}
              </p>
              <p className="mt-[var(--space-4)] text-[var(--text-lg)] font-medium">
                från <span title="Pris fastställs av Anton, plan §7">SEK —</span>
              </p>
              <ul className="mt-[var(--space-4)] space-y-[var(--space-2)] text-[var(--text-sm)] text-[var(--fg-muted)]">
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--accent)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Alla nivåer utesluter myndighetsavgifter, apostiller och översättningar i Sverige samt
          resa och boende — se{' '}
          <a href="/kostnader" className="text-[var(--accent)] underline underline-offset-2">
            kostnader
          </a>{' '}
          för vad de brukar landa på.
        </p>

        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Få ditt riktiga pris</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Berätta medborgarskap, väg och tidsram. Vi bekräftar ditt fasta pris innan du bestämmer
            dig för något.
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
            <Button href="/route-finder" variant="secondary">
              Hitta din väg först
            </Button>
          </div>
          <div className="mt-[var(--space-8)]">
            <LeadForm site={SITE} variant="consultation" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
