import Link from 'next/link';
import type { Metadata } from 'next';
import { Container, Heading, Section } from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { NewsletterForm } from '@/components/NewsletterForm';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { confirmSubscription, unsubscribe } from '@/lib/subscribers';
import { getSite, type SiteKey } from '@/sites/registry';

/**
 * The pages O2 owns because they are conversion machinery rather than brand
 * content: contact, booking, newsletter confirm/unsubscribe. S3–S5 restyle
 * them inside their brand; the wiring stays here (plan §6 Sonnet limits).
 */

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function firstParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/* ------------------------------------------------------------------ contact */

export function contactMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'contact.metaTitle'),
    description: t(site, 'contact.metaDescription'),
    path: '/contact',
  });
}

export function ContactPage({ site }: { site: SiteKey }) {
  // The Investor Pass brand qualifies people by capital and route, so it gets
  // the richer inquiry form; the other two ask the shortest set that works.
  const variant = site === 'investorpass' ? 'investor_inquiry' : 'contact';
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'contact.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'contact.sub')}</p>
        <div className="mt-[var(--space-10)]">
          <LeadForm site={site} variant={variant} pagePath="/contact" />
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ booking */

/** Approved extra (plan §3b): Cal.com/Calendly embed when set, form otherwise. */
export function bookingUrl(): string | null {
  const url = (process.env.NEXT_PUBLIC_BOOKING_URL ?? '').trim();
  return url.startsWith('https://') ? url : null;
}

export function bookMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'book.metaTitle'),
    description: t(site, 'book.metaDescription'),
    path: '/book',
  });
}

export function BookPage({ site }: { site: SiteKey }) {
  const url = bookingUrl();
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'book.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'book.sub')}</p>
        <div className="mt-[var(--space-10)]">
          {url ? (
            <iframe
              src={url}
              title={t(site, 'book.h1')}
              className="h-[46rem] w-full rounded-[var(--radius-brand)] border border-[var(--border)]"
              loading="lazy"
            />
          ) : (
            <>
              <p className="mb-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
                {t(site, 'book.fallback')}
              </p>
              <LeadForm site={site} variant="consultation" pagePath="/book" />
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------- newsletter confirm */

export function confirmMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'confirm.metaTitle'),
    description: t(site, 'confirm.metaDescription'),
    path: '/confirm',
    noindex: true,
  });
}

export async function ConfirmPage({
  site,
  searchParams,
}: {
  site: SiteKey;
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const state = await confirmSubscription(firstParam(params, 'token'));
  const bodyKey =
    state === 'confirmed'
      ? 'confirm.done'
      : state === 'already-confirmed'
        ? 'confirm.already'
        : 'confirm.unknown';

  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'confirm.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, bodyKey)}</p>
        {state === 'unknown-token' ? (
          <div className="mt-[var(--space-8)]">
            <NewsletterForm site={site} source="confirm-retry" />
          </div>
        ) : null}
        <p className="mt-[var(--space-8)]">
          <Link href="/" className="text-[var(--accent)] underline underline-offset-2">
            {t(site, 'common.backHome')}
          </Link>
        </p>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- unsubscribe */

export function unsubscribeMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'unsubscribe.metaTitle'),
    description: t(site, 'unsubscribe.metaDescription'),
    path: '/unsubscribe',
    noindex: true,
  });
}

export async function UnsubscribePage({
  site,
  searchParams,
}: {
  site: SiteKey;
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const state = await unsubscribe(firstParam(params, 'u'));
  const bodyKey =
    state === 'unsubscribed'
      ? 'unsubscribe.done'
      : state === 'not-found'
        ? 'unsubscribe.notFound'
        : 'unsubscribe.bad';

  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'unsubscribe.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, bodyKey)}</p>
        <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          {t(site, 'unsubscribe.note', { brand: getSite(site).name })}
        </p>
      </Container>
    </Section>
  );
}
