import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Container, Heading, Section, WhatsAppButton } from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { MagicLinkForm } from '@/components/MagicLinkForm';
import { NewsletterForm } from '@/components/NewsletterForm';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
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

/**
 * One contact page for every brand. No booked calls (Anton, 2026-09-24): the
 * visitor writes on WhatsApp, or sends the form; the short leave-your-number
 * form sits behind a disclosure (F-014) for people who want us to write first.
 * Every form lead reaches VenderCRM, keyed on the phone.
 */
export function ContactPage({ site, whatsappMessage }: { site: SiteKey; whatsappMessage?: string }) {
  // The Investor Pass brand qualifies people by capital and route, so it gets
  // the richer inquiry form; the others ask the shortest set that works.
  const variant = site === 'investorpass' ? 'investor_inquiry' : 'contact';
  const message = whatsappMessage ?? t(site, 'whatsapp.prefill');
  const whatsapp = whatsappHref(message);
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'contact.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'contact.sub')}</p>
        <div className="mt-[var(--space-8)] flex flex-wrap items-center gap-x-4 gap-y-3">
          <WhatsAppButton site={site} message={message} placement="contact" />
          <span className="text-(length:--text-sm) text-[var(--fg-muted)]">{t(site, 'contact.orForm')}</span>
        </div>
        <div className="mt-[var(--space-8)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <Heading level={2} className="!text-(length:--text-xl)">{t(site, 'process.fullForm')}</Heading>
          <div className="mt-[var(--space-4)]">
            <LeadForm site={site} variant={variant} pagePath="/contact" />
          </div>
          <details className="mt-[var(--space-8)] border-t border-[var(--border)] pt-[var(--space-4)]">
            <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsappAlternative')}</summary>
            {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsapp')}</a>}
            <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'process.whatsappIntro')}</p>
            <LeadForm site={site} variant="whatsapp" pagePath="/contact" />
          </details>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ booking */

export function bookMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: t(site, 'book.metaTitle'),
    description: t(site, 'book.metaDescription'),
    path: '/book',
    noindex: true,
  });
}

/**
 * No booked calls (Anton, 2026-09-24): people write on WhatsApp or send the
 * form and get a written answer. `/book` stays as a permanent redirect so old
 * links and bookmarks land on the contact page instead of a 404.
 */
export function BookPage(): never {
  permanentRedirect('/contact');
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
        <p className="mt-[var(--space-8)] text-(length:--text-sm) text-[var(--fg-muted)]">
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
            className="mt-[var(--space-6)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-(length:--text-sm)"
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

        <dl className="mt-[var(--space-8)] grid gap-[var(--space-2)] text-(length:--text-sm)">
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
          <p className="font-[family-name:var(--display-font)] text-(length:--text-lg)">
            {t(site, 'members.emptyTitle')}
          </p>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            {t(site, 'members.emptyBody')}
          </p>
        </div>

        <p className="mt-[var(--space-8)] text-(length:--text-sm)">
          <a href="/api/auth/logout" className="underline underline-offset-4">
            {t(site, 'login.logout')}
          </a>
        </p>
      </Container>
    </Section>
  );
}
