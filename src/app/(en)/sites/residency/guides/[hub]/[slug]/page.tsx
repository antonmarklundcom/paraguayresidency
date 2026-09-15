import type { Metadata } from 'next';
import { ArticlePage, articleMetadata, type ArticleLink } from '@/lib/article-page';
import { getPage, getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';

type Params = Promise<{ hub: string; slug: string }>;

/**
 * One service page per hub, so every article routes the reader to the one
 * offer its hub is closest to (plan §6.1 quality bar). Comparisons shoppers
 * are still deciding between countries, so they land on the fullest service —
 * permanent residency — rather than a narrower one.
 */
const HUB_SERVICE: Record<string, ArticleLink> = {
  documents: { label: 'Temporary residency', href: '/residency/temporary-residency' },
  'living-in-paraguay': { label: 'Permanent residency', href: '/residency/permanent-residency' },
  taxes: { label: 'Tax residency', href: '/residency/tax-residency' },
  comparisons: { label: 'Permanent residency', href: '/residency/permanent-residency' },
};

export function generateStaticParams() {
  return getPages('residency').map((page) => ({ hub: page.hub, slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hub, slug } = await params;
  return articleMetadata('residency', `${hub}/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { hub, slug } = await params;
  const slugPath = `${hub}/${slug}`;
  const page = getPage('residency', slugPath);

  const relatedLinks: ArticleLink[] = (page?.frontmatter.related ?? [])
    .map((relatedSlug) => {
      const related = getPage('residency', relatedSlug);
      return related
        ? { label: related.frontmatter.title, href: contentHref('residency', relatedSlug) }
        : null;
    })
    .filter((link): link is ArticleLink => link !== null);

  return (
    <ArticlePage
      site="residency"
      slugPath={slugPath}
      relatedLinks={relatedLinks}
      serviceLink={HUB_SERVICE[hub]}
    />
  );
}
