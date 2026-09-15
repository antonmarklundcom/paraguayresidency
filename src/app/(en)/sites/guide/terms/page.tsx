import type { Metadata } from 'next';
import { GuideTermsPage, guideTermsMetadata } from '@/lib/legal-pages';

export function generateMetadata(): Metadata {
  return guideTermsMetadata('guide');
}

export default function Page() {
  return <GuideTermsPage site="guide" />;
}
