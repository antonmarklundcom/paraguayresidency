import type { Metadata } from 'next';
import { Container, Heading, Section } from '@/components';
import { MagicLinkForm } from '@/components/MagicLinkForm';
import { loginMetadata, firstParam, type SearchParams } from '@/lib/conversion-pages';
import { t } from '@/i18n';

const SITE = 'guide' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return loginMetadata(SITE);
}

/**
 * The Guide's own sign-in page (plan §6.9 restyles O9's shared body). The
 * wiring — `/api/auth/magic`, the neutral "check your inbox" response, the
 * honeypot — lives in `MagicLinkForm`/`MagicLinkFormFields` and stays
 * off-limits; this is the brand-specific chrome around it.
 */
export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = firstParam(params, 'error');
  const errorKey =
    error === 'expired' ? 'login.expired' : error === 'invalid' ? 'login.invalid' : null;

  return (
    <Section tone="alt">
      <Container width="narrow">
        <Heading level={1}>{t(SITE, 'login.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
          Sign in to read your guide, track your progress and manage your Insider membership.
        </p>
        <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{t(SITE, 'login.sub')}</p>
        {errorKey ? (
          <p
            role="alert"
            className="mt-[var(--space-6)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text-sm)]"
          >
            {t(SITE, errorKey)}
          </p>
        ) : null}
        <div className="mt-[var(--space-8)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)]">
          <MagicLinkForm site={SITE} />
        </div>
      </Container>
    </Section>
  );
}
