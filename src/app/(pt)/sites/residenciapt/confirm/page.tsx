import type { Metadata } from 'next';
import { ConfirmPage, confirmMetadata, type SearchParams } from '@/lib/conversion-pages';

const SITE = 'residenciapt' as const;

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return confirmMetadata(SITE);
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  return ConfirmPage({ site: SITE, searchParams });
}
