import imagery from '../../docs/imagery-manifest.json';
import type { Locale } from '@/i18n/locales';

export interface ArrivalImage {
  id: string;
  alt: string;
}

/**
 * Looks up an Arrival image and its alt text in the page's own locale. Throws on
 * an unknown id or a missing translation: no silent English alt on a Spanish page.
 */
export function arrivalImage(id: string, locale: Locale = 'en'): ArrivalImage {
  const asset = imagery.images.find((image) => image.id === id) as Record<string, unknown> | undefined;
  if (!asset) throw new Error(`Unknown Arrival image: ${id}`);
  const alt = asset[`alt_${locale}`];
  if (typeof alt !== 'string' || !alt) throw new Error(`Arrival image ${id} has no alt_${locale}`);
  return { id, alt };
}
