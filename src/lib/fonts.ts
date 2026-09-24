import { preload } from 'react-dom';
import type { SiteKey } from '@/sites/registry';

/**
 * The one display-face file each brand's theme uses (body text is the system
 * stack). Keep in step with `--display-font` and `--display-weight` in
 * src/styles/themes/*.css; the files and @font-face rules live in public/fonts
 * and src/styles/fonts.css.
 */
export const BRAND_FONT: Record<SiteKey, string> = {
  residency: 'newsreader-500',
  investorpass: 'instrument-serif-400',
  guide: 'fraunces-500',
  frontier: 'inter-tight-600',
  residenciaes: 'fraunces-500',
  residenciapt: 'bricolage-600',
  flytta: 'inter-tight-600',
};

/** Called from each brand's own layout.tsx, never from SiteShell (see there). */
export function preloadBrandFonts(site: SiteKey): void {
  preload(`/fonts/${BRAND_FONT[site]}.woff2`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
}
