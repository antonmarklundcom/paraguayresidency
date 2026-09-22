import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';
import { expect, it, vi } from 'vitest';
import * as components from '@/components';
import * as content from '@/content';
import * as sitePages from '@/lib/site-pages';
import * as metadata from '@/lib/metadata';
import * as purchases from '@/lib/purchases';
import * as registry from '@/sites/registry';
import * as i18n from '@/i18n';
import * as whatsapp from '@/lib/whatsapp';
import * as timeline from '@/components/ProcessTimeline';
import Guide from '@/app/(en)/sites/guide/page';
import Investor from '@/app/(en)/sites/investorpass/page';
import Frontier from '@/app/(en)/sites/frontier/page';
import imagery from '../docs/imagery-manifest.json';

// Isolate external/request boundaries; render real layout, images, facts and timeline.
vi.mock('@/components/LeadForm', () => ({ LeadForm: () => null }));
vi.mock('@/components/NewsletterForm', () => ({ NewsletterForm: () => null }));
vi.mock('@/components/CheckoutButton', () => ({ CheckoutButton: () => null }));
vi.mock('@/lib/purchases', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/purchases')>(),
  getProductBySlug: async () => null,
}));

const modules: Record<string, unknown> = {
  'react/jsx-runtime': jsxRuntime,
  '@/components': components,
  '@/content': content,
  '@/lib/site-pages': sitePages,
  '@/lib/metadata': metadata,
  '@/lib/purchases': purchases,
  '@/sites/registry': registry,
  '@/i18n': i18n,
  '@/lib/whatsapp': whatsapp,
  '@/components/ProcessTimeline': timeline,
};

async function baseline(site: string) {
  // Render origin/main itself, including mapped route facts and nested timeline facts.
  // Fail loudly if the reference or an import is missing; never silently weaken coverage.
  const source = execFileSync('git', ['show', `origin/main:src/app/(en)/sites/${site}/page.tsx`], { encoding: 'utf8' });
  const js = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const exports: { default?: () => ReactNode | Promise<ReactNode> } = {};
  new Function('require', 'exports', js)((id: string) => {
    if (!(id in modules)) throw new Error(`Unmapped baseline import: ${id}`);
    return modules[id];
  }, exports);
  return renderToStaticMarkup(await exports.default!());
}

for (const [site, Page, count] of [['guide', Guide, 5], ['investorpass', Investor, 4], ['frontier', Frontier, 4]] as const) {
  it(`${site} renders Arrival and preserves every origin/main fact occurrence`, async () => {
    const html = renderToStaticMarkup(await Page());
    const facts = (markup: string) => [...markup.matchAll(/data-fact="([^"]+)"/g)].map(match => match[1]).sort();
    // The pre-Arrival fact list is frozen in a fixture (CI checkouts are shallow, so no git show there).
    // Regenerate with WRITE_ARRIVAL_BASELINE=1 on a full clone only if origin/main pages legitimately change.
    const fixture = 'tests/fixtures/arrival-baseline-facts.json';
    if (process.env.WRITE_ARRIVAL_BASELINE) {
      const all = existsSync(fixture) ? JSON.parse(readFileSync(fixture, 'utf8')) : {};
      all[site] = facts(await baseline(site));
      writeFileSync(fixture, JSON.stringify(all, null, 2) + '\n');
    }
    expect(facts(html)).toEqual(JSON.parse(readFileSync(fixture, 'utf8'))[site]);
    expect(html.match(/<img\b[^>]*fetchPriority="high"/gi)).toHaveLength(1);
    const block = html.match(/<section data-intent-tiles[\s\S]*?<\/section>/)?.[0];
    expect(block).toBeDefined();
    expect(block!.match(/<a\s/g)).toHaveLength(count);
    expect(block!.match(/loading="lazy"/g)).toHaveLength(count);
    expect(block).toContain('snap-mandatory');
    for (const name of ['Anton Marklund', 'Yanina Alvarez', 'Diana Davalos']) expect(html).toContain(name);
    for (const img of html.matchAll(/<img\b[^>]+>/g)) {
      expect(img[0]).toContain('srcSet=');
      expect(img[0]).toContain('sizes=');
      expect(img[0]).toMatch(/width="\d+" height="\d+"/);
      const asset = imagery.images.find(asset => img[0].includes(asset.id));
      expect(asset).toBeDefined();
      expect(img[0]).toContain(`alt="${asset!.alt_en}"`);
    }
    expect(html).not.toMatch(/<details[^>]*\bopen(?:=|\s|>)/);
    expect(html).not.toMatch(/lawyer/i);
  });
}
