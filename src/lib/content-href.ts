import type { SiteKey } from '@/sites/registry';

/** Public URL for a content page, per brand (plan §6). */
export function contentHref(site: SiteKey, slugPath: string): string {
  switch (site) {
    case 'residency':
      return `/guides/${slugPath}`;
    case 'investorpass':
      return `/insights/${slugPath.split('/').slice(1).join('/')}`;
    case 'guide':
      return `/blog/${slugPath.split('/').slice(1).join('/')}`;
    // The four consolidated brands keep the hub's `<hub>/<slug>` shape under a
    // locale-appropriate prefix; S10–S13 own the pages behind these paths.
    // `frontier` is the exception: plan §6.5 gives it one flat hub
    // (`/stories/[slug]`, no hub segment in the URL — same shape as
    // investorpass's `/insights` and guide's `/blog`).
    case 'frontier':
      return `/stories/${slugPath.split('/').slice(1).join('/')}`;
    case 'residenciaes':
      return `/guias/${slugPath}`;
    case 'residenciapt':
      return `/guias/${slugPath}`;
    // flytta has exactly two hubs (`guider`, `stader`), each its own top-level
    // route (plan §6.8), so the hub segment already is the route prefix.
    case 'flytta':
      return `/${slugPath}`;
  }
}
