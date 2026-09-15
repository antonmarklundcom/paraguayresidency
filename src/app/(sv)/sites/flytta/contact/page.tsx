import type { Metadata } from 'next';
import { ContactPage, contactMetadata } from '@/lib/conversion-pages';

const SITE = 'flytta' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <ContactPage site={SITE} />;
}
