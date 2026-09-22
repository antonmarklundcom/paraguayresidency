import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { contentHref } from '@/lib/site-pages';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { getHub } from '@/content';

const path = '/guider';
const title = "Guider";
const description = "Praktiska guider om flytten till Paraguay, uppehållstillstånd och vardagen.";

export function generateMetadata(): Metadata {
  return siteMetadata('flytta', { title, description, path });
}

export default function Page() {
  const posts = getHub('flytta', 'guider').filter((post) => !post.frontmatter.draft);
  return (
    <Section>
      <Container>
        <Breadcrumbs site="flytta" items={[{ label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('flytta', { name: title, description, path, items: posts.map((post) => ({ name: post.frontmatter.title, path: contentHref('flytta', post.slugPath) })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card headingLevel={2} key={post.slugPath} title={post.frontmatter.title} href={contentHref('flytta', post.slugPath)}
              eyebrow={title + ' · ' + new Date(post.frontmatter.publishedAt).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}>
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
