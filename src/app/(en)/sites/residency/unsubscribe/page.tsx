import type { Metadata } from 'next';
import { UnsubscribePage, unsubscribeMetadata, type SearchParams } from '@/lib/conversion-pages';

const SITE = 'residency' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return unsubscribeMetadata(SITE);
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  return UnsubscribePage({ site: SITE, searchParams });
}
