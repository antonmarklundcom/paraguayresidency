import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Heading, Prose, Section } from '@/components';
import { Mdx } from '@/content/mdx';
import { siteMetadata } from '@/lib/metadata';
import { requireTier, hasTier } from '@/lib/entitlements';
import { updatesForSite, updateBody } from '@/lib/member-content';

const SITE = 'guide' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Updates — Paraguay Residency Guide',
    description: 'What changed, as we see it — the Insider updates feed.',
    path: '/members/updates',
    noindex: true,
  });
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function Page() {
  const member = await requireTier('entry');
  const posts = await updatesForSite(SITE);

  return (
    <Section>
      <Container width="narrow">
        <p className="text-[var(--text-sm)]">
          <Link href="/members" className="hover:text-[var(--accent)]">
            ← Back to your modules
          </Link>
        </p>
        <Heading level={1} className="mt-[var(--space-4)]">
          Updates
        </Heading>
        <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
          Whatever changed, as we see it — no waiting for a once-a-year revision.
        </p>

        {posts.length === 0 ? (
          <p className="mt-[var(--space-8)] text-[var(--fg-muted)]">Nothing posted yet.</p>
        ) : (
          <div className="mt-[var(--space-10)] space-y-[var(--space-10)]">
            {posts.map((post) => {
              const unlocked = hasTier(member.tier, post.minTier);
              return (
                <article
                  key={post.slug}
                  className="border-b border-[var(--border)] pb-[var(--space-8)] last:border-none"
                >
                  <p className="text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
                    {formatDate(post.publishedAt)}
                  </p>
                  <Heading level={2} className="mt-[var(--space-2)]">
                    {post.title}
                  </Heading>
                  {unlocked ? (
                    <Prose className="mt-[var(--space-4)]">
                      <Mdx source={updateBody(post) ?? ''} site={SITE} />
                    </Prose>
                  ) : (
                    <div className="mt-[var(--space-4)] rounded-[var(--radius-brand)] border border-[var(--accent)] bg-[var(--accent-soft)] p-[var(--space-6)]">
                      <p className="text-[var(--fg-muted)]">This update is part of Insider.</p>
                      <div className="mt-[var(--space-4)]">
                        <Link
                          href="/insider"
                          className="inline-flex items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
                        >
                          See what Insider includes
                        </Link>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
