import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs, Container, FAQ, Heading, Prose, Section } from '@/components';
import { Mdx } from '@/content/mdx';
import { getPage } from '@/content';
import { siteMetadata } from '@/lib/metadata';
import { contentHref } from '@/lib/site-pages';
import { t } from '@/i18n';
import { siteOrigin, type SiteKey } from '@/sites/registry';
import { JsonLd } from '@/components/JsonLd';

/** Shared renderer for every brand's MDX article route. */
export function articleMetadata(site: SiteKey, slugPath: string): Metadata {
  const page = getPage(site, slugPath);
  if (!page) return {};
  return siteMetadata(site, {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    path: contentHref(site, slugPath),
    type: 'article',
    publishedTime: page.frontmatter.publishedAt,
    modifiedTime: page.frontmatter.updatedAt,
  });
}

export interface ArticleLink {
  label: string;
  href: string;
}

/**
 * Optional "continue reading" block (plan §6.1 quality bar: every article
 * links to its hub + 2 related + one service page + the Route Finder). Purely
 * additive — a brand that passes nothing renders exactly as before.
 */
export function ArticlePage({
  site,
  slugPath,
  relatedLinks,
  serviceLink,
  routeFinderHref = '/route-finder',
}: {
  site: SiteKey;
  slugPath: string;
  relatedLinks?: ArticleLink[];
  serviceLink?: ArticleLink;
  routeFinderHref?: string;
}) {
  const page = getPage(site, slugPath);
  if (!page) notFound();

  const { frontmatter } = page;

  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs
          site={site}
          items={[{ label: frontmatter.title, href: contentHref(site, slugPath) }]}
        />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{frontmatter.title}</Heading>
          <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
            {frontmatter.description}
          </p>
        </header>
        <Prose className="mt-[var(--space-12)]">
          <Mdx source={page.body} site={site} />
        </Prose>
        {frontmatter.faq.length > 0 && (
          <div className="mt-[var(--space-16)]">
            <FAQ title={t(site, 'common.faqTitle')} items={frontmatter.faq} />
          </div>
        )}
        {(relatedLinks?.length || serviceLink) && (
          <nav
            aria-label="Continue reading"
            className="mt-[var(--space-16)] grid gap-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-8)] sm:grid-cols-2"
          >
            {relatedLinks?.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-5)] transition-colors duration-[var(--duration)] hover:border-[var(--accent)]"
              >
                <span className="text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
                  {t(site, 'common.readMore')}
                </span>
                <span className="mt-[var(--space-1)] block font-[family-name:var(--display-font)]">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        )}
        {(serviceLink || routeFinderHref) && (
          <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
            {serviceLink && (
              <Link
                href={serviceLink.href}
                className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] hover:opacity-90"
              >
                {serviceLink.label}
              </Link>
            )}
            {routeFinderHref && (
              <Link
                href={routeFinderHref}
                className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] border border-[var(--border)] px-5 py-3 text-[var(--text-sm)] font-medium hover:border-[var(--accent)]"
              >
                {t(site, 'nav.routeFinder')}
              </Link>
            )}
          </div>
        )}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: frontmatter.title,
            description: frontmatter.description,
            datePublished: frontmatter.publishedAt,
            dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
            mainEntityOfPage: `${siteOrigin(site)}${contentHref(site, slugPath)}`,
          }}
        />
      </Container>
    </Section>
  );
}
