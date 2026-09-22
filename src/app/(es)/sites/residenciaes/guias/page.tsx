import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { getHub, getHubs } from '@/content';

const path = '/guias';
const title = "Guías";
const description = "Explora nuestras guías sobre documentos, vida en Paraguay, impuestos y comparativas.";
const labels: Record<string, string> = {
  "comparativas": "Comparativas",
  "documentos": "Documentos",
  "impuestos": "Impuestos",
  "vivir-en-paraguay": "Vivir en Paraguay"
};

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', { title: "Guías de residencia en Paraguay para tu mudanza", description: "Consulta guías sobre residencia en Paraguay, preparación de documentos, impuestos y vida cotidiana para organizar tu mudanza con más claridad.", path });
}

export default function Page() {
  const hubs = getHubs('residenciaes').filter((hub) => getHub('residenciaes', hub).some((post) => !post.frontmatter.draft));
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residenciaes" items={[{ label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residenciaes', { name: title, description, path, items: hubs.map((hub) => ({ name: labels[hub] ?? hub, path: path + '/' + hub })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub) => (
            <Card headingLevel={2} key={hub} title={labels[hub] ?? hub} href={path + '/' + hub}>
              {"Artículos sobre " + (labels[hub] ?? hub).toLocaleLowerCase('es-ES') + '.'}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
