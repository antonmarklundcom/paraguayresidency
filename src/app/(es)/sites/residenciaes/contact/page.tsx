import type { Metadata } from 'next';
import { BrandContactPage } from '@/lib/brand-contact';
import { contactMetadata } from '@/lib/conversion-pages';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <BrandContactPage site={SITE} eyebrow="Escríbenos" whatsappMessage="Hola, me gustaría saber más sobre la residencia en Paraguay." />;
}
