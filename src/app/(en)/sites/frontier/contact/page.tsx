import type { Metadata } from 'next';
import { ContactPage, contactMetadata } from '@/lib/conversion-pages';

const SITE = 'frontier' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <ContactPage site={SITE} whatsappMessage="Hi — I have a question about a second residency in Paraguay." />;
}
