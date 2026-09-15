import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Heading, Section } from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { requireTier } from '@/lib/entitlements';
import { lemonSqueezyPortalUrl } from '@/lib/subscription-portal';

const SITE = 'guide' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Your account — Paraguay Residency Guide',
    description: 'Tier, expiry and subscription management.',
    path: '/account',
    noindex: true,
  });
}

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function Page() {
  const member = await requireTier('entry');
  const portalUrl = member.tier === 'insider' ? await lemonSqueezyPortalUrl(member.user.id) : null;
  const expiresAt = formatDate(member.expiresAt);

  return (
    <Section>
      <Container width="narrow">
        <p className="text-[var(--text-sm)]">
          <Link href="/members" className="hover:text-[var(--accent)]">
            ← Back to your modules
          </Link>
        </p>
        <Heading level={1} className="mt-[var(--space-4)]">
          Your account
        </Heading>

        <dl className="mt-[var(--space-8)] space-y-[var(--space-4)] text-[var(--text-sm)]">
          <div className="flex items-center justify-between gap-[var(--space-4)] border-b border-[var(--border)] pb-[var(--space-4)]">
            <dt className="text-[var(--fg-muted)]">{t(SITE, 'form.email')}</dt>
            <dd>{member.user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-[var(--space-4)] border-b border-[var(--border)] pb-[var(--space-4)]">
            <dt className="text-[var(--fg-muted)]">Membership</dt>
            <dd>{t(SITE, `members.tier.${member.tier}`)}</dd>
          </div>
          {expiresAt && (
            <div className="flex items-center justify-between gap-[var(--space-4)] border-b border-[var(--border)] pb-[var(--space-4)]">
              <dt className="text-[var(--fg-muted)]">
                {member.tier === 'insider' ? 'Renews / access until' : 'Access until'}
              </dt>
              <dd>{expiresAt}</dd>
            </div>
          )}
        </dl>

        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-4)]">
          {member.tier === 'insider' ? (
            portalUrl ? (
              <a
                href={portalUrl}
                rel="noopener"
                className="inline-flex items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
              >
                Manage subscription
              </a>
            ) : (
              <p className="text-[var(--text-sm)] text-[var(--fg-muted)]">
                To change or cancel your subscription, email us and we&apos;ll help directly.
              </p>
            )
          ) : (
            <Link
              href="/insider"
              className="inline-flex items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
            >
              Join Insider
            </Link>
          )}
        </div>

        <p className="mt-[var(--space-10)] text-[var(--text-sm)]">
          <a href="/api/auth/logout" className="underline underline-offset-4">
            {t(SITE, 'login.logout')}
          </a>
        </p>
      </Container>
    </Section>
  );
}
