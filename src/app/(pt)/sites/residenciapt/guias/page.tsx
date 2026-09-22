import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { getHub, getHubs } from '@/content';

const path = '/guias';
const title = "Guias";
const description = "Explore nossos guias sobre documentos, vida no Paraguai, impostos e comparativos.";
const labels: Record<string, string> = {
  "comparativos": "Comparativos",
  "documentos": "Documentos",
  "impostos": "Impostos",
  "morar-no-paraguai": "Morar no Paraguai"
};

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', { title, description, path });
}

export default function Page() {
  const hubs = getHubs('residenciapt').filter((hub) => getHub('residenciapt', hub).some((post) => !post.frontmatter.draft));
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residenciapt" items={[{ label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residenciapt', { name: title, description, path, items: hubs.map((hub) => ({ name: labels[hub] ?? hub, path: path + '/' + hub })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub) => (
            <Card headingLevel={2} key={hub} title={labels[hub] ?? hub} href={path + '/' + hub}>
              {"Artigos sobre " + (labels[hub] ?? hub).toLocaleLowerCase('pt-BR') + '.'}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
