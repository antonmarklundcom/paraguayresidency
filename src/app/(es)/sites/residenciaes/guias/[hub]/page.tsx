import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { contentHref } from '@/lib/site-pages';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { notFound } from 'next/navigation';
import { getHub, getHubs } from '@/content';

type Params = Promise<{ hub: string }>;
const labels: Record<string, string> = {
  "comparativas": "Comparativas",
  "documentos": "Documentos",
  "impuestos": "Impuestos",
  "vivir-en-paraguay": "Vivir en Paraguay"
};

export function generateStaticParams() {
  return getHubs('residenciaes').filter((hub) => getHub('residenciaes', hub).some((post) => !post.frontmatter.draft)).map((hub) => ({ hub }));
}

function collection(hub: string) {
  const posts = getHub('residenciaes', hub).filter((post) => !post.frontmatter.draft);
  if (!posts.length) notFound();
  const title = labels[hub] ?? hub;
  return { posts, title, description: "Artículos sobre " + title.toLocaleLowerCase('es-ES') + '.', path: '/guias/' + hub };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, description, path } = collection((await params).hub);
  return siteMetadata('residenciaes', { title, description, path });
}

export default async function Page({ params }: { params: Params }) {
  const { posts, title, description, path } = collection((await params).hub);
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residenciaes" items={[{ label: "Guías", href: '/guias' }, { label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residenciaes', { name: title, description, path, items: posts.map((post) => ({ name: post.frontmatter.title, path: contentHref('residenciaes', post.slugPath) })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card headingLevel={2} key={post.slugPath} title={post.frontmatter.title} href={contentHref('residenciaes', post.slugPath)}
              eyebrow={title + ' · ' + new Date(post.frontmatter.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}>
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
