import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { getHub, getHubs } from '@/content';

const path = '/guides';
const title = "Guides";
const description = "Explore guides to documents, daily life, taxes and residency comparisons.";
const labels: Record<string, string> = {
  "comparisons": "Comparisons",
  "documents": "Documents",
  "living-in-paraguay": "Living in Paraguay",
  "taxes": "Taxes"
};

export function generateMetadata(): Metadata {
  return siteMetadata('residency', { title: "Paraguay Residency Guides: Documents, Tax and Life", description: "Explore practical guides to Paraguay residency, document preparation, tax questions and daily life, with comparisons to help plan your next step.", path });
}

export default function Page() {
  const hubs = getHubs('residency').filter((hub) => getHub('residency', hub).some((post) => !post.frontmatter.draft));
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residency" items={[{ label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residency', { name: title, description, path, items: hubs.map((hub) => ({ name: labels[hub] ?? hub, path: path + '/' + hub })) })} />
        <Heading level={1}>{title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub) => (
            <Card headingLevel={2} key={hub} title={labels[hub] ?? hub} href={path + '/' + hub}>
              {"Articles about " + (labels[hub] ?? hub).toLocaleLowerCase('en-US') + '.'}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
