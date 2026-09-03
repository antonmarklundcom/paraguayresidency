import type { Metadata } from 'next';
import { ArticlePage, articleMetadata } from '@/lib/article-page';
import { getHub } from '@/content';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getHub('guide', 'blog').map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata('guide', `blog/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  return <ArticlePage site="guide" slugPath={`blog/${slug}`} />;
}
