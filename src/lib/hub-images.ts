import type { SiteKey } from '@/sites/registry';

/**
 * The image an article card shows when the article has none of its own:
 * one Arrival image per brand hub (article category), so a card is never an
 * empty grey box (overhaul plan §2, ArticleCards v2).
 *
 * Every hub has its own category image from the 2026-10 set (manifest rows
 * with `"kind": "hub"`); the hubs added in W6 (por-pais, negocios, cidades)
 * borrow a fitting tile of the same brand until they get one.
 *
 * Keys are the hub folder names under `content/<brand>/`. A test fails if a
 * hub is missing here or an id is not in `docs/imagery-manifest.json`.
 */
export const HUB_IMAGES: Record<SiteKey, Record<string, string>> = {
  residency: {
    comparisons: 'residency-hub-comparisons-park-paths',
    documents: 'residency-hub-documents-apostille-desk',
    'living-in-paraguay': 'residency-hub-living-costanera-morning',
    taxes: 'residency-hub-taxes-desk-lamp',
  },
  investorpass: {
    insights: 'investorpass-hub-insights-terrace-night',
  },
  guide: {
    blog: 'guide-hub-blog-reader-plaza',
    updates: 'guide-hub-updates-asuncion-rooftops-morning',
  },
  frontier: {
    stories: 'frontier-hub-stories-couple-red-earth-road',
  },
  residenciaes: {
    comparativas: 'residenciaes-hub-comparativas-cafe-terere',
    documentos: 'residenciaes-hub-documentos-escribania-sello',
    impuestos: 'residenciaes-hub-impuestos-oficina-casa',
    'vivir-en-paraguay': 'residenciaes-hub-vivir-calle-barrio',
    'por-pais': 'residenciaes-tile-terminal-omnibus-viajeros',
  },
  residenciapt: {
    comparativos: 'residenciapt-hub-comparativos-chimarrao-terere',
    documentos: 'residenciapt-hub-documentos-pasta-apostila',
    impostos: 'residenciapt-hub-impostos-escritorio-ciudad-del-este',
    'morar-no-paraguai': 'residenciapt-hub-morar-rua-ipe-amarelo',
    negocios: 'residenciapt-tile-feira-ciudad-del-este',
    cidades: 'residenciapt-tile-ponte-rio-fronteira',
  },
  flytta: {
    guider: 'flytta-hub-guider-anteckningar-veranda',
    stader: 'flytta-hub-stader-asuncion-flygbild',
  },
};

/** Used when a card names no hub, or a hub the map does not know yet. */
export const BRAND_CARD_IMAGE: Record<SiteKey, string> = {
  residency: 'guide-tile-route-fork',
  investorpass: 'investorpass-tile-real-estate',
  guide: 'guide-tile-hammock-reading',
  frontier: 'frontier-tile-open-door-patio',
  residenciaes: 'guide-tile-route-fork',
  residenciapt: 'frontier-tile-three-roads',
  flytta: 'guide-tile-documents-desk',
};

export function hubImage(site: SiteKey, hub?: string): string {
  return (hub && HUB_IMAGES[site][hub]) || BRAND_CARD_IMAGE[site];
}

/**
 * Stand-ins for when several cards in one row would show the same hub image
 * (three blog posts side by side): each later card takes the next unused
 * image from this list, so a row never repeats a photo.
 */
export const BRAND_CARD_POOL: Record<SiteKey, string[]> = {
  residency: ['guide-tile-route-fork', 'guide-tile-documents-desk', 'frontier-tile-open-door-patio', 'investorpass-tile-real-estate'],
  investorpass: ['investorpass-tile-real-estate', 'investorpass-tile-productive-business', 'investorpass-tile-financial-instruments', 'investorpass-tile-tourism-lodge'],
  guide: ['guide-tile-hammock-reading', 'guide-tile-documents-desk', 'guide-tile-route-fork', 'guide-tile-market-asuncion', 'guide-tile-terere-cafe'],
  frontier: ['frontier-tile-open-door-patio', 'frontier-tile-three-roads', 'frontier-tile-home-office', 'frontier-tile-airport-window'],
  residenciaes: ['guide-tile-route-fork', 'guide-tile-documents-desk', 'frontier-tile-open-door-patio', 'frontier-tile-three-roads'],
  residenciapt: ['frontier-tile-three-roads', 'guide-tile-documents-desk', 'guide-tile-market-asuncion', 'guide-tile-route-fork'],
  flytta: ['guide-tile-documents-desk', 'guide-tile-market-asuncion', 'guide-tile-hammock-reading', 'guide-tile-route-fork'],
};

/**
 * The image for each card in a row: its own if it has one, else its hub's,
 * else the brand's; a repeat within the row moves to the next pool image.
 */
export function cardImages(site: SiteKey, cards: { image?: string; hub?: string }[], exists: (id: string) => boolean = () => true): string[] {
  const used = new Set<string>();
  return cards.map((card) => {
    let id = card.image && exists(card.image) ? card.image : hubImage(site, card.hub);
    if (used.has(id)) id = BRAND_CARD_POOL[site].find((candidate) => !used.has(candidate) && exists(candidate)) ?? id;
    used.add(id);
    return id;
  });
}
