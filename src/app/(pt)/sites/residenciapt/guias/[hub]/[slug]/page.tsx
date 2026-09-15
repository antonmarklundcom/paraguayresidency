import type { Metadata } from 'next';
import { ArticlePage, articleMetadata, type ArticleLink } from '@/lib/article-page';
import { getPage, getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';

type Params = Promise<{ hub: string; slug: string }>;

/**
 * One service page per hub (plan §6.7 quality bar: every "life" page ends in
 * a residency CTA). `morar-no-paraguai` (the brand's own hub) routes to the
 * cost-of-living page rather than a service, matching how that hub's
 * articles talk about a life before a document.
 */
const HUB_SERVICE: Record<string, ArticleLink> = {
  documentos: { label: 'Residência temporária', href: '/residencia/temporaria' },
  'morar-no-paraguai': { label: 'Custo de vida', href: '/custo-de-vida' },
  impostos: { label: 'Residência fiscal', href: '/residencia-fiscal' },
  comparativos: { label: 'Residência permanente', href: '/residencia/permanente' },
};

export function generateStaticParams() {
  return getPages('residenciapt').map((page) => ({ hub: page.hub, slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hub, slug } = await params;
  return articleMetadata('residenciapt', `${hub}/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { hub, slug } = await params;
  const slugPath = `${hub}/${slug}`;
  const page = getPage('residenciapt', slugPath);

  const relatedLinks: ArticleLink[] = (page?.frontmatter.related ?? [])
    .map((relatedSlug) => {
      const related = getPage('residenciapt', relatedSlug);
      return related
        ? { label: related.frontmatter.title, href: contentHref('residenciapt', relatedSlug) }
        : null;
    })
    .filter((link): link is ArticleLink => link !== null);

  return (
    <ArticlePage
      site="residenciapt"
      slugPath={slugPath}
      relatedLinks={relatedLinks}
      serviceLink={HUB_SERVICE[hub]}
    />
  );
}
