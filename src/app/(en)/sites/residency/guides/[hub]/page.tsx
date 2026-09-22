import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { contentHref } from '@/lib/site-pages';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { notFound } from 'next/navigation';
import { getHub, getHubs } from '@/content';

type Params = Promise<{ hub: string }>;
const labels: Record<string, string> = {
  "comparisons": "Comparisons",
  "documents": "Documents",
  "living-in-paraguay": "Living in Paraguay",
  "taxes": "Taxes"
};

export function generateStaticParams() {
  return getHubs('residency').filter((hub) => getHub('residency', hub).some((post) => !post.frontmatter.draft)).map((hub) => ({ hub }));
}

function collection(hub: string) {
  const posts = getHub('residency', hub).filter((post) => !post.frontmatter.draft);
  if (!posts.length) notFound();
  const title = labels[hub] ?? hub;
  return { posts, title, description: "Articles about " + title.toLocaleLowerCase('en-US') + '.', path: '/guides/' + hub };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, description, path } = collection((await params).hub);
  return siteMetadata('residency', { title, description, path });
}

export default async function Page({ params }: { params: Params }) {
  const { posts, title, description, path } = collection((await params).hub);
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residency" items={[{ label: "Guides", href: '/guides' }, { label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residency', { name: title, description, path, items: posts.map((post) => ({ name: post.frontmatter.title, path: contentHref('residency', post.slugPath) })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card headingLevel={2} key={post.slugPath} title={post.frontmatter.title} href={contentHref('residency', post.slugPath)}
              eyebrow={title + ' · ' + new Date(post.frontmatter.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}>
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
