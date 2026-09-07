import type { Metadata } from 'next';
import { CheckoutButton, Container, Heading, NewsletterForm, Section } from '@/components';
import { PlaceholderHome } from '@/lib/site-pages';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';

const SITE = 'guide' as const;

/** Reads the live price from the `products` row on every request. */
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'home.h1'),
    description: t(SITE, 'home.sub'),
    path: '/',
  });
}

export default function Page() {
  return (
    <>
      <PlaceholderHome site={SITE} />
      {/*
        The offer strip is O2's, not S5's: it is the live end of the checkout
        path (button → /api/checkout → Stripe → webhook → /thank-you). S5
        replaces the page around it with the real long-form sales page and
        keeps these two components.
      */}
      <Section id="offer" tone="accent">
        <Container width="narrow">
          <Heading level={2}>{t(SITE, 'guideOffer.title')}</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            {t(SITE, 'guideOffer.body')}
          </p>
          <div className="mt-[var(--space-8)]">
            <CheckoutButton />
          </div>
          <div className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-8)]">
            <p className="mb-[var(--space-4)] text-[var(--text-sm)] text-[var(--fg-muted)]">
              {t(SITE, 'guideOffer.newsletter')}
            </p>
            <NewsletterForm site={SITE} source="guide-home" />
          </div>
        </Container>
      </Section>
    </>
  );
}
