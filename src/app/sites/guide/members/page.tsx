import type { Metadata } from 'next';
import { MembersPage, membersMetadata } from '@/lib/conversion-pages';

const SITE = 'guide' as const;

/** Reads the signed-in member's rows on every request. Never prerendered. */
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return membersMetadata(SITE);
}

export default async function Page() {
  return MembersPage({ site: SITE });
}
