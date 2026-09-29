import type { Metadata } from 'next';
import { BrandContactPage } from '@/lib/brand-contact';
import { contactMetadata } from '@/lib/conversion-pages';

const SITE = 'residenciapt' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <BrandContactPage site={SITE} eyebrow="Fale com a gente" />;
}
