import type { Metadata } from 'next';
import { PlaceholderHome } from '@/lib/site-pages';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: t('investorpass', 'home.h1'),
    description: t('investorpass', 'home.sub'),
    path: '/',
  });
}

export default function Page() {
  return <PlaceholderHome site="investorpass" />;
}
