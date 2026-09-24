import type { Metadata } from 'next';
import { ContactPage, contactMetadata } from '@/lib/conversion-pages';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <ContactPage site={SITE} whatsappMessage="Hola, me gustaría saber más sobre la residencia en Paraguay." />;
}
