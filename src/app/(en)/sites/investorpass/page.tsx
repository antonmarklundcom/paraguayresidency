import type { Metadata } from 'next';
import type { FactKey } from '@content/shared/facts';
import {
  HeroContact,
  Button,
  PhotoHero,
  heroTrust,
  TrustBar,
  PriceTable,
  AfterYouMessage,
  ArticleCards,
  TeamStrip,
  Guarantee,
  Testimonials,
  Fact,
  FAQ,
  Heading,
  JsonLd,
  LeadPanel,
  Disclosure,
  Band,
  Eyebrow,
  SectionHeader,
  Section,
} from '@/components';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { getPages } from '@/content';
import { contentHref } from '@/lib/content-href';
import { siteMetadata, serviceOfferJsonLd } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';
import { RouteIndex, type IndexRoute } from './_lib/RouteIndex';

const PATH = '/';
const MESSAGE = 'Hi — I have a question about the Investor Pass.';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Paraguay Investor Pass — Permanent Residency by Investment',
    description:
      'The Paraguay Investor Pass grants permanent residency to qualifying investors, skipping temporary residency. Routes, requirements and timeline.',
    path: PATH,
  });
}

const ROUTES: IndexRoute[] = [
  {
    id: 'real_estate',
    title: 'Property that qualifies',
    body: 'Title and purchase price are clean records, so this is usually the simplest route to document.',
    image: 'investorpass-tile-residential-lobby-dusk',
    factKey: 'investorpass.route_real_estate_usd',
  },
  {
    id: 'productive_business',
    title: 'An operating business',
    body: 'A real, productive concern, not a shell holding cash. Suits investors who already run something similar.',
    image: 'investorpass-tile-agro-silos-blue-hour',
    factKey: 'investorpass.route_business_usd',
  },
  {
    id: 'financial_instruments',
    title: 'Qualifying instruments',
    body: 'More paperwork to prove the investment is real and productive, and often the most liquid to hold.',
    image: 'investorpass-tile-private-meeting-room',
    factKey: 'investorpass.route_financial_usd',
  },
  {
    id: 'tourism',
    title: 'A tourism project',
    body: 'Lodges, hospitality and visitor infrastructure, structured and documented as a productive project.',
    image: 'investorpass-tile-river-lodge-dusk',
    factKey: 'investorpass.route_tourism_usd',
  },
];

const SPEC_ROWS: { label: string; fact: FactKey }[] = [
  { label: 'Qualifying investment', fact: 'investorpass.min_investment_usd' },
  { label: 'Legal basis', fact: 'investorpass.legal_instrument' },
  { label: 'Launched', fact: 'investorpass.launch_date' },
  { label: 'What you get', fact: 'investorpass.validity_years' },
  { label: 'Cédula', fact: 'cedula.timeline' },
];

/** The five W6 articles, read against the 2026 resolution, in reading order. */
const FEATURED = [
  'what-the-investor-pass-is',
  'investor-pass-resolution-explained',
  'investor-pass-vs-suace',
  'paraguay-golden-visa',
  'paraguay-citizenship-by-investment',
  'financial-instruments-and-tourism-routes',
];

const FAQ_ITEMS = [
  {
    question: 'Is the minimum investment fixed?',
    answer:
      'Do not assume the routes share a single minimum. We review the eligibility of your proposed investment and give you a written breakdown of the capital and documents your chosen route requires.',
  },
  {
    question: 'Does the Investor Pass really skip temporary residency?',
    answer:
      'Yes — that is its point. A qualifying investment lets you apply directly for permanent residency instead of serving the standard temporary stage first.',
  },
  {
    question: 'What if I am not sure which route fits?',
    answer:
      'Take the Route Finder, or send an inquiry with your rough capital and timeline. We tell you which of the four routes fits, or tell you honestly that the standard residency route is the better deal for your case.',
  },
  {
    question: 'Is this the same team as paraguayresidency.co.uk?',
    answer:
      'Yes. Investor Pass is a dedicated brand because it targets a different applicant — investors, family offices, migration agents — with a different ticket size, filed by the same team in Asunción.',
  },
];

export default function Page() {
  const pages = getPages('investorpass');
  const articles = FEATURED.flatMap((slug) => {
    const post = pages.find((page) => !page.frontmatter.draft && page.slugPath.endsWith(`/${slug}`));
    return post ? [{ title: post.frontmatter.title, description: post.frontmatter.description, href: contentHref('investorpass', post.slugPath), hub: 'insights' }] : [];
  });

  return (
    <>
      <PhotoHero
        layout="editorial-dark"
        image="investorpass-hero-business-district-blue-hour"
        video={{ id: 'investorpass-hero-business-district-blue-hour' }}
        eyebrow="Paraguay Investor Pass"
        title="Permanent residency in Paraguay, in one step."
        sub="Qualifying investors skip temporary residency. We structure, file and stay until your card arrives."
        actions={
          <>
            <Button href="#inquiry">Private consultation</Button>
            <HeroContact site="investorpass" message={MESSAGE} fallbackHref="#inquiry" />
          </>
        }
        trust={heroTrust('investorpass')}
      />
      <TrustBar site="investorpass" />

      {/* I to IV: the four routes as an index, the first thing an investor decides. */}
      <Band labelledBy="routes-title" id="routes">
        <SectionHeader
          id="routes-title"
          eyebrow="Four ways to qualify"
          title="Choose the route that fits your capital"
          intro="Each route has its own threshold and its own paperwork. Message us with your rough capital and goal, and we tell you which one to file, or that the standard route suits you better."
          aside={<Button href="/route-finder" variant="secondary">Take the Route Finder</Button>}
        />
        <RouteIndex routes={ROUTES} />
      </Band>

      {/* The spec sheet: open on the page, not behind a toggle. */}
      <Band tone="alt" labelledBy="spec-title" id="spec">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <Eyebrow>Spec sheet</Eyebrow>
            <h2 id="spec-title" className="mt-5 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">Investor Pass at a glance</h2>
            <p className="mt-5 max-w-[42ch] leading-relaxed text-[var(--fg-muted)]">
              Searching for a Paraguay golden visa? It is this programme.{' '}
              <a className="text-[var(--accent)] underline underline-offset-4" href="/insights/paraguay-golden-visa">The golden visa, explained</a>.
            </p>
            <a className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline" href="/investor-pass/requirements">
              Full requirements <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="overflow-x-auto border-y border-[var(--accent)]/40">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Investor Pass qualifying routes and programme rules</caption>
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)]">
                    <th scope="row" className="w-2/5 py-4 pr-4 align-top font-[family-name:var(--font-mono)] text-(length:--step--2) font-medium uppercase tracking-[.14em] text-[var(--fg-muted)]">{row.label}</th>
                    <td className="py-4 align-top text-(length:--step--1) text-[var(--fg)]"><Fact k={row.fact} site="investorpass" /></td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-4 pr-4 align-top font-[family-name:var(--font-mono)] text-(length:--step--2) font-medium uppercase tracking-[.14em] text-[var(--fg-muted)]">Standard route</th>
                  <td className="py-4 align-top text-(length:--step--1) text-[var(--fg)]">
                    Temporary first, then permanent. <a className="text-[var(--accent)] underline underline-offset-4" href="/investor-pass/vs-standard-residency">Compare the two</a>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Band>

      <PriceTable
        site="investorpass"
        title="One fixed service fee, in writing before you commit"
        intro="The fee covers structuring and filing. Your investment, government fees, apostilles and translations are separate and listed in the quote."
      />

      <AfterYouMessage site="investorpass" tone="alt" message={MESSAGE} />

      <ArticleCards
        site="investorpass"
        title="Read against Resolution 0283/2026"
        articles={articles}
        more={{ href: '/insights', label: 'All Investor Pass insights' }}
      />

      <Testimonials site="investorpass" tone="alt" />
      <Guarantee site="investorpass" />
      <TeamStrip site="investorpass" />

      <Section width="narrow" tone="alt">
        <Heading level={2}>Frequently asked</Heading>
        <FAQ items={FAQ_ITEMS} />
        <p className="mt-[var(--space-6)] flex flex-wrap gap-x-6 gap-y-1">
          <a className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4" href="/investor-pass/process">The full process</a>
          <a className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4" href="/investor-pass/for-agents">For migration agents</a>
        </p>
        <div className="mt-[var(--space-6)]">
          <Disclosure title="The full process"><ProcessTimeline site="investorpass" route="investor" /></Disclosure>
        </div>
      </Section>

      <LeadPanel
        site="investorpass"
        variant="investor_inquiry"
        id="inquiry"
        title="See if you qualify"
        intro="Tell us your capital and goal. We send the route, cost and exit options in writing."
        whatsappMessage={MESSAGE}
        footnote={
          <>
            Not investing? See{' '}
            <a href={siteOrigin('residency')} className="text-[var(--accent)] underline underline-offset-2">standard residency routes</a>{' '}
            on paraguayresidency.co.uk instead.
          </>
        }
      />

      <JsonLd
        data={serviceOfferJsonLd('investorpass', {
          name: 'Paraguay Investor Pass',
          description:
            'Direct permanent residency in Paraguay for qualifying investors, filed end to end.',
          path: PATH,
        })}
      />
    </>
  );
}
