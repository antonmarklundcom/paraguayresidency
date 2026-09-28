import type { SiteKey } from '@/sites/registry';

/**
 * The image an article card shows when the article has none of its own:
 * one Arrival image per brand hub (article category), so a card is never an
 * empty grey box (overhaul plan §2, ArticleCards v2).
 *
 * For now every hub points at an existing Arrival image. guide, investorpass
 * and frontier use their own brand's photos; the other four brands have no
 * photos of their own yet, so they use the same images their homepages
 * already show. W3 is generating a category image per hub: when one lands,
 * change the id here and every card in that hub follows.
 *
 * Keys are the hub folder names under `content/<brand>/`. A test fails if a
 * hub is missing here or an id is not in `docs/imagery-manifest.json`.
 */
export const HUB_IMAGES: Record<SiteKey, Record<string, string>> = {
  residency: {
    comparisons: 'guide-tile-route-fork',
    documents: 'guide-tile-documents-desk',
    'living-in-paraguay': 'guide-tile-market-asuncion',
    taxes: 'investorpass-tile-financial-instruments',
  },
  investorpass: {
    insights: 'investorpass-tile-real-estate',
  },
  guide: {
    blog: 'guide-tile-hammock-reading',
  },
  frontier: {
    stories: 'frontier-tile-open-door-patio',
  },
  residenciaes: {
    comparativas: 'guide-tile-route-fork',
    documentos: 'guide-tile-documents-desk',
    impuestos: 'investorpass-tile-financial-instruments',
    'vivir-en-paraguay': 'guide-tile-terere-cafe',
  },
  residenciapt: {
    comparativos: 'frontier-tile-three-roads',
    documentos: 'guide-tile-documents-desk',
    impostos: 'investorpass-tile-financial-instruments',
    'morar-no-paraguai': 'guide-tile-market-asuncion',
  },
  flytta: {
    guider: 'guide-tile-documents-desk',
    stader: 'guide-tile-market-asuncion',
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
