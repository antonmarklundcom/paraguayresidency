import type { Metadata } from 'next';
import { ArticlePage, articleMetadata } from '@/lib/article-page';
import { getHub } from '@/content';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getHub('investorpass', 'insights').map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata('investorpass', `insights/${slug}`);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  return <ArticlePage site="investorpass" slugPath={`insights/${slug}`} />;
}
