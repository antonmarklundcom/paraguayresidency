/**
 * The reply-time promise shown in the "what happens next" block. Config, not
 * copy: `NEXT_PUBLIC_REPLY_HOURS` (a whole number of working hours) turns the
 * numbered promise on once the team has confirmed it can keep it. Unset or
 * invalid, the block says no number (docs/verify-later.md, A1).
 */
export function replyHours(raw: string | undefined = process.env.NEXT_PUBLIC_REPLY_HOURS): number | null {
  const n = Number((raw ?? '').trim());
  return Number.isInteger(n) && n > 0 && n <= 240 ? n : null;
}

export type PriceFactKey =
  | 'pricing.temporary'
  | 'pricing.permanent'
  | 'pricing.cedula'
  | 'pricing.tax_residency'
  | 'pricing.family'
  | 'pricing.investor_pass';

/**
 * The pricing fact that anchors a page: by path keyword, else the temporary
 * route (the standard first step). Only `pricing.*` keys, so the figure (or
 * its hedge) always comes from facts.ts through <Fact>.
 */
export function priceKeyFor(path: string): PriceFactKey {
  let p = path.toLowerCase();
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep the raw path */
  }
  if (/invest|inversor|pase/.test(p)) return 'pricing.investor_pass';
  if (/tax|fiscal|skatt|impuest|imposto/.test(p)) return 'pricing.tax_residency';
  if (/famil/.test(p)) return 'pricing.family';
  if (/cedula|cédula/.test(p)) return 'pricing.cedula';
  if (/perman/.test(p)) return 'pricing.permanent';
  return 'pricing.temporary';
}

/** Adds the page's name to a wa.me link's pre-typed text (client-side, at click). */
export function withPageMessage(href: string, template: string, page: string): string {
  const name = page.split(/\s[|–—]\s/)[0].trim().slice(0, 80);
  if (!name || !template.includes('{page}')) return href;
  const url = new URL(href);
  url.searchParams.set('text', template.replace('{page}', name));
  return url.toString();
}
