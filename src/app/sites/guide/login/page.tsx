import type { Metadata } from 'next';
import { LoginPage, loginMetadata, type SearchParams } from '@/lib/conversion-pages';

const SITE = 'guide' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return loginMetadata(SITE);
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  return LoginPage({ site: SITE, searchParams });
}
