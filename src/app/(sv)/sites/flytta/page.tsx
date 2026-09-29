import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AfterYouMessage,
  ArticleCards,
  Button,
  Disclosure,
  Eyebrow,
  Fact,
  FAQ,
  Heading,
  HeroContact,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  PriceTable,
  Reasons,
  Section,
  Steps,
  TeamSection,
  TrustBar,
  heroTrust,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { arrivalPicture } from '@/lib/arrival-files';
import { articleOwnImage } from '@/lib/article-images';
import { getPage, getPages } from '@/content';
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

/** "Vår resa": only what /var-historia already tells, in the order it happened. */
const JOURNEY = [
  { when: '2022', title: 'Första resan', body: 'Vi åkte hit utan plan och tänkte stanna några veckor. Röd jord, långa eftermiddagar och priser som fick oss att räkna om två gånger.' },
  { when: 'Sedan', title: 'Vi stannade', body: 'Inte för kostnadsläget, utan för att vi för första gången på länge kände att vi hade tid. Något bestämt på måndagen kunde vara påbörjat på onsdagen.' },
  { when: 'Ansökan', title: 'Vi gjorde allt fel', body: 'På egen hand, utan spanska, med dokument i fel ordning. Det kostade en extra resa och några månader.' },
  { when: 'Nu', title: 'Vi hjälper andra svenskar', body: 'Allt vi gjorde fel blev en lista. Vårt team i Asunción använder den med varje ny familj.' },
];

const STEPS = [
  { title: 'Ett meddelande', body: 'Skriv till oss på WhatsApp eller i formuläret. Vi bekräftar din väg och ditt fasta pris i kronor skriftligt innan du bestämmer dig.' },
  { title: 'Dokumenten och Skatteverket', body: 'Apostille och översättning i Sverige, i rätt ordning. Flyttar du på riktigt förklarar vi också vad som gäller mot Skatteverket, och du bestämmer själv när du anmäler.' },
  { title: 'Veckan i Asunción', body: 'Vi lämnar in ärendet och följer med dig på besöken. Du kommer hit; vi sköter resten.' },
  { title: 'Cédulan', body: 'När uppehållstillståndet är beviljat ordnar vi din cédula och säger vad som kommer sedan.' },
];

const TAX_SLUGS = [
  'guider/kan-man-slippa-skatt-genom-att-flytta-till-paraguay',
  'guider/anmala-utflyttning-till-skatteverket',
  'guider/svensk-pension-i-paraguay',
];
const LIFE_SLUGS = [
  'guider/paraguay-eller-thailand-spanien-for-pensionarer',
  'guider/paraguayanskt-medborgarskap-och-pass',
  'guider/residency-i-paraguay-komplett-guide',
];

function cards(slugPaths: string[], eyebrow: string) {
  return slugPaths.flatMap((slugPath) => {
    const page = getPage(SITE, slugPath);
    if (!page) return [];
    return [{
      eyebrow,
      title: page.frontmatter.title,
      description: page.frontmatter.description,
      href: contentHref(SITE, page.slugPath),
      hub: page.hub,
      image: articleOwnImage(SITE, page.slugPath),
    }];
  });
}

export default function Page() {
  const cities = getPages(SITE).filter((page) => page.hub === 'stader').slice(0, 3);
  const couple = arrivalPicture('flytta-tile-par-veranda-skymning', 'sv', { maxWidth: 800 });

  const actions = (
    <>
      <Button href="/route-finder">{t(SITE, 'home.ctaPrimary')}</Button>
      <HeroContact site={SITE} fallbackHref="#contact" />
    </>
  );

  return (
    <>
      <PhotoHero
        image="flytta-hero-veranda-moving-boxes"
        video={{ id: 'flytta-hero-veranda-moving-boxes' }}
        locale="sv"
        focus="60% center"
        eyebrow="Ett brev från Asunción"
        title={t(SITE, 'home.h1')}
        sub={t(SITE, 'home.sub')}
        actions={actions}
        trust={heroTrust(SITE)}
      />
      <TrustBar site={SITE} />

      {/* The letter: first person plural, on a narrow measure, with the photo beside it. */}
      <section className="bg-[var(--bg)] py-[var(--space-section)]" aria-labelledby="letter-title">
        <div className="mx-auto grid max-w-[var(--container)] items-start gap-10 px-[var(--space-gutter)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <picture>
            {couple.avifSrcSet && <source type="image/avif" srcSet={couple.avifSrcSet} sizes="(min-width: 768px) 40vw, 90vw" />}
            <img
              src={couple.src}
              srcSet={couple.srcSet}
              sizes="(min-width: 768px) 40vw, 90vw"
              width={couple.width}
              height={couple.height}
              alt={couple.alt}
              loading="lazy"
              className="aspect-[4/5] w-full max-w-md rounded-[var(--radius-brand)] object-cover shadow-[var(--elev-0)]"
            />
          </picture>
          <div className="max-w-[60ch]">
            <Eyebrow>Hej</Eyebrow>
            <h2 id="letter-title" className="mt-3 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
              Vi bor här. Det är hela poängen.
            </h2>
            <div className="mt-[var(--space-6)] space-y-[var(--space-4)] text-(length:--step-0) leading-relaxed text-[var(--fg-muted)]">
              <p>
                Vi flyttade hit utan att kunna svaret på hälften av det vi undrade. Vår egen ansökan
                gjorde vi på det dummaste sättet som finns, och lärde oss av varje misstag.
              </p>
              <p>
                Allt det sitter nu i den här sajten och i checklistorna vårt team i Asunción
                använder med varje ny familj. Vi är inte jurister eller skatterådgivare, och vi
                säger hellre det rakt ut än låtsas kunna svara på allt.
              </p>
            </div>
            <Link
              href="/var-historia"
              className="mt-[var(--space-6)] inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Läs hela vår historia <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-alt)] py-[var(--space-section)]" aria-labelledby="journey-title" data-journey>
        <div className="mx-auto max-w-[var(--container)] px-[var(--space-gutter)]">
          <Eyebrow>Vår resa</Eyebrow>
          <h2 id="journey-title" className="mt-3 max-w-2xl font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
            Från fel kö till en lista som fungerar
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
            {JOURNEY.map((item) => (
              <li key={item.title} className="border-l-2 border-[var(--accent)] pl-5">
                <p className="text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--accent)]">{item.when}</p>
                <h3 className="mt-2 font-[family-name:var(--display-font)] text-(length:--step-2) leading-tight">{item.title}</h3>
                <p className="mt-3 text-[var(--fg-muted)]">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PriceTable site={SITE} />

      <Steps
        tone="alt"
        title="Fyra steg, i den ordning de faktiskt händer"
        steps={STEPS}
        link={{ href: '/process', label: 'Processen steg för steg' }}
      />

      <AfterYouMessage site={SITE} />

      <IntentTiles
        locale="sv"
        title="Var vill du börja?"
        intro="Välj det som ligger närmast. Vet du inte, så säger vägvalstestet det på två minuter."
        tiles={[
          { label: 'Vilken väg passar mig?', note: 'Sex frågor, två minuter', href: '/route-finder', image: 'flytta-tile-kompass-anteckningsbok' },
          { label: 'Uppehållstillstånd', note: 'Tillfälligt, permanent och cédula', href: '/uppehallstillstand', image: 'flytta-tile-pass-dokumentmapp' },
          { label: 'Vad det kostar', note: 'Att leva här, på riktigt', href: '/kostnader', image: 'flytta-tile-matkasse-marknad-asuncion' },
          { label: 'Vår historia', note: 'Varför vi flyttade hit', href: '/var-historia', image: 'flytta-tile-par-veranda-skymning' },
        ]}
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

      <TeamSection site={SITE} tone="alt" />

      <ArticleCards
        site={SITE}
        title="Skatt, utflyttning och pension"
        articles={cards(TAX_SLUGS, 'Guider')}
        more={{ href: '/guider', label: 'Alla guider' }}
      />

      <ArticleCards
        site={SITE}
        tone="alt"
        title="Pass, pension och hela vägen"
        articles={cards(LIFE_SLUGS, 'Guider')}
        more={{ href: '/guider', label: 'Alla guider' }}
      />

      <ArticleCards
        site={SITE}
        title="Var i Paraguay svenskar brukar landa"
        articles={cities.map((page) => ({
          eyebrow: 'Städer',
          title: page.frontmatter.title,
          description: page.frontmatter.description,
          href: contentHref(SITE, page.slugPath),
          hub: page.hub,
          image: articleOwnImage(SITE, page.slugPath),
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
