import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { t } from '@/i18n';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';

/** Escape XML text and remove characters XML 1.0 cannot represent. */
function xml(value: string): string {
  return Array.from(value).filter((char) => {
    const code = char.codePointAt(0)!;
    return code === 9 || code === 10 || code === 13 ||
      (code >= 0x20 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xfffd) ||
      (code >= 0x10000 && code <= 0x10ffff);
  }).join('').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]!);
}

/** Public articles only; getPages also excludes member lessons and updates. */
export function buildRss(site: SiteKey): string {
  const config = getSite(site);
  const origin = siteOrigin(site);
  const items = getPages(site).filter((page) => !page.frontmatter.draft).map((page) => {
    const link = xml(origin + contentHref(site, page.slugPath));
    return `    <item>
      <title>${xml(page.frontmatter.title)}</title>
      <description>${xml(page.frontmatter.description)}</description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(page.frontmatter.publishedAt).toUTCString()}</pubDate>
    </item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(config.name)}</title>
    <description>${xml(t(site, config.tagline))}</description>
    <link>${xml(origin)}</link>
    <language>${xml(config.locale)}</language>
    <atom:link href="${xml(origin)}/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`;
}
