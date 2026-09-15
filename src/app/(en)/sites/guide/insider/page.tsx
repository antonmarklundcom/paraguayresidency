import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Button,
  Card,
  CheckoutButton,
  Container,
  EditorialHero,
  FAQ,
  Heading,
  JsonLd,
  Section,
} from '@/components';
import { siteMetadata, productOfferJsonLd } from '@/lib/metadata';
import {
  fallbackCurrency,
  fallbackPriceCents,
  formatPrice,
  getProductBySlug,
} from '@/lib/purchases';
import { resourcesForSite, updatesForSite } from '@/lib/member-content';
import { GUIDE_INSIDER_SLUG } from '@/sites/registry';

/**
 * The recurring-membership sales page (plan §6.9). Guide-only content, site is
 * a const literal `'guide'` — hardcoded copy rather than `t(site, key)`,
 * matching S3's precedent of not mirroring page-specific strings across all
 * seven brand i18n files when a component can only ever render for one brand.
 */
const SITE = 'guide' as const;
const PATH = '/insider';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Paraguay Residency Insider — the membership that keeps the guide current',
    description:
      'Monthly deep dives, an updates feed and case studies on top of the Paraguay Residency Guide. Cancel anytime.',
    path: PATH,
  });
}

const FAQ_ITEMS = [
  {
    question: 'Is this different from the $7 guide?',
    answer:
      'The guide is a one-time purchase — twelve chapters, yours forever, with 12 months of free updates included. Insider is a separate, ongoing membership: a monthly deep dive, an updates feed, and case studies that go further than a general-audience guide has room for. You do not need Insider to use the guide, and the guide is not required to join Insider — most members have both.',
  },
  {
    question: 'What actually changes every month?',
    answer:
      'A short update whenever something moves — a fee change, a processing-time shift, a new document requirement — plus one longer deep dive on a topic the twelve chapters could not cover in full. Members → Updates has the running feed.',
  },
  {
    question: 'Can I cancel?',
    answer:
      'Yes, anytime, from your account page. You keep access until the end of the period you already paid for — cancelling on day 2 of a month does not cut you off on day 3.',
  },
  {
    question: "What's the refund policy?",
    answer:
      'The same 14-day, no-questions guarantee as the guide. After that, cancel anytime and you are simply not charged again — there is no long-tail contract.',
  },
];

export default async function Page() {
  const product = await getProductBySlug(GUIDE_INSIDER_SLUG);
  const priceCents = product?.priceCents ?? fallbackPriceCents();
  const currency = product?.currency ?? fallbackCurrency();
  const interval = product?.interval ?? 'month';
  const price = `${formatPrice(priceCents, currency)}/${interval === 'year' ? 'yr' : 'mo'}`;
  const comingSoon = product ? !product.active : true;

  const [updates, resources] = await Promise.all([
    updatesForSite(SITE, 3),
    resourcesForSite(SITE),
  ]);

  return (
    <>
      <EditorialHero
        eyebrow="Paraguay Residency Insider"
        title="The guide, kept current — plus everything a static PDF can't cover."
        sub="A short monthly update whenever the rules move, one deep dive a month on the cases the guide doesn't have room for, and the case studies behind them."
        actions={
          <>
            <Button href="#price">Join Insider</Button>
            <Button href="#whats-inside" variant="secondary">
              See what&apos;s inside
            </Button>
          </>
        }
      />

      {comingSoon && (
        <Section tone="accent">
          <Container width="narrow">
            <p className="text-center text-[var(--text-sm)] text-[var(--fg-muted)]">
              Insider is opening shortly — the checkout below will activate as soon as it does.
            </p>
          </Container>
        </Section>
      )}

      {/* What changes monthly */}
      <Section id="whats-inside">
        <Container width="narrow">
          <Heading level={2}>What changes every month</Heading>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              <strong className="text-[var(--fg)]">An updates feed</strong> — a short note the
              moment a fee, a processing time or a document requirement changes, instead of
              waiting for a once-a-year revision.
            </li>
            <li>
              <strong className="text-[var(--fg)]">A monthly deep dive</strong> — a longer piece
              on exactly the kind of question the twelve-chapter guide doesn&apos;t have room for:
              reading a processing delay correctly, bank-by-bank differences, what changes once
              your cédula is issued but your RUC isn&apos;t yet.
            </li>
            <li>
              <strong className="text-[var(--fg)]">Case studies</strong> — anonymised, real
              filings, not hypotheticals.
            </li>
          </ul>
        </Container>
      </Section>

      {/* Updates feed preview */}
      {updates.length > 0 && (
        <Section tone="alt">
          <Container>
            <Heading level={2}>From the updates feed</Heading>
            <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">
              A preview of what members are reading right now.
            </p>
            <div className="mt-[var(--space-8)] grid gap-[var(--space-4)] sm:grid-cols-3">
              {updates.map((post) => (
                <Card
                  key={post.slug}
                  eyebrow={
                    post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Update'
                  }
                  title={post.title}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Resources teaser */}
      {resources.length > 0 && (
        <Section>
          <Container width="narrow">
            <Heading level={2}>Resources</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Downloadable checklists and packs, kept current alongside the guide.
            </p>
            <ul className="mt-[var(--space-6)] space-y-[var(--space-2)] text-[var(--fg-muted)]">
              {resources.map((resource) => (
                <li key={resource.slug}>
                  {resource.title}
                  {resource.minTier === 'insider' ? ' — Insider' : ' — included with the guide'}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* Price + guarantee */}
      <Section id="price" tone="accent">
        <Container width="narrow">
          <Heading level={2}>{price}</Heading>
          <ul className="mt-[var(--space-4)] space-y-[var(--space-2)] text-[var(--fg-muted)]">
            <li>Cancel anytime, keep access through the period you paid for</li>
            <li>14-day refund on your first charge, no questions</li>
            <li>Everything in the guide, plus the updates feed, deep dives and case studies</li>
          </ul>
          <div className="mt-[var(--space-8)]">
            <CheckoutButton product={GUIDE_INSIDER_SLUG} />
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container width="narrow">
          <FAQ title="Questions" items={FAQ_ITEMS} />
        </Container>
      </Section>

      {/* Not the guide yet? */}
      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>Don&apos;t have the guide yet?</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Start there — it&apos;s the twelve chapters Insider builds on.
          </p>
          <div className="mt-[var(--space-6)]">
            <Link href="/#price" className="text-[var(--accent)] underline underline-offset-2">
              See the guide
            </Link>
          </div>
        </Container>
      </Section>

      <JsonLd
        data={productOfferJsonLd(SITE, {
          name: 'Paraguay Residency Insider',
          description: 'The recurring membership: monthly deep dives, an updates feed and case studies.',
          path: PATH,
          priceCents,
          currency,
          sku: GUIDE_INSIDER_SLUG,
        })}
      />
    </>
  );
}
