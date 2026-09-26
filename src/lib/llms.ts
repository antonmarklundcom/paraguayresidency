import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { t } from '@/i18n';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';
import { TEAM } from '@/content/team';
import { interpolateFacts } from '@content/shared/facts';
import { mdxToText } from './mdx-text';

export { mdxToText };

/**
 * `/llms.txt` and `/llms-full.txt` per brand (llmstxt.org): a plain-markdown
 * map of the site for language models, and the full article text with every
 * `<Fact>` resolved to what a reader sees. Served by host like robots.txt.
 */
function header(site: SiteKey): string[] {
  const config = getSite(site);
  const origin = siteOrigin(site);
  const team = Object.values(TEAM)
    .map((member) => `${member.name} (${member.role[config.locale]})`)
    .join(', ');
  return [
    `# ${config.name}`,
    '',
    `> ${t(site, 'home.metaDescription') || t(site, config.tagline)}`,
    '',
    `${config.name} (${origin}) is part of Paraguay Residency Group, a residency team based in Asunción, Paraguay. People: ${team}.`,
    `Language: ${config.locale}. Contact: ${origin}/contact. Free route check: ${origin}/route-finder.`,
    '',
  ];
}

function keyPages(site: SiteKey): string[] {
  const config = getSite(site);
  const origin = siteOrigin(site);
  const seen = new Set<string>();
  const links = [...config.nav, ...config.footer.columns.flatMap((column) => column.items)]
    .filter((item) => item.href.startsWith('/') && !seen.has(item.href) && seen.add(item.href))
    .map((item) => `- [${t(site, item.labelKey)}](${origin}${item.href})`);
  return ['## Key pages', '', ...links, ''];
}

export function llmsText(site: SiteKey): string {
  const origin = siteOrigin(site);
  const locale = getSite(site).locale;
  const byHub = new Map<string, string[]>();
  for (const page of getPages(site)) {
    const { title, description, summary } = page.frontmatter;
    const line = `- [${title}](${origin}${contentHref(site, page.slugPath)}): ${summary ? interpolateFacts(summary, locale) : description}`;
    byHub.set(page.frontmatter.hub, [...(byHub.get(page.frontmatter.hub) ?? []), line]);
  }
  const sections = [...byHub.entries()].flatMap(([hub, lines]) => [`## Articles: ${hub}`, '', ...lines, '']);
  return [
    ...header(site),
    ...keyPages(site),
    ...sections,
    '## Optional',
    '',
    `- [Full text of every article](${origin}/llms-full.txt)`,
    '',
  ].join('\n');
}

export function llmsFullText(site: SiteKey): string {
  const origin = siteOrigin(site);
  const locale = getSite(site).locale;
  const articles = getPages(site).flatMap((page) => {
    const fm = page.frontmatter;
    return [
      `## ${fm.title}`,
      '',
      `URL: ${origin}${contentHref(site, page.slugPath)} · Updated: ${fm.updatedAt ?? fm.publishedAt} · Author: ${TEAM[fm.author].name}`,
      '',
      ...(fm.summary ? [interpolateFacts(fm.summary, locale), ''] : []),
      mdxToText(page.body, site),
      '',
      ...fm.takeaways.map((line) => `- ${interpolateFacts(line, locale)}`),
      ...(fm.faq.length ? ['', ...fm.faq.flatMap((item) => [`**${item.question}**`, interpolateFacts(item.answer, locale), ''])] : []),
      '',
    ];
  });
  return [...header(site), ...articles].join('\n');
}
