import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Container, Heading, Section } from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { requireTier } from '@/lib/entitlements';
import { continueLesson, memberDashboard, type ModuleCard } from '@/lib/member-content';

const SITE = 'guide' as const;

/** Reads the signed-in member's rows on every request. Never prerendered. */
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'members.h1'),
    description: t(SITE, 'members.sub'),
    path: '/members',
    noindex: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function ModuleBlock({ card }: { card: ModuleCard }) {
  if (card.state === 'locked') {
    return (
      <div className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-6)]">
        <div className="flex items-center justify-between gap-[var(--space-4)]">
          <div>
            <Heading level={3}>{card.module.title}</Heading>
            <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--fg-muted)]">
              {t(SITE, 'members.locked')}
            </p>
          </div>
          <Link
            href="/insider"
            className="shrink-0 rounded-[var(--radius-brand)] bg-[var(--accent)] px-4 py-2 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
          >
            {t(SITE, 'members.upgrade')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)]">
      <div className="flex items-center justify-between gap-[var(--space-4)]">
        <Heading level={3}>{card.module.title}</Heading>
        {card.lessonCount > 0 && (
          <span className="shrink-0 text-[var(--text-xs)] text-[var(--fg-muted)]">
            {card.completedCount}/{card.lessonCount}
          </span>
        )}
      </div>
      {card.module.description && (
        <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          {card.module.description}
        </p>
      )}

      {card.state === 'dripped' ? (
        <p className="mt-[var(--space-4)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Opens {card.opensAt ? formatDate(card.opensAt) : 'soon'}.
        </p>
      ) : (
        <ul className="mt-[var(--space-4)] space-y-[var(--space-2)]">
          {card.lessons.map(({ lesson, unlocked, completed }) => (
            <li key={lesson.id} className="flex items-center gap-[var(--space-3)]">
              <span
                aria-hidden="true"
                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  completed
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {completed ? '✓' : ''}
              </span>
              {unlocked ? (
                <Link
                  href={`/members/${card.module.slug}/${lesson.slug}`}
                  className="text-[var(--text-sm)] hover:text-[var(--accent)] hover:underline"
                >
                  {lesson.title}
                </Link>
              ) : (
                <span className="text-[var(--text-sm)] text-[var(--fg-muted)]">
                  {lesson.title} — opens soon
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function Page() {
  const member = await requireTier('entry');
  const tierKey = `members.tier.${member.tier}`;

  const cards = await memberDashboard({
    site: SITE,
    userId: member.user.id,
    tier: member.tier,
    firstEntitledAt: member.firstEntitledAt,
  });
  const next = continueLesson(cards);

  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(SITE, 'members.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(SITE, 'members.sub')}</p>

        <dl className="mt-[var(--space-8)] grid gap-[var(--space-2)] text-[var(--text-sm)]">
          <div className="flex gap-[var(--space-3)]">
            <dt className="text-[var(--fg-muted)]">{t(SITE, 'form.email')}</dt>
            <dd>{member.user.email}</dd>
          </div>
          <div className="flex gap-[var(--space-3)]">
            <dt className="text-[var(--fg-muted)]">{t(SITE, 'members.tier.insider')}</dt>
            <dd>{t(SITE, tierKey)}</dd>
          </div>
        </dl>

        {next && (
          <div className="mt-[var(--space-8)] rounded-[var(--radius-brand)] border border-[var(--accent)] bg-[var(--accent-soft)] p-[var(--space-6)]">
            <p className="text-[var(--text-sm)] text-[var(--fg-muted)]">Continue where you left off</p>
            <p className="mt-[var(--space-1)] font-[family-name:var(--display-font)] text-[var(--text-lg)]">
              {next.title}
            </p>
            <div className="mt-[var(--space-4)]">
              <Button href={`/members/${next.moduleSlug}/${next.lessonSlug}`}>Continue</Button>
            </div>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="mt-[var(--space-8)] rounded-[var(--radius)] border border-[var(--border)] p-[var(--space-6)]">
            <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
              {t(SITE, 'members.emptyTitle')}
            </p>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{t(SITE, 'members.emptyBody')}</p>
          </div>
        ) : (
          <div className="mt-[var(--space-10)] space-y-[var(--space-4)]">
            {cards.map((card) => (
              <ModuleBlock key={card.module.id} card={card} />
            ))}
          </div>
        )}

        <nav className="mt-[var(--space-10)] flex flex-wrap gap-[var(--space-6)] text-[var(--text-sm)]">
          <Link href="/members/updates" className="underline underline-offset-4">
            Updates
          </Link>
          <Link href="/members/resources" className="underline underline-offset-4">
            Resources
          </Link>
          <Link href="/account" className="underline underline-offset-4">
            Account
          </Link>
          <a href="/api/auth/logout" className="underline underline-offset-4">
            {t(SITE, 'login.logout')}
          </a>
        </nav>
      </Container>
    </Section>
  );
}
