import type { Metadata } from 'next';
import { PlaceholderHome } from '@/lib/site-pages';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: t('frontier', 'home.metaTitle'),
    description: t('frontier', 'home.metaDescription'),
    path: '/',
  });
}

export default function Page() {
  return <PlaceholderHome site="frontier" />;
}
