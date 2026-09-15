import type { Metadata } from 'next';
import { BookPage, bookMetadata } from '@/lib/conversion-pages';

const SITE = 'residency' as const;

export function generateMetadata(): Metadata {
  return bookMetadata(SITE);
}

export default function Page() {
  return <BookPage site={SITE} />;
}
