import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Container, Heading, Prose, Section } from '@/components';
import { Mdx } from '@/content/mdx';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { currentMember } from '@/lib/member-auth';
import { entitlementFor } from '@/lib/entitlements';
import { lessonView } from '@/lib/member-content';
import { completeLessonAction } from './actions';

const SITE = 'guide' as const;

export const dynamic = 'force-dynamic';

interface Params {
  module: string;
  lesson: string;
}

async function loadView(params: Params) {
  const user = await currentMember();
  if (!user) redirect('/login');

  const entitlement = await entitlementFor(user);
  const view = await lessonView({
    site: SITE,
    moduleSlug: params.module,
    lessonSlug: params.lesson,
    userId: user.id,
    tier: entitlement.tier,
    firstEntitledAt: entitlement.firstEntitledAt,
  });
  if (!view) notFound();
  return view;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const resolved = await params;
  return siteMetadata(SITE, {
    title: `${resolved.lesson.replace(/-/g, ' ')} — ${t(SITE, 'members.h1')}`,
    description: t(SITE, 'members.sub'),
    path: `/members/${resolved.module}/${resolved.lesson}`,
    noindex: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const view = await loadView(resolved);
  const backHref = `/members`;

  if (!view.unlocked) {
    return (
      <Section>
        <Container width="narrow">
          <Heading level={1}>{view.lesson.title}</Heading>
          {view.reason === 'tier' ? (
            <div className="mt-[var(--space-8)] rounded-[var(--radius-brand)] border border-[var(--accent)] bg-[var(--accent-soft)] p-[var(--space-6)]">
              <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
                {t(SITE, 'members.locked')}
              </p>
              <div className="mt-[var(--space-4)]">
                <Link
                  href="/insider"
                  className="inline-flex items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
                >
                  {t(SITE, 'members.upgrade')}
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-[var(--space-8)] text-[var(--fg-muted)]">
              This lesson opens {view.opensAt ? formatDate(view.opensAt) : 'soon'}.
            </p>
          )}
          <p className="mt-[var(--space-8)]">
            <Link href={backHref} className="text-[var(--accent)] underline underline-offset-2">
              Back to your modules
            </Link>
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container width="narrow">
        <p className="text-[var(--text-sm)] text-[var(--fg-muted)]">
          <Link href={backHref} className="hover:text-[var(--accent)]">
            {view.module.title}
          </Link>
        </p>
        <Heading level={1} className="mt-[var(--space-2)]">
          {view.lesson.title}
        </Heading>

        <Prose className="mt-[var(--space-10)]">
          <Mdx source={view.body ?? ''} site={SITE} />
        </Prose>

        <form action={completeLessonAction} className="mt-[var(--space-10)]">
          <input type="hidden" name="moduleSlug" value={resolved.module} />
          <input type="hidden" name="lessonSlug" value={resolved.lesson} />
          <button
            type="submit"
            disabled={view.completed}
            className="inline-flex items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90 disabled:opacity-60"
          >
            {view.completed ? 'Completed' : 'Mark complete'}
          </button>
        </form>

        <nav className="mt-[var(--space-12)] flex items-center justify-between gap-[var(--space-4)] border-t border-[var(--border)] pt-[var(--space-6)] text-[var(--text-sm)]">
          {view.prev ? (
            <Link
              href={`/members/${view.module.slug}/${view.prev.slug}`}
              className="hover:text-[var(--accent)]"
            >
              ← {view.prev.title}
            </Link>
          ) : (
            <span />
          )}
          {view.next ? (
            <Link
              href={`/members/${view.module.slug}/${view.next.slug}`}
              className="hover:text-[var(--accent)]"
            >
              {view.next.title} →
            </Link>
          ) : (
            <Link href={backHref} className="hover:text-[var(--accent)]">
              Back to modules →
            </Link>
          )}
        </nav>
      </Container>
    </Section>
  );
}
