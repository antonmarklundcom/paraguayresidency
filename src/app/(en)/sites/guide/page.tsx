import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import {
  Button,
  CheckoutButton,
  PhotoHero,
  IntentTiles,
  TeamStrip,
  FAQ,
  Heading,
  JsonLd,
  NewsletterForm,
  Disclosure,
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
  { n: 1, title: 'Why Paraguay (and why not)', note: 'Who it suits, who it does not, and the honest trade-offs.' },
  { n: 2, title: 'The routes compared', note: 'Temporary, permanent, Mercosur and the Investor Pass side by side.' },
  { n: 3, title: 'Documents, apostilles, translations by nationality', note: 'The document chain for the US, UK, EU, Canada, Australia and LatAm.' },
  { n: 4, title: 'Costs, real ones', note: 'Every government fee and third-party cost, with a worksheet.' },
  { n: 5, title: 'Timeline week by week', note: 'What happens when, and where cases usually stall.' },
  { n: 6, title: 'Cédula and RUC', note: 'Your ID card and tax number, step by step.' },
  { n: 7, title: 'Banking', note: 'Which accounts are realistic, and what banks ask for.' },
  { n: 8, title: 'Taxes for residents', note: 'Paraguay’s territorial system, the rates, and what it does not cover.' },
  { n: 9, title: 'Family', note: 'Spouses, children and the extra documents they need.' },
  { n: 10, title: 'Investor Pass overview', note: 'The four investment routes and when the shortcut is worth it.' },
  { n: 11, title: 'Mistakes we see monthly', note: 'The errors that cost people months, and how to avoid them.' },
  { n: 12, title: 'Checklists', note: 'Printable, tick-as-you-go lists for every stage.' },
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
      <Section id="inside"><Heading level={2}>What&apos;s inside</Heading>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{CHAPTERS.map(chapter => <div key={chapter.n} className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-5"><span className="text-(length:--text-xs) font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">Chapter {chapter.n}</span><h3 className="mt-1 font-[family-name:var(--display-font)] text-lg">{chapter.title}</h3><p className="mt-2 text-(length:--text-sm) text-[var(--fg-muted)]">{chapter.note}</p></div>)}</div>
      </Section>
      <Section id="price" tone="accent">
        <div className="grid items-center gap-[var(--space-12)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* The product, drawn in CSS: a cover needs no image request, so it
              costs nothing against LCP and never goes stale. */}
          <div aria-hidden="true" className="mx-auto w-full max-w-[17rem] [perspective:1200px]">
            <div className="relative aspect-[3/4] rounded-r-[10px] rounded-l-[3px] bg-[var(--accent)] p-7 text-[var(--accent-fg)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45),0_12px_20px_-12px_rgba(0,0,0,0.3)] [transform:rotateY(-14deg)] motion-safe:transition-transform motion-safe:duration-500 hover:[transform:rotateY(-4deg)]">
              <span className="absolute inset-y-0 left-0 w-3 rounded-l-[3px] bg-black/20" />
              <span className="absolute inset-y-0 left-3 w-px bg-white/25" />
              <p className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase opacity-80">2026 edition</p>
              <p className="mt-6 font-[family-name:var(--display-font)] text-[1.9rem] leading-[1.05]">The Paraguay Residency Guide</p>
              <p className="mt-4 text-[0.8rem] leading-snug opacity-85">Every step, document and cost, written down once and kept current.</p>
              <p className="absolute right-7 bottom-6 left-7 border-t border-white/30 pt-3 text-[0.65rem] tracking-[0.14em] uppercase opacity-80">12 chapters · checklists</p>
            </div>
          </div>
          <div>
            <p className="text-(length:--text-xs) font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">The complete guide</p>
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


      <TeamStrip site="guide" />
<Section><Heading level={2}>Latest articles</Heading><ul className="mt-8 grid auto-cols-[82%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto p-2 md:auto-cols-[31%]">{latest.map(post => <li key={post.slugPath} className="min-w-0 snap-start"><a href={contentHref('guide', post.slugPath)} className="flex min-h-44 items-end rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-6 font-[family-name:var(--display-font)] text-xl text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2"><span className="line-clamp-3">{post.frontmatter.title}</span></a></li>)}</ul><a href="/blog" className="mt-6 inline-flex min-h-11 items-center text-[var(--accent)] underline">Browse all articles</a></Section>
      <Section width="narrow" spacing="tight"><Disclosure title="Questions before buying"><FAQ items={FAQ_ITEMS} /></Disclosure></Section>
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
