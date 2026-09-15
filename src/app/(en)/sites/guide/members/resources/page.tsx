import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { requireTier, hasTier } from '@/lib/entitlements';
import { resourcesForSite } from '@/lib/member-content';

const SITE = 'guide' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Resources — Paraguay Residency Guide',
    description: 'Downloadable checklists and packs, kept current.',
    path: '/members/resources',
    noindex: true,
  });
}

export default async function Page() {
  const member = await requireTier('entry');
  const resources = await resourcesForSite(SITE);

  return (
    <Section>
      <Container width="narrow">
        <p className="text-[var(--text-sm)]">
          <Link href="/members" className="hover:text-[var(--accent)]">
            ← Back to your modules
          </Link>
        </p>
        <Heading level={1} className="mt-[var(--space-4)]">
          Resources
        </Heading>
        <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
          Downloadable checklists and packs, kept current alongside the guide.
        </p>

        {resources.length === 0 ? (
          <p className="mt-[var(--space-8)] text-[var(--fg-muted)]">Nothing here yet.</p>
        ) : (
          <ul className="mt-[var(--space-10)] space-y-[var(--space-4)]">
            {resources.map((resource) => {
              const unlocked = hasTier(member.tier, resource.minTier);
              return (
                <li
                  key={resource.slug}
                  className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)]"
                >
                  <div className="flex items-center justify-between gap-[var(--space-4)]">
                    <div>
                      <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--fg-muted)]">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    {unlocked ? (
                      <a
                        href={`/members/resources/${resource.slug}/download`}
                        className="shrink-0 rounded-[var(--radius-brand)] bg-[var(--accent)] px-4 py-2 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
                      >
                        Download
                      </a>
                    ) : (
                      <Link
                        href="/insider"
                        className="shrink-0 rounded-[var(--radius-brand)] border border-[var(--border)] px-4 py-2 text-[var(--text-sm)] hover:border-[var(--accent)]"
                      >
                        Insider only
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}
