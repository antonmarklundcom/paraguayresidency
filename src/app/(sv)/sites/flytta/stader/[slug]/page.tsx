import type { Metadata } from 'next';
import { ArticlePage, articleMetadata, type ArticleLink } from '@/lib/article-page';
import { getPage, getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';

const SITE = 'flytta' as const;
const HUB = 'stader';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getPages(SITE)
    .filter((page) => page.hub === HUB)
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(SITE, `${HUB}/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const slugPath = `${HUB}/${slug}`;
  const page = getPage(SITE, slugPath);

  const relatedLinks: ArticleLink[] = (page?.frontmatter.related ?? [])
    .map((relatedSlug) => {
      const related = getPage(SITE, relatedSlug);
      return related
        ? { label: related.frontmatter.title, href: contentHref(SITE, relatedSlug) }
        : null;
    })
    .filter((link): link is ArticleLink => link !== null);

  return (
    <ArticlePage
      site={SITE}
      slugPath={slugPath}
      relatedLinks={relatedLinks}
      serviceLink={{ label: 'Se vägarna till uppehållstillstånd', href: '/uppehallstillstand' }}
    />
  );
}
