import type { Metadata } from 'next';
import { TermsPage, termsMetadata } from '@/lib/legal-pages';

export function generateMetadata(): Metadata {
  return termsMetadata('investorpass');
}

export default function Page() {
  return <TermsPage site="investorpass" />;
}
