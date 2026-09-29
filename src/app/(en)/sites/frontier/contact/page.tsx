import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';
import { ContactLayout } from '../../_w5b/ContactLayout';

const SITE = 'frontier' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <ContactLayout site={SITE} variant="contact" message="Hi — I have a question about a second residency in Paraguay." />;
}
