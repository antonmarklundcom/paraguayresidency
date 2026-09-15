import type { Metadata } from 'next';
import { PrivacyPage, privacyMetadata } from '@/lib/legal-pages';

export function generateMetadata(): Metadata {
  return privacyMetadata('residency');
}

export default function Page() {
  return <PrivacyPage site="residency" />;
}
