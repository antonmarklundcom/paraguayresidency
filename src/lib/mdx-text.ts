import { facts, factText, type FactKey } from '@content/shared/facts';
import { getSite, type SiteKey } from '@/sites/registry';

/** MDX body to readable markdown: facts resolved, other JSX dropped. */
export function mdxToText(body: string, site: SiteKey): string {
  const locale = getSite(site).locale;
  return body
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/<Fact\b[^>]*\bk=["']([^"']+)["'][^>]*\/>/g, (_, key: string) =>
      key in facts ? factText(key as FactKey, locale) : '',
    )
    .replace(/<[A-Z][\s\S]*?\/>/g, '')
    .replace(/<\/?[A-Z][^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
