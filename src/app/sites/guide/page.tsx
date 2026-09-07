import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  CheckoutButton,
  Container,
  EditorialHero,
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

/** Reads the live price from the `products` row on every request. */
export const dynamic = 'force-dynamic';

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
  {
    question: 'Do I still need a lawyer after reading it?',
    answer:
      'Sometimes, sometimes not — chapter 11 covers exactly when. The guide tells you honestly, rather than selling you a "yes" either way.',
  },
];

export default async function Page() {
  const product = await getProductBySlug(GUIDE_ENTRY_SLUG);
  const priceCents = product?.priceCents ?? fallbackPriceCents();
  const currency = product?.currency ?? fallbackCurrency();
  const price = formatPrice(priceCents, currency);

  return (
    <>
      <EditorialHero
        eyebrow={t(SITE, 'site.tagline')}
        title={t(SITE, 'home.h1')}
        sub={t(SITE, 'home.sub')}
        actions={
          <>
            <Button href="#price">{t(SITE, 'home.ctaPrimary')}</Button>
            <Button href="#inside" variant="secondary">
              {t(SITE, 'home.ctaSecondary')}
            </Button>
          </>
        }
      />

      {/* Promise */}
      <Section>
        <Container width="narrow">
          <p className="text-[var(--text-lg)] text-[var(--fg-muted)]">
            Most residency information online is a blog post written once, half right, and never
            updated. This is the opposite: every step, document and cost we actually see, written
            down once by the team that files these cases every week — and kept current, because a
            guide that goes stale is worse than no guide.
          </p>
        </Container>
      </Section>

      {/* Who it's for */}
      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>Who this is for</Heading>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              You are seriously considering Paraguay residency and want the real steps and real
              costs before you talk to anyone — us included.
            </li>
            <li>
              You want to handle parts of the process yourself and only pay for help where it
              actually matters.
            </li>
            <li>
              You have read conflicting numbers on forums and want one source that says plainly
              what is confirmed and what is not.
            </li>
          </ul>
        </Container>
      </Section>

      {/* What's inside */}
      <Section id="inside">
        <Container>
          <Heading level={2}>{t(SITE, 'nav.whatsInside')}</Heading>
          <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">
            Twelve chapters, in the order you actually need them.
          </p>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {CHAPTERS.map((chapter) => (
                <Card
                  key={chapter.n}
                  eyebrow={`Chapter ${chapter.n}`}
                  title={chapter.title}
                />
              ))}
            </Bento>
          </div>
        </Container>
      </Section>

      {/* Sample pages */}
      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>A sample page</Heading>
          <blockquote className="mt-[var(--space-6)] border-l-4 border-[var(--accent)] pl-[var(--space-6)] text-[var(--text-lg)] text-[var(--fg)] italic">
            &ldquo;Chapter 5, week 3: this is where most applications stall — not because
            anything is wrong, but because a single stamped translation is sitting in a queue.
            Start this document in week 1, not week 3, and the rest of the timeline holds.&rdquo;
          </blockquote>
          <p className="mt-[var(--space-4)] text-[var(--text-sm)] text-[var(--fg-muted)]">
            That is the level of detail throughout — what actually happens, not a generic
            checklist.
          </p>
        </Container>
      </Section>

      {/* Author / credibility */}
      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>Who wrote it</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            The same team that files temporary residency, permanent residency and cédula cases
            every week in Asunción, on{' '}
            <a
              href="https://paraguayresidency.com"
              rel="noopener"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              paraguayresidency.com
            </a>
            . The guide is the written-down version of what we tell clients on the first call —
            without the sales conversation attached.
          </p>
        </Container>
      </Section>

      {/* Price + guarantee */}
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

      {/* FAQ */}
      <Section>
        <Container width="narrow">
          <FAQ title={t(SITE, 'common.faqTitle')} items={FAQ_ITEMS} />
        </Container>
      </Section>

      {/* Newsletter fallback */}
      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>Not ready yet?</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            {t(SITE, 'guideOffer.newsletter')}
          </p>
          <div className="mt-[var(--space-6)]">
            <NewsletterForm site={SITE} source="guide-home" />
          </div>
        </Container>
      </Section>

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
