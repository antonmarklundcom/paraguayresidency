import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, DISALLOWED, robotsText } from '@/lib/seo-files';
import { llmsFullText, llmsText, mdxToText } from '@/lib/llms';
import { factKeysIn } from '@/lib/article-page';
import { facts, factPublished, factText, interpolateFacts, type Fact, type FactKey } from '@content/shared/facts';
import { getPages } from '@/content';
import { SITE_KEYS, siteOrigin } from '@/sites/registry';

function mdxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? mdxFiles(path) : path.endsWith('.mdx') ? [path] : [];
  });
}

describe('robots.txt', () => {
  it('welcomes every named AI crawler with the same disallow list', () => {
    const text = robotsText('guide');
    for (const bot of AI_CRAWLERS) {
      const group = text.split(`User-agent: ${bot}\n`)[1]?.split('\n\n')[0] ?? '';
      expect(group, bot).toContain('Allow: /');
      for (const path of DISALLOWED) expect(group, `${bot} ${path}`).toContain(`Disallow: ${path}`);
    }
    expect(text).toContain(`${siteOrigin('guide')}/llms.txt`);
  });
});

describe('llms.txt', () => {
  it('lists every published article of the brand on its own origin', () => {
    for (const site of SITE_KEYS) {
      const text = llmsText(site);
      expect(text.startsWith('# ')).toBe(true);
      for (const page of getPages(site)) expect(text, `${site} ${page.slugPath}`).toContain(page.frontmatter.title);
      expect(text).not.toMatch(/\{\{fact:/);
    }
  });

  it('resolves facts and drops JSX in the full text', () => {
    const full = llmsFullText('guide');
    expect(full).not.toMatch(/<Fact|\{\{fact:/);
    const key = Object.keys(facts)[0] as FactKey;
    expect(mdxToText(`A <Fact k="${key}" /> b <StatRow stats={[]} /> c`, 'guide')).toBe(`A ${factText(key)} b  c`);
  });
});

describe('facts in articles', () => {
  it('interpolates {{fact:key}} tokens and leaves unknown ones visible', () => {
    const key = Object.keys(facts)[0] as FactKey;
    expect(interpolateFacts(`x {{fact:${key}}} y`)).toBe(`x ${factText(key)} y`);
    expect(interpolateFacts('{{fact:nope.nope}}')).toBe('{{fact:nope.nope}}');
  });

  it('finds the fact keys an MDX body uses', () => {
    const key = Object.keys(facts)[0];
    expect(factKeysIn(`<Fact k="${key}" /> and <Fact site={SITE} k='${key}' />`)).toEqual([key]);
  });

  it('every <Fact k> and {{fact:}} in content names a real fact, and no draft note ships', () => {
    const problems: string[] = [];
    for (const file of mdxFiles(join(process.cwd(), 'content'))) {
      const source = readFileSync(file, 'utf8');
      for (const m of source.matchAll(/<Fact\b[^>]*\bk=["']([^"']+)["']/g)) if (!(m[1] in facts)) problems.push(`${file}: <Fact k="${m[1]}">`);
      for (const m of source.matchAll(/\{\{fact:([\w.]+)\}\}/g)) if (!(m[1] in facts)) problems.push(`${file}: {{fact:${m[1]}}}`);
      if (/\[VERIFY|\bTODO\b|\bTBD\b/.test(source)) problems.push(`${file}: editorial placeholder`);
      // Frontmatter is plain text: a <Fact> tag there would print literally.
      const head = source.startsWith('---') ? source.split('---')[1] : '';
      if (/<Fact\b/.test(head)) problems.push(`${file}: <Fact> in frontmatter (use {{fact:key}})`);
    }
    expect(problems).toEqual([]);
  });

  it('publishes a sourced fact with its figure, and only with a source date', () => {
    for (const fact of Object.values(facts) as Fact[]) {
      if (!fact.sourced) continue;
      expect(factPublished(fact)).toBe(true);
      expect(fact.sourced.checkedOn, fact.key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(factText(fact.key as FactKey)).toBe(typeof fact.display === 'string' ? fact.display : fact.display.en);
    }
  });
});
