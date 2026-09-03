import type { Metadata } from 'next';
import { PlaceholderHome } from '@/lib/site-pages';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: t('residency', 'home.h1'),
    description: t('residency', 'home.sub'),
    path: '/',
  });
}

export default function Page() {
  return <PlaceholderHome site="residency" />;
}
