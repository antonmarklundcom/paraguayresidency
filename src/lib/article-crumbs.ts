import type { SiteKey } from '@/sites/registry';

export interface ParentCrumb {
  label: string;
  href: string;
}

/**
 * The ancestors an article's breadcrumb trail passes through, so every article
 * links up to its guides index and, where the brand has hub pages, its hub
 * (seo-gap.md quick win 1). Labels match the H1s of the pages they point at.
 *
 * Brands with a flat hub (guide `/blog`, investorpass `/insights`, frontier
 * `/stories`, flytta `/guider` and `/stader`) have one ancestor; the three
 * multi-hub brands (residency, residenciaes, residenciapt) have two.
 */
const INDEX: Record<SiteKey, ParentCrumb | null> = {
  residency: { label: 'Guides', href: '/guides' },
  investorpass: { label: 'Insights', href: '/insights' },
  guide: { label: 'Blog', href: '/blog' },
  frontier: { label: 'Stories', href: '/stories' },
  residenciaes: { label: 'Guías', href: '/guias' },
  residenciapt: { label: 'Guias', href: '/guias' },
  flytta: null,
};

const HUB_LABELS: Partial<Record<SiteKey, Record<string, string>>> = {
  residency: {
    comparisons: 'Comparisons',
    documents: 'Documents',
    'living-in-paraguay': 'Living in Paraguay',
    taxes: 'Taxes',
  },
  residenciaes: {
    comparativas: 'Comparativas',
    documentos: 'Documentos',
    impuestos: 'Impuestos',
    'por-pais': 'Por país',
    'vivir-en-paraguay': 'Vivir en Paraguay',
  },
  residenciapt: {
    cidades: 'Cidades',
    comparativos: 'Comparativos',
    documentos: 'Documentos',
    impostos: 'Impostos',
    negocios: 'Negócios',
    'morar-no-paraguai': 'Morar no Paraguai',
  },
  flytta: { guider: 'Guider', stader: 'Städer' },
};

const MULTI_HUB: readonly SiteKey[] = ['residency', 'residenciaes', 'residenciapt'];

export function articleParentCrumbs(site: SiteKey, hub: string): ParentCrumb[] {
  const index = INDEX[site];
  if (MULTI_HUB.includes(site)) {
    const label = HUB_LABELS[site]?.[hub];
    return [...(index ? [index] : []), ...(label && index ? [{ label, href: `${index.href}/${hub}` }] : [])];
  }
  if (site === 'flytta') {
    const label = HUB_LABELS.flytta?.[hub];
    return label ? [{ label, href: `/${hub}` }] : [];
  }
  return index ? [index] : [];
}
