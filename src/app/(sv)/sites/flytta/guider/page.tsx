import type { Metadata } from 'next';
import { HubIndexPage } from '@/lib/hub-index';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/guider';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Guider till Paraguay: flytt, tillstånd och vardag',
    description:
      'Läs praktiska guider om att flytta till Paraguay, förbereda dokument och förstå uppehållstillstånd, med råd för en tryggare start i vardagen.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <HubIndexPage
      site={SITE}
      hub="guider"
      path={PATH}
      title="Guider"
      description="Praktiska guider om flytten till Paraguay, uppehållstillstånd och vardagen."
      listTitle="Alla guider"
      eyebrow="Flytta till Paraguay"
    />
  );
}
