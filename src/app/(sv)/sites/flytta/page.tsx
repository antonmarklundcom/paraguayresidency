/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArticleCards,
  Button,
  Disclosure,
  Fact,
  FAQ,
  Heading,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  Reasons,
  Section,
  Steps,
  TeamStrip,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { arrivalImage } from '@/lib/imagery';
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

const STEPS = [
  { title: 'Ett samtal', body: 'Vi bekräftar din väg och ditt fasta pris i kronor innan du bestämmer dig.' },
  { title: 'Dokumenten', body: 'Apostille och översättning i Sverige, i rätt ordning, efter en lista gjord för dig.' },
  { title: 'Veckan i Asunción', body: 'Vi lämnar in ärendet och följer med dig på besöken. Du kommer hit; vi sköter resten.' },
  { title: 'Cédulan', body: 'När uppehållstillståndet är beviljat ordnar vi din cédula och säger vad som kommer sedan.' },
];

export default function Page() {
  const pages = getPages(SITE);
  const guides = pages.filter((page) => page.hub === 'guider').slice(0, 3);
  const cities = pages.filter((page) => page.hub === 'stader').slice(0, 3);
  const story = arrivalImage('guide-tile-terere-cafe', 'sv');

  const actions = (
    <>
      <Button href="/route-finder">{t(SITE, 'home.ctaPrimary')}</Button>
      <Button href="#contact" variant="secondary">
        {t(SITE, 'home.ctaSecondary')}
      </Button>
    </>
  );

  return (
    <>
      <PhotoHero
        image="guide-hero-reading-terrace-asuncion"
        locale="sv"
        focus="65% center"
        eyebrow="Flytta till Paraguay"
        title={t(SITE, 'home.h1')}
        sub={t(SITE, 'home.sub')}
        actions={actions}
        proof={[t(SITE, 'proof.fixedFee'), t(SITE, 'proof.asuncion'), t(SITE, 'proof.reply')]}
      />

      <IntentTiles
        locale="sv"
        title="Var vill du börja?"
        intro="Välj det som ligger närmast. Vet du inte, så säger vägvalstestet det på två minuter."
        tiles={[
          { label: 'Vilken väg passar mig?', note: 'Sex frågor, två minuter', href: '/route-finder', image: 'guide-tile-route-fork' },
          { label: 'Uppehållstillstånd', note: 'Tillfälligt, permanent och cédula', href: '/uppehallstillstand', image: 'guide-tile-documents-desk' },
          { label: 'Vad det kostar', note: 'Att leva här, på riktigt', href: '/kostnader', image: 'guide-tile-market-asuncion' },
          { label: 'Vår historia', note: 'Varför vi flyttade hit', href: '/var-historia', image: 'guide-tile-hammock-reading' },
        ]}
      />

      <section className="bg-[var(--bg)] pb-16 md:pb-24">
        <div className="mx-auto grid max-w-[var(--container)] items-center gap-10 px-5 sm:px-8 md:grid-cols-2 md:gap-16">
          <img
            src={`/images/arrival/${story.id}-800.webp`}
            srcSet={`/images/arrival/${story.id}-480.webp 480w, /images/arrival/${story.id}-800.webp 800w`}
            sizes="(min-width: 768px) 40vw, 90vw"
            width={800}
            height={1000}
            alt={story.alt}
            loading="lazy"
            className="aspect-[4/5] w-full max-w-md rounded-[var(--radius-brand)] object-cover shadow-[var(--shadow-lg)] md:justify-self-end"
          />
          <div className="max-w-lg">
            <Heading level={2}>Vi bor här. Det är hela poängen.</Heading>
            <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
              Vi flyttade hit utan att kunna svaret på hälften av det vi undrade. Allt vi lärde oss
              av det sitter nu i den här sajten och i checklistorna vårt team i Asunción använder
              med varje ny familj.
            </p>
            <Link
              href="/var-historia"
              className="mt-[var(--space-6)] inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Läs vår historia <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Steps
        tone="alt"
        title="Fyra steg, i den ordning de faktiskt händer"
        steps={STEPS}
        link={{ href: '/process', label: 'Processen steg för steg' }}
      />

      <Reasons
        title="Vad som faktiskt gäller"
        intro="Utan skönmålning: så här ser reglerna ut i dag, och vi bekräftar dem med dig innan något lämnas in."
        reasons={[
          { title: 'Ett tydligt första steg', body: <>Giltighet för tillfälligt uppehållstillstånd: <Fact k="temporary.duration" site={SITE} />.</> },
          { title: 'Permanent, med närvarokrav', body: <>För permanent uppehållstillstånd gäller följande närvarokrav: <Fact k="permanent.presence_rule" site={SITE} />.</> },
          { title: 'Territoriell beskattning', body: <><Fact k="tax.foreign_income_treatment" site={SITE} />.</> },
        ]}
        footer={
          <Link href="/kostnader" className="inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline">
            Se vad det faktiskt kostar <span aria-hidden="true">→</span>
          </Link>
        }
      />

      <TeamStrip site={SITE} />

      <ArticleCards
        site={SITE}
        title="Läs på innan du bestämmer dig"
        articles={guides.map((page) => ({
          eyebrow: 'Guider',
          title: page.frontmatter.title,
          description: page.frontmatter.description,
          href: contentHref(SITE, page.slugPath),
        }))}
        more={{ href: '/guider', label: 'Alla guider' }}
      />

      <ArticleCards
        site={SITE}
        tone="alt"
        title="Var i Paraguay svenskar brukar landa"
        articles={cities.map((page) => ({
          eyebrow: 'Städer',
          title: page.frontmatter.title,
          description: page.frontmatter.description,
          href: contentHref(SITE, page.slugPath),
        }))}
        more={{ href: '/stader', label: 'Alla städer' }}
      />

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">Detaljerna</Heading>
        <Disclosure title="Investerar du kapital? Investor Pass">
          <p>
            Med en kvalificerande investering kan du gå direkt till permanent uppehållstillstånd.
            Eget varumärke, samma team:{' '}
            <a href={siteOrigin('investorpass')} className="text-[var(--accent)] underline underline-offset-2">
              så fungerar Investor Pass
            </a>
            .
          </p>
        </Disclosure>
        <Disclosure title={t(SITE, 'common.faqTitle')}>
          <FAQ items={FAQ_ITEMS} />
        </Disclosure>
      </Section>

      <LeadPanel
        site={SITE}
        variant="contact"
        title="Berätta var du står i dag"
        intro="Skriv en rad, så säger vi vilken väg som passar — även när svaret är att du bör vänta."
        whatsappMessage="Hej! Jag har en fråga om att flytta till Paraguay."
      />
    </>
  );
}
