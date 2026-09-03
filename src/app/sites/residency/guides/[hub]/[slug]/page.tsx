import type { Metadata } from 'next';
import { ArticlePage, articleMetadata } from '@/lib/article-page';
import { getPages } from '@/content';

type Params = Promise<{ hub: string; slug: string }>;

export function generateStaticParams() {
  return getPages('residency').map((page) => ({ hub: page.hub, slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hub, slug } = await params;
  return articleMetadata('residency', `${hub}/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { hub, slug } = await params;
  return <ArticlePage site="residency" slugPath={`${hub}/${slug}`} />;
}
