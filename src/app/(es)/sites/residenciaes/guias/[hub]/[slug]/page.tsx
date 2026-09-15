import type { Metadata } from 'next';
import { ArticlePage, articleMetadata, type ArticleLink } from '@/lib/article-page';
import { getPage, getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';

type Params = Promise<{ hub: string; slug: string }>;

/**
 * One service page per hub (plan §6.6 quality bar, same pattern as the hub's
 * `/guides/[hub]/[slug]`): every article routes the reader to the offer its
 * hub sits closest to.
 */
const HUB_SERVICE: Record<string, ArticleLink> = {
  documentos: { label: 'Residencia temporal', href: '/residencia/temporal' },
  'vivir-en-paraguay': { label: 'Residencia permanente', href: '/residencia/permanente' },
  impuestos: { label: 'Residencia fiscal', href: '/residencia-fiscal' },
  comparativas: { label: 'Residencia permanente', href: '/residencia/permanente' },
};

export function generateStaticParams() {
  return getPages('residenciaes').map((page) => ({ hub: page.hub, slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hub, slug } = await params;
  return articleMetadata('residenciaes', `${hub}/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { hub, slug } = await params;
  const slugPath = `${hub}/${slug}`;
  const page = getPage('residenciaes', slugPath);

  const relatedLinks: ArticleLink[] = (page?.frontmatter.related ?? [])
    .map((relatedSlug) => {
      const related = getPage('residenciaes', relatedSlug);
      return related
        ? { label: related.frontmatter.title, href: contentHref('residenciaes', relatedSlug) }
        : null;
    })
    .filter((link): link is ArticleLink => link !== null);

  return (
    <ArticlePage
      site="residenciaes"
      slugPath={slugPath}
      relatedLinks={relatedLinks}
      serviceLink={HUB_SERVICE[hub]}
    />
  );
}
