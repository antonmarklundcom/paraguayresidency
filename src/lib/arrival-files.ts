import 'server-only';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import imagery from '../../docs/imagery-manifest.json';
import type { Locale } from '@/i18n/locales';
import { arrivalImage } from './imagery';

/**
 * Which encoded files exist for an Arrival image, read from
 * `public/images/arrival/` (`<id>-<width>.<webp|avif>`), so a component can
 * offer an AVIF `<source>` the moment the files land, with no code change.
 * Server-only: it reads the disk. Static pages read it once at build time.
 */
export interface ArrivalVariants {
  webp: number[];
  avif: number[];
}

let cache: Map<string, ArrivalVariants> | undefined;

function scan(): Map<string, ArrivalVariants> {
  const map = new Map<string, ArrivalVariants>();
  let files: string[];
  try {
    files = readdirSync(join(process.cwd(), 'public/images/arrival'));
  } catch {
    // No public/ at runtime (an unusual deploy): callers fall back to WebP.
    return map;
  }
  for (const file of files) {
    const match = /^(.+)-(\d+)\.(webp|avif)$/.exec(file);
    if (!match) continue;
    const entry = map.get(match[1]) ?? { webp: [], avif: [] };
    entry[match[3] as 'webp' | 'avif'].push(Number(match[2]));
    map.set(match[1], entry);
  }
  for (const entry of map.values()) {
    entry.webp.sort((a, b) => a - b);
    entry.avif.sort((a, b) => a - b);
  }
  return map;
}

/** What the manifest's `files` list says exists, for when the disk cannot be read. */
function fromManifest(id: string): ArrivalVariants {
  const files = (imagery.images.find((image) => image.id === id) as { files?: string[] } | undefined)?.files ?? [];
  const variants: ArrivalVariants = { webp: [], avif: [] };
  for (const file of files) {
    const match = /-(\d+)\.(webp|avif)$/.exec(file);
    if (match) variants[match[2] as 'webp' | 'avif'].push(Number(match[1]));
  }
  variants.webp.sort((a, b) => a - b);
  variants.avif.sort((a, b) => a - b);
  return variants;
}

export function arrivalVariants(id: string): ArrivalVariants {
  // Cached in production; re-read in development so new files show up.
  if (!cache || process.env.NODE_ENV !== 'production') cache = scan();
  return cache.get(id) ?? fromManifest(id);
}

/** True when the manifest knows the id (so `arrivalImage` has alt text) and a WebP exists. */
export function arrivalExists(id: string): boolean {
  return imagery.images.some((image) => image.id === id) && arrivalVariants(id).webp.length > 0;
}

export function arrivalSrcSet(id: string, format: 'webp' | 'avif', widths: number[]): string {
  return widths.map((width) => `/images/arrival/${id}-${width}.${format} ${width}w`).join(', ');
}

/** Width ÷ height from the manifest's `ratio` ("16:9", "4:5"); 16:9 when absent. */
function aspect(id: string): number {
  const ratio = (imagery.images.find((image) => image.id === id) as { ratio?: string } | undefined)?.ratio;
  const [w, h] = (ratio ?? '16:9').split(':').map(Number);
  return w > 0 && h > 0 ? w / h : 16 / 9;
}

export interface ArrivalPicture {
  alt: string;
  /** The `<img src>`: the largest WebP up to `maxWidth`. */
  src: string;
  srcSet: string;
  /** Present only when AVIF files exist for this image. */
  avifSrcSet?: string;
  width: number;
  height: number;
}

/**
 * Everything an `<img>` (plus an optional AVIF `<source>`) needs for one
 * Arrival image, in the page's locale. `maxWidth` caps the srcset for small
 * slots (a card never needs the 2400 hero file).
 */
export function arrivalPicture(id: string, locale: Locale, { maxWidth = Infinity } = {}): ArrivalPicture {
  const { alt } = arrivalImage(id, locale);
  const variants = arrivalVariants(id);
  const cap = (widths: number[]) => {
    const within = widths.filter((width) => width <= maxWidth);
    return within.length ? within : widths.slice(0, 1);
  };
  // A hero with no file list at all keeps the historical 1200/2400 pair.
  const webp = cap(variants.webp.length ? variants.webp : [1200, 2400]);
  const avif = cap(variants.avif);
  const largest = webp[webp.length - 1];
  return {
    alt,
    src: `/images/arrival/${id}-${largest}.webp`,
    srcSet: arrivalSrcSet(id, 'webp', webp),
    avifSrcSet: avif.length && variants.avif.length ? arrivalSrcSet(id, 'avif', avif) : undefined,
    width: largest,
    height: Math.round(largest / aspect(id)),
  };
}
