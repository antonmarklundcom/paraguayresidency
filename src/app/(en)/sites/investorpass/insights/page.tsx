import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { contentHref } from '@/lib/site-pages';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { getHub } from '@/content';

const path = '/insights';
const title = "Insights";
const description = "Articles on the Paraguay Investor Pass, investment routes and residency planning.";

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', { title: "Paraguay Investor Pass: Insights and Planning", description: "Read practical insights on Paraguay investor residency, qualifying investment routes and document preparation before discussing your plans.", path });
}

export default function Page() {
  const posts = getHub('investorpass', 'insights').filter((post) => !post.frontmatter.draft);
  return (
    <Section>
      <Container>
        <Breadcrumbs site="investorpass" items={[{ label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('investorpass', { name: title, description, path, items: posts.map((post) => ({ name: post.frontmatter.title, path: contentHref('investorpass', post.slugPath) })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card headingLevel={2} key={post.slugPath} title={post.frontmatter.title} href={contentHref('investorpass', post.slugPath)}
              eyebrow={title + ' · ' + new Date(post.frontmatter.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}>
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
