import type { Metadata } from 'next';
import { Breadcrumbs, Card, Container, Heading, JsonLd, Section } from '@/components';
import { contentHref } from '@/lib/site-pages';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { notFound } from 'next/navigation';
import { getHub, getHubs } from '@/content';
import { NATIONALITIES, NationalityGrid } from '../../_lib/por-pais';

type Params = Promise<{ hub: string }>;
const labels: Record<string, string> = {
  "comparativas": "Comparativas",
  "documentos": "Documentos",
  "impuestos": "Impuestos",
  "por-pais": "Por país",
  "vivir-en-paraguay": "Vivir en Paraguay"
};

/**
 * A hub that is more than a list of articles gets its own H1, meta and intro.
 * `por-pais` is the nationality selector (seo-gap.md §2): every nationality
 * page, including the four older ones that live under `documentos`.
 */
const HUB_COPY: Record<string, { h1: string; metaTitle: string; metaDescription: string; intro: string }> = {
  "por-pais": {
    h1: "Residencia en Paraguay por nacionalidad",
    metaTitle: "Residencia en Paraguay por país: elige tu nacionalidad",
    metaDescription: "Residencia en Paraguay según tu país: qué ruta te toca (Mercosur o general), qué documentos pedir y cómo apostillarlos. Elige tu nacionalidad.",
    intro: "Tu pasaporte decide más de lo que parece. Si eres de un país de la lista Mercosur, tu ruta es la residencia Mercosur; si no, la residencia temporal general. Y cada país emite sus certificados a su manera: quién da los antecedentes penales, dónde se apostilla, qué falla con el pasaporte. Elige tu nacionalidad y te lo contamos para tu caso, con la ruta, los requisitos y los documentos. Si tu país no está en la lista, el test de ruta te orienta igual.",
  },
};

// Content is fixed at build time. Reject unknown params at the router so
// global-not-found supplies the branded document before SSR can throw.
export const dynamicParams = false;

export function generateStaticParams() {
  return getHubs('residenciaes').filter((hub) => getHub('residenciaes', hub).some((post) => !post.frontmatter.draft)).map((hub) => ({ hub }));
}

function collection(hub: string) {
  const posts = getHub('residenciaes', hub).filter((post) => !post.frontmatter.draft);
  if (!posts.length) notFound();
  const title = labels[hub] ?? hub;
  const copy = HUB_COPY[hub];
  return { posts, title, copy, description: copy?.intro ?? "Artículos sobre " + title.toLocaleLowerCase('es-ES') + '.', path: '/guias/' + hub };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { title, copy, path } = collection((await params).hub);
  if (copy) return siteMetadata('residenciaes', { title: copy.metaTitle, description: copy.metaDescription, path });
  return siteMetadata('residenciaes', { title: title + " — Guías de residencia en Paraguay", description: "Consulta nuestras guías sobre " + title.toLocaleLowerCase("es") + " en Paraguay, con orientación para preparar tu mudanza, entender el proceso y plantear tus dudas al equipo.", path });
}

export default async function Page({ params }: { params: Params }) {
  const { posts, title, copy, description, path } = collection((await params).hub);
  const isSelector = path === '/guias/por-pais';
  const items = isSelector
    ? NATIONALITIES.map((n) => ({ name: 'Residencia en Paraguay: ' + n.country, path: contentHref('residenciaes', n.slugPath) }))
    : posts.map((post) => ({ name: post.frontmatter.title, path: contentHref('residenciaes', post.slugPath) }));
  return (
    <Section>
      <Container>
        <Breadcrumbs site="residenciaes" items={[{ label: "Guías", href: '/guias' }, { label: title, href: path }]} />
        <JsonLd data={collectionPageJsonLd('residenciaes', { name: copy?.h1 ?? title, description, path, items })} />
        <Heading level={1}>{copy?.h1 ?? title}</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">{description}</p>
        {isSelector ? (
          <>
            <NationalityGrid />
            <p className="mt-[var(--space-8)] max-w-[var(--measure)] text-[var(--fg-muted)]">
              ¿No ves tu país? Haz el{' '}
              <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">test de ruta</a>{' '}
              o mira la{' '}
              <a href="/mercosur" className="text-[var(--accent)] underline underline-offset-2">vía Mercosur</a>.
            </p>
          </>
        ) : (
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card headingLevel={2} key={post.slugPath} title={post.frontmatter.title} href={contentHref('residenciaes', post.slugPath)}
              eyebrow={title + ' · ' + new Date(post.frontmatter.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}>
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
        )}
      </Container>
    </Section>
  );
}
