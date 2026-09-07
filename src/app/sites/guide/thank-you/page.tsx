import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Container, Heading, Section } from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { firstParam, type SearchParams } from '@/lib/conversion-pages';
import { resolveThankYou } from '@/lib/thank-you';
import { siteOrigin } from '@/sites/registry';

const SITE = 'guide' as const;

/** Reads the order for this session on every request. */
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'thankYou.metaTitle'),
    description: t(SITE, 'thankYou.metaDescription'),
    path: '/thank-you',
    noindex: true,
  });
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const state = await resolveThankYou(firstParam(params, 'session_id'));

  return (
    <>
      <Section>
        <Container width="narrow">
          <Heading level={1}>{t(SITE, 'thankYou.h1')}</Heading>

          {state.status === 'ready' ? (
            <>
              <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
                {t(SITE, 'thankYou.ready')}
              </p>
              <div className="mt-[var(--space-8)]">
                <Button href={state.url} external>
                  {t(SITE, 'thankYou.download')}
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
              {state.status === 'pending'
                ? t(SITE, 'thankYou.pending')
                : t(SITE, 'thankYou.unknown')}
            </p>
          )}

          <p className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
            {t(SITE, 'thankYou.emailNote')}
          </p>
        </Container>
      </Section>

      {/* The upsell the whole funnel exists for (plan §1.2). */}
      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>{t(SITE, 'thankYou.upsellTitle')}</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            {t(SITE, 'thankYou.upsellBody')}
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-4)]">
            <Button href={`${siteOrigin('residency')}/book`} external>
              {t(SITE, 'thankYou.upsellCta')}
            </Button>
            <Link
              href={`${siteOrigin('investorpass')}/contact`}
              className="self-center text-[var(--text-sm)] underline underline-offset-4"
            >
              {t(SITE, 'thankYou.upsellSecondary')}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
