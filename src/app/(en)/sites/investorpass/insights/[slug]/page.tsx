import type { Metadata } from 'next';
import { ArticlePage, articleMetadata, type ArticleLink } from '@/lib/article-page';
import { getHub, getPage } from '@/content';
import { contentHref } from '@/lib/site-pages';

type Params = Promise<{ slug: string }>;

const SERVICE_LINK: ArticleLink = {
  label: 'Investment routes',
  href: '/investor-pass/investment-routes',
};

export function generateStaticParams() {
  return getHub('investorpass', 'insights').map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata('investorpass', `insights/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const slugPath = `insights/${slug}`;
  const page = getPage('investorpass', slugPath);

  const relatedLinks: ArticleLink[] = (page?.frontmatter.related ?? [])
    .map((relatedSlug) => {
      const related = getPage('investorpass', relatedSlug);
      return related
        ? { label: related.frontmatter.title, href: contentHref('investorpass', relatedSlug) }
        : null;
    })
    .filter((link): link is ArticleLink => link !== null);

  return (
    <ArticlePage
      site="investorpass"
      slugPath={slugPath}
      relatedLinks={relatedLinks}
      serviceLink={SERVICE_LINK}
    />
  );
}
