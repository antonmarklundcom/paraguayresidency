import type { Metadata } from 'next';
import { ArticlePage, articleMetadata, type ArticleLink } from '@/lib/article-page';
import { getHub, getPage } from '@/content';
import { contentHref } from '@/lib/site-pages';

type Params = Promise<{ slug: string }>;

const SERVICE_LINK: ArticleLink = { label: 'Compare the three routes', href: '/routes' };

export function generateStaticParams() {
  return getHub('frontier', 'stories').map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata('frontier', `stories/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const slugPath = `stories/${slug}`;
  const page = getPage('frontier', slugPath);

  const relatedLinks: ArticleLink[] = (page?.frontmatter.related ?? [])
    .map((relatedSlug) => {
      const related = getPage('frontier', relatedSlug);
      return related
        ? { label: related.frontmatter.title, href: contentHref('frontier', relatedSlug) }
        : null;
    })
    .filter((link): link is ArticleLink => link !== null);

  return (
    <ArticlePage
      site="frontier"
      slugPath={slugPath}
      relatedLinks={relatedLinks}
      serviceLink={SERVICE_LINK}
    />
  );
}
