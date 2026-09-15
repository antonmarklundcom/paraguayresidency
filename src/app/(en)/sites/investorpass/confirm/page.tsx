import type { Metadata } from 'next';
import { ConfirmPage, confirmMetadata, type SearchParams } from '@/lib/conversion-pages';

const SITE = 'investorpass' as const;

/** Touches the database on every request — never prerendered. */
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return confirmMetadata(SITE);
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  return ConfirmPage({ site: SITE, searchParams });
}
