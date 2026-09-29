import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';
import { ContactLayout } from '../../_w5b/ContactLayout';

const SITE = 'investorpass' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <ContactLayout site={SITE} variant="investor_inquiry" message="Hi — I have a question about the Investor Pass." />;
}
