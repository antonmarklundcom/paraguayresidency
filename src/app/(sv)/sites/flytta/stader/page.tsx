import type { Metadata } from 'next';
import { HubIndexPage } from '@/lib/hub-index';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/stader';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Städer i Paraguay: hitta rätt plats att bo',
    description:
      'Lär känna städer i Paraguay och jämför vardag, bostadsområden och lokala förutsättningar för att hitta en plats som passar dig inför flytten.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <HubIndexPage
      site={SITE}
      hub="stader"
      path={PATH}
      title="Städer"
      description="Lär känna städer i Paraguay och hitta en plats som passar din vardag."
      listTitle="Alla städer"
      eyebrow="Flytta till Paraguay"
    />
  );
}
