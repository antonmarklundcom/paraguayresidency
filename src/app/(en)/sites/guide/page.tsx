import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import {
  Button,
  CheckoutButton,
  Container,
  PhotoHero,
  IntentTiles,
  TeamStrip,
  FAQ,
  Heading,
  JsonLd,
  NewsletterForm,
  Section,
} from '@/components';
import { siteMetadata, productOfferJsonLd } from '@/lib/metadata';
import {
  fallbackCurrency,
  fallbackPriceCents,
  formatPrice,
  getProductBySlug,
} from '@/lib/purchases';
import { GUIDE_ENTRY_SLUG } from '@/sites/registry';
import { t } from '@/i18n';

const SITE = 'guide' as const;
const PATH = '/';

/** Refreshes the live product price every five minutes. */
export const revalidate = 300;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'home.metaTitle'),
    description: t(SITE, 'home.metaDescription'),
    path: PATH,
  });
}

const CHAPTERS = [
  { n: 1, title: 'Why Paraguay (and why not)' },
  { n: 2, title: 'The routes compared' },
  { n: 3, title: 'Documents, apostilles, translations by nationality' },
  { n: 4, title: 'Costs, real ones' },
  { n: 5, title: 'Timeline week by week' },
  { n: 6, title: 'Cédula and RUC' },
  { n: 7, title: 'Banking' },
  { n: 8, title: 'Taxes for residents' },
  { n: 9, title: 'Family' },
  { n: 10, title: 'Investor Pass overview' },
  { n: 11, title: 'Mistakes we see monthly' },
  { n: 12, title: 'Checklists' },
];

const FAQ_ITEMS = [
  {
    question: 'Is this the same as hiring your team?',
    answer:
      "No. The guide is what we know, written down, so you can decide and do parts of it yourself. If you would rather someone filed the case for you, that is the service side of what we do — the guide's thank-you page links straight to it.",
  },
  {
    question: 'Is it actually kept current?',
    answer:
      'Yes — the price includes 12 months of updates. Paraguay residency rules move; a guide that stops updating after launch stops being worth reading.',
  },
  {
    question: 'What if it is not what I expected?',
    answer: 'A 14-day refund, no questions. Email us and it is done.',
  },

];

export default async function Page() {
  const latest = getPages('guide').filter(post => !post.frontmatter.draft && !/lawyer/i.test(post.frontmatter.title)).slice(0, 3);
  const product = await getProductBySlug(GUIDE_ENTRY_SLUG);
  const priceCents = product?.priceCents ?? fallbackPriceCents();
  const currency = product?.currency ?? fallbackCurrency();
  const price = formatPrice(priceCents, currency);

  return (
    <>
      <PhotoHero image="guide-hero-reading-terrace-asuncion" focus="15% center"
        title="The Paraguay residency guide we wish existed."
        sub="Every step, document and cost, written down once and kept current."
        actions={<><Button href="#price">{t(SITE, 'home.ctaPrimary')}</Button><Button href="#inside" variant="secondary">{t(SITE, 'home.ctaSecondary')}</Button></>}
      />
      <IntentTiles title="What are you looking for?" tiles={[
        { label: 'Which route fits me?', href: '/route-finder', image: 'guide-tile-route-fork' },
        { label: 'Documents I need', href: '/blog/documents-you-need-for-paraguay-residency', image: 'guide-tile-documents-desk' },
        { label: 'What it really costs', href: '/blog/real-cost-of-living-in-paraguay', image: 'guide-tile-market-asuncion' },
        { label: 'Life in Paraguay', href: '/blog/is-paraguay-residency-worth-it', image: 'guide-tile-terere-cafe' },
        { label: 'Free articles', href: '/blog', image: 'guide-tile-hammock-reading' },
      ]} />
      <Section id="inside"><Container><Heading level={2}>What&apos;s inside</Heading>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{CHAPTERS.map(chapter => <div key={chapter.n} className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-5"><h3 className="font-[family-name:var(--display-font)] text-lg">{chapter.title}</h3></div>)}</div>
      </Container></Section>
      <Section id="price" tone="accent">
        <Container width="narrow">
          <Heading level={2}>{price}, once</Heading>
          <ul className="mt-[var(--space-4)] space-y-[var(--space-2)] text-[var(--fg-muted)]">
            <li>Instant PDF download</li>
            <li>Free updates for 12 months</li>
            <li>14-day refund, no questions</li>
          </ul>
          <div className="mt-[var(--space-8)]">
            <CheckoutButton />
          </div>
        </Container>
      </Section>


      <TeamStrip />
<Section><Container><Heading level={2}>Latest articles</Heading><ul className="mt-8 grid auto-cols-[82%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto p-2 md:auto-cols-[31%]">{latest.map(post => <li key={post.slugPath} className="min-w-0 snap-start"><a href={contentHref('guide', post.slugPath)} className="flex min-h-44 items-end rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-6 font-[family-name:var(--display-font)] text-xl text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2"><span className="line-clamp-3">{post.frontmatter.title}</span></a></li>)}</ul><a href="/blog" className="mt-6 inline-flex min-h-11 items-center text-[var(--accent)] underline">Browse all articles</a></Container></Section>
      <Section><Container width="narrow"><details className="border-b border-[var(--border)] py-5"><summary className="flex min-h-11 cursor-pointer items-center text-lg text-[var(--accent)]">Questions before buying</summary><div className="space-y-5 py-6 text-[var(--fg-muted)]"><FAQ items={FAQ_ITEMS} /></div></details></Container></Section>
      <Section tone="alt"><Container width="narrow"><Heading level={2}>Not ready yet?</Heading><p className="mt-4 text-[var(--fg-muted)]">Residency notes, delivered to your inbox.</p><div className="mt-6"><NewsletterForm site={SITE} source="guide-home" /></div></Container></Section>
      <JsonLd
        data={productOfferJsonLd(SITE, {
          name: 'Paraguay Residency Guide',
          description: t(SITE, 'home.metaDescription'),
          path: PATH,
          priceCents,
          currency,
          sku: GUIDE_ENTRY_SLUG,
        })}
      />
    </>
  );
}
