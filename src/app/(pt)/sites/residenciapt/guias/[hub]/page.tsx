import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { contentHref } from '@/lib/site-pages';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { notFound } from 'next/navigation';
import { getHub, getHubs } from '@/content';

type Params = Promise<{ hub: string }>;
const labels: Record<string, string> = {
  "comparativos": "Comparativos",
  "documentos": "Documentos",
  "impostos": "Impostos",
  "morar-no-paraguai": "Morar no Paraguai"
};

export function generateStaticParams() {
  return getHubs('residenciapt').filter((hub) => getHub('residenciapt', hub).some((post) => !post.frontmatter.draft)).map((hub) => ({ hub }));
}

function collection(hub: string) {
  const posts = getHub('residenciapt', hub).filter((post) => !post.frontmatter.draft);
  if (!posts.length) notFound();
  const title = labels[hub] ?? hub;
  return { posts, title, description: "Artigos sobre " + title.toLocaleLowerCase('pt-BR') + '.', path: '/guias/' + hub };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, description, path } = collection((await params).hub);
  return siteMetadata('residenciapt', { title, description, path });
}

export default async function Page({ params }: { params: Params }) {
  const { posts, title, description, path } = collection((await params).hub);
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residenciapt" items={[{ label: "Guias", href: '/guias' }, { label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residenciapt', { name: title, description, path, items: posts.map((post) => ({ name: post.frontmatter.title, path: contentHref('residenciapt', post.slugPath) })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card headingLevel={2} key={post.slugPath} title={post.frontmatter.title} href={contentHref('residenciapt', post.slugPath)}
              eyebrow={title + ' · ' + new Date(post.frontmatter.publishedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}>
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
