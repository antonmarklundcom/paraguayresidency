import { notFound } from 'next/navigation';
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

export function ArticlePage({ site, slugPath }: { site: SiteKey; slugPath: string }) {
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
          <Mdx source={page.body} />
        </Prose>
        {frontmatter.faq.length > 0 && (
          <div className="mt-[var(--space-16)]">
            <FAQ title={t(site, 'common.faqTitle')} items={frontmatter.faq} />
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
