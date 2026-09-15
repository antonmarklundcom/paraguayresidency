import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  Container,
  Fact,
  FAQ,
  Heading,
  Section,
  SplitHero,
  StatRow,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { siteOrigin } from '@/sites/registry';
import { t } from '@/i18n';

const SITE = 'flytta' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'home.metaTitle'),
    description: t(SITE, 'home.metaDescription'),
    path: '/',
  });
}

function routes() {
  return [
    {
      eyebrow: 'Tillfälligt uppehållstillstånd',
      title: 'Det vanliga första steget',
      body: 'Gäller ett par år, sedan permanent.',
      href: '/uppehallstillstand',
    },
    {
      eyebrow: 'Permanent uppehållstillstånd',
      title: 'Långvarigt kort',
      body: 'Med ett närvarokrav — vi förklarar exakt vad det betyder.',
      href: '/uppehallstillstand',
    },
    {
      eyebrow: 'Investor Pass',
      title: 'Direkt till permanent',
      body: 'Med en kvalificerande investering. Eget varumärke, samma team.',
      href: siteOrigin('investorpass'),
    },
  ];
}

const STATS = [
  { value: '≈ 40 %', label: 'Lägre kostnadsläge', note: 'Vår egen budget, uppskattning 2026' },
  { value: '7 dagar', label: 'Ungefärlig tid på plats' },
  { value: '0', label: 'Krav på spanska' },
];

const FAQ_ITEMS = [
  {
    question: 'Måste jag bo i Paraguay för att behålla mitt uppehållstillstånd?',
    answer:
      'Nej, du behöver inte bo här på heltid, men du kan inte försvinna helt heller. Myndigheten vill se verklig anknytning — att du kommer hit och använder din cédula. Exakta krav skiljer sig mellan tillfälligt och permanent uppehållstillstånd, och vi går igenom din plan innan du bestämmer dig.',
  },
  {
    question: 'Betyder det att jag slipper svensk skatt?',
    answer:
      'Nej, inte automatiskt. Det är väsentlig anknytning till Sverige som avgör, och den bedömningen görs av Skatteverket, inte av oss. Läs mer på vår sida om skatt, och stäm av med en skatterådgivare innan du planerar din ekonomi kring det.',
  },
  {
    question: 'Kan min familj följa med?',
    answer:
      'Ja. Partner och barn under 18 ansöker parallellt med dig och behöver egna dokument, apostillerade på samma sätt. Vi samordnar hela hushållets ärenden till samma resa där det går.',
  },
  {
    question: 'Vad kostar det, allt inräknat?',
    answer:
      'Vårt arvode ser du på prissidan. Utöver det tillkommer myndighetsavgifter, apostiller och översättningar i Sverige, samt resa och boende. Vi lägger aldrig påslag på tredjepartskostnader, och du får en total innan något startar.',
  },
];

export default function Page() {
  const whatsapp = whatsappHref('Hej! Jag har en fråga om att flytta till Paraguay.');
  const latestGuides = getPages(SITE)
    .filter((page) => page.hub === 'guider')
    .slice(0, 3);
  const cities = getPages(SITE)
    .filter((page) => page.hub === 'stader')
    .slice(0, 3);
  const ROUTES = routes();

  const actions = (
    <>
      <Button href="/route-finder">{t(SITE, 'home.ctaPrimary')}</Button>
      <Button href="/contact" variant="secondary">
        {t(SITE, 'home.ctaSecondary')}
      </Button>
    </>
  );

  return (
    <>
      <SplitHero
        eyebrow="Flytta till Paraguay"
        title={t(SITE, 'home.h1')}
        sub={t(SITE, 'home.sub')}
        actions={actions}
        aside={
          <ul className="space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>Hela vägen från Skatteverket till cédulan, steg för steg, utan skönmålning.</li>
            <li>Fast pris per väg, i kronor, innan du bestämmer dig.</li>
            <li>Ärligt om vad som tar tid, vad som kostar och när Paraguay inte är rätt val.</li>
          </ul>
        }
      />

      <Section>
        <Container width="narrow">
          <Heading level={2}>Vi bor här. Det är hela poängen.</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Vi flyttade hit utan att kunna svaret på hälften av det vi undrade. Allt vi lärde oss
            av det sitter nu i den här sajten och i checklistorna vårt team i Asunción använder
            med varje ny familj.
          </p>
          <Link
            href="/var-historia"
            className="mt-[var(--space-4)] inline-block text-[var(--accent)] underline underline-offset-2"
          >
            Läs vår historia
          </Link>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <Heading level={2}>Tre vägar, en process</Heading>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {ROUTES.map((route) => (
                <Card key={route.href} eyebrow={route.eyebrow} title={route.title} href={route.href}>
                  {route.body}
                </Card>
              ))}
            </Bento>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Heading level={2}>Fyra steg, i den ordning de faktiskt händer</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Samtal, dokument, veckan i Asunción, cédula — se hela{' '}
            <Link href="/process" className="text-[var(--accent)] underline underline-offset-2">
              processen steg för steg
            </Link>
            .
          </p>
          <div className="mt-[var(--space-8)]">
            <StatRow stats={STATS} />
          </div>
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>Vad det faktiskt kostar</Heading>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              Tillfälligt uppehållstillstånd gäller <Fact k="temporary.duration" site={SITE} />.
            </li>
            <li>
              Permanent uppehållstillstånd har <Fact k="permanent.presence_rule" site={SITE} />.
            </li>
            <li>
              <Fact k="tax.foreign_income_treatment" site={SITE} />.
            </li>
          </ul>
          <Link
            href="/kostnader"
            className="mt-[var(--space-4)] inline-block text-[var(--accent)] underline underline-offset-2"
          >
            Se vad det faktiskt kostar
          </Link>
        </Container>
      </Section>

      {latestGuides.length > 0 && (
        <Section>
          <Container>
            <Heading level={2}>Läs på innan du bestämmer dig</Heading>
            <div className="mt-[var(--space-8)]">
              <Bento>
                {latestGuides.map((page) => (
                  <Card
                    key={page.slugPath}
                    eyebrow="Guider"
                    title={page.frontmatter.title}
                    href={contentHref(SITE, page.slugPath)}
                  >
                    {page.frontmatter.description}
                  </Card>
                ))}
              </Bento>
            </div>
          </Container>
        </Section>
      )}

      {cities.length > 0 && (
        <Section tone="alt">
          <Container>
            <Heading level={2}>Var i Paraguay svenskar brukar landa</Heading>
            <div className="mt-[var(--space-8)]">
              <Bento>
                {cities.map((page) => (
                  <Card
                    key={page.slugPath}
                    eyebrow="Städer"
                    title={page.frontmatter.title}
                    href={contentHref(SITE, page.slugPath)}
                  >
                    {page.frontmatter.description}
                  </Card>
                ))}
              </Bento>
            </div>
          </Container>
        </Section>
      )}

      <Section>
        <Container width="narrow">
          <FAQ title={t(SITE, 'common.faqTitle')} items={FAQ_ITEMS} />
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow" className="text-center">
          <Heading level={2}>Berätta var du står idag</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Skriv en rad, så säger vi vilken väg som passar — även när svaret är att du bör vänta.
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)]">
            {actions}
          </div>
          {whatsapp && (
            <p className="mt-[var(--space-6)] text-[var(--text-sm)]">
              <a href={whatsapp} rel="noopener" className="text-[var(--accent)] underline underline-offset-2">
                Eller skriv till oss på WhatsApp
              </a>
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
