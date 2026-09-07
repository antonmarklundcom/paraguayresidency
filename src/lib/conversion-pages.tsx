import Link from 'next/link';
import type { Metadata } from 'next';
import { Container, Heading, Section } from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { MagicLinkForm } from '@/components/MagicLinkForm';
import { NewsletterForm } from '@/components/NewsletterForm';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { confirmSubscription, unsubscribe } from '@/lib/subscribers';
import { requireTier } from '@/lib/entitlements';
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

/* ------------------------------------------------------------ member login */

export function loginMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'login.h1'),
    description: t(site, 'login.sub'),
    path: '/login',
    // A sign-in page has nothing to rank for and everything to leak.
    noindex: true,
  });
}

/**
 * The sign-in page (plan §5.4.5). S14 restyles it inside the Guide brand; the
 * wiring — the API route it posts to, the neutral responses, the honeypot —
 * stays here and is off-limits to Sonnet phases (plan §4.7).
 */
export async function LoginPage({ site, searchParams }: { site: SiteKey; searchParams: SearchParams }) {
  const params = await searchParams;
  const error = firstParam(params, 'error');
  const errorKey =
    error === 'expired' ? 'login.expired' : error === 'invalid' ? 'login.invalid' : null;

  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'login.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'login.sub')}</p>
        {errorKey ? (
          <p
            role="alert"
            className="mt-[var(--space-6)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-[var(--text-sm)]"
          >
            {t(site, errorKey)}
          </p>
        ) : null}
        <div className="mt-[var(--space-8)]">
          <MagicLinkForm site={site} />
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------- member account */

export function membersMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'members.h1'),
    description: t(site, 'members.sub'),
    path: '/members',
    noindex: true,
  });
}

/**
 * The member landing page. O9 ships only what proves the gate works: who you
 * are, what tier the ENTITLEMENT ROWS say you have (never `users.tier`), and
 * the sign-out link. S14 builds the lessons, resources and updates on top.
 */
export async function MembersPage({ site }: { site: SiteKey }) {
  const member = await requireTier('entry');
  const tierKey = `members.tier.${member.tier}`;

  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'members.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'members.sub')}</p>

        <dl className="mt-[var(--space-8)] grid gap-[var(--space-2)] text-[var(--text-sm)]">
          <div className="flex gap-[var(--space-3)]">
            <dt className="text-[var(--fg-muted)]">{t(site, 'form.email')}</dt>
            <dd>{member.user.email}</dd>
          </div>
          <div className="flex gap-[var(--space-3)]">
            <dt className="text-[var(--fg-muted)]">{t(site, 'members.tier.insider')}</dt>
            <dd>{t(site, tierKey)}</dd>
          </div>
        </dl>

        <div className="mt-[var(--space-8)] rounded-[var(--radius)] border border-[var(--border)] p-[var(--space-6)]">
          <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
            {t(site, 'members.emptyTitle')}
          </p>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            {t(site, 'members.emptyBody')}
          </p>
        </div>

        <p className="mt-[var(--space-8)] text-[var(--text-sm)]">
          <a href="/api/auth/logout" className="underline underline-offset-4">
            {t(site, 'login.logout')}
          </a>
        </p>
      </Container>
    </Section>
  );
}
