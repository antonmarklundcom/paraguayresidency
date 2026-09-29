import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import {
  ArticleCards,
  BookMockup,
  Button,
  CheckoutButton,
  Disclosure,
  FAQ,
  ForWhom,
  Guarantee,
  Heading,
  IntentTiles,
  JsonLd,
  NewsletterForm,
  PhotoHero,
  SamplePages,
  Section,
  ServiceUpsell,
  TeamStrip,
  TocPreview,
  Eyebrow,
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

/** Free reading that answers the questions people ask before they buy. */
const FEATURED = ['paraguay-residency-cost', 'how-long-paraguay-residency-actually-takes', 'mistakes-we-see-every-month'];

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
  const posts = getPages('guide').filter((post) => !post.frontmatter.draft);
  const latest = FEATURED.map((slug) => posts.find((post) => post.slugPath.endsWith(`/${slug}`))).filter((post) => post !== undefined);
  const product = await getProductBySlug(GUIDE_ENTRY_SLUG);
  const priceCents = product?.priceCents ?? fallbackPriceCents();
  const currency = product?.currency ?? fallbackCurrency();
  const price = formatPrice(priceCents, currency);

  return (
    <>
      <PhotoHero
        image="guide-hero-reading-desk-asuncion"
        video={{ id: 'guide-hero-reading-desk-asuncion' }}
        focus="40% center"
        eyebrow="The 2026 edition"
        title="The Paraguay residency guide we wish existed."
        sub="Every step, document and cost, written down once and kept current. Read it in an evening, then decide with real numbers."
        actions={<><Button href="#price">{t(SITE, 'home.ctaPrimary')}</Button><Button href="#inside" variant="secondary">{t(SITE, 'home.ctaSecondary')}</Button></>}
      />

      <Section id="price" tone="accent">
        <div className="grid items-center gap-[var(--space-12)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <BookMockup site={SITE} />
          <div>
            <Eyebrow>The complete guide</Eyebrow>
            <Heading level={2} className="mt-2">{price}, once</Heading>
            <ul className="mt-[var(--space-6)] space-y-[var(--space-3)]">
              {[
                'All 12 chapters online in your member area, plus the PDF to keep',
                'Real figures with their official source and the date we checked them',
                'Document checklists by nationality, ready to print',
                'Free updates for 12 months when the rules change',
                '14-day refund, no questions',
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[0.7rem] text-[var(--accent-fg)]">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-[var(--space-8)]">
              <CheckoutButton />
            </div>
            <p className="mt-[var(--space-4)] text-(length:--text-sm) text-[var(--fg-muted)]">
              Rather have it done for you? <a href="https://paraguayresidency.co.uk/contact" className="text-[var(--accent)] underline underline-offset-2">Our team in Asunción files it end to end</a>.
            </p>
          </div>
        </div>
      </Section>

      <ForWhom site={SITE} />
      <TocPreview site={SITE} tone="alt" />
      <SamplePages site={SITE} tone="default" />
      <Guarantee site={SITE} tone="alt" />

      <IntentTiles
        title="Free reading first"
        intro="Not sure yet? These answer the questions people ask before they buy."
        tiles={[
          { label: 'Which route fits me?', note: 'Six questions, two minutes', href: '/route-finder', image: 'guide-tile-red-earth-paths-palm' },
          { label: 'Documents I need', note: 'Apostilles and translations', href: '/blog/documents-you-need-for-paraguay-residency', image: 'guide-tile-apostille-checklist-desk' },
          { label: 'What it really costs', note: 'Living and paperwork', href: '/blog/real-cost-of-living-in-paraguay', image: 'guide-tile-calculator-cocido-notebook' },
          { label: 'Life in Paraguay', note: 'Is it worth it?', href: '/blog/is-paraguay-residency-worth-it', image: 'guide-tile-terere-street-cafe' },
        ]}
      />

      <ArticleCards
        site={SITE}
        tone="alt"
        title="From the blog"
        articles={latest.map((post) => ({
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          href: contentHref('guide', post.slugPath),
          hub: post.hub,
        }))}
        more={{ href: '/blog', label: 'Browse all articles' }}
      />

      <Section width="narrow" spacing="tight"><Disclosure title="Questions before buying"><FAQ items={FAQ_ITEMS} /></Disclosure></Section>

      <TeamStrip site={SITE} />
      <ServiceUpsell site={SITE} />

      <Section tone="alt" width="narrow"><Heading level={2}>Not ready yet?</Heading><p className="mt-4 text-[var(--fg-muted)]">Residency notes, delivered to your inbox.</p><div className="mt-6"><NewsletterForm site={SITE} source="guide-home" /></div></Section>
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
