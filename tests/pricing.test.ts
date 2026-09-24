import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { expect, it, vi } from 'vitest';
import { facts, factText, type Fact, type FactKey } from '@content/shared/facts';
import Hub from '@/app/(en)/sites/residency/pricing/page';
import Spanish from '@/app/(es)/sites/residenciaes/precios/page';
import Portuguese from '@/app/(pt)/sites/residenciapt/precos/page';
import Swedish from '@/app/(sv)/sites/flytta/priser/page';
import Frontier from '@/app/(en)/sites/frontier/pricing/page';

// Keep the real Fact and page components; forms depend on server actions.
vi.mock('@/components/LeadForm', () => ({ LeadForm: () => null }));

const routes = ['temporary', 'permanent', 'cedula', 'tax_residency', 'family'] as const;
const pages = [
  { site: 'residency', locale: 'en', path: 'pricing', Page: Hub, routes },
  { site: 'residenciaes', locale: 'es', path: 'precios', Page: Spanish, routes },
  { site: 'residenciapt', locale: 'pt', path: 'precos', Page: Portuguese, routes },
  { site: 'flytta', locale: 'sv', path: 'priser', Page: Swedish, routes },
  { site: 'frontier', locale: 'en', path: 'pricing', Page: Frontier,
    routes: ['temporary', 'permanent', 'tax_residency', 'family'] },
] as const;

for (const route of routes) {
  it(`pricing.${route} has honest unverified copy in every brand locale`, () => {
    const key = `pricing.${route}` as const;
    const fact = facts[key];
    expect(fact.key).toBe(key);
    expect(fact.label).toBeTruthy();
    expect(fact.verified).toBe(false);
    expect(fact.sources).toEqual([]);
    expect(fact.note).toContain('No approved service price');
    for (const locale of ['en', 'es', 'pt', 'sv'] as const) {
      expect(fact.display[locale]).toBeTruthy();
      expect(fact.hedged[locale]).toBeTruthy();
      expect(factText(key, locale)).toBe(fact.hedged[locale]);
      expect(fact.display[locale] + fact.hedged[locale]).not.toMatch(/[\d$€£?]/);
    }
    expect(fact.hedged.en).toContain('quoted in writing');
    expect(fact.hedged.es).toContain('por escrito');
    expect(fact.hedged.pt).toContain('por escrito');
    expect(fact.hedged.sv).toContain('skriftligt');
  });
}

for (const { site, locale, path, Page, routes: offered } of pages) {
  it(`${site}/${path} renders its own route set through localized pricing facts`, () => {
    const html = renderToStaticMarkup(createElement(Page));
    const keys = [...html.matchAll(/data-fact="([^"]+)"/g)].map(m => m[1]);
    expect(keys).toEqual(offered.map(route => `pricing.${route}`));
    const sections = html.match(/<section\b[^>]*aria-labelledby="[^"]+"[\s\S]*?<\/section>/g)!;
    expect(sections).toHaveLength(offered.length);
    for (const [index, section] of sections.entries()) {
      const key = `pricing.${offered[index]}` as FactKey;
      expect(section).toContain('data-verified="false"');
      expect(section).toContain(factText(key, locale));
      // Coverage and quoting stay route-specific; exclusions and payment terms are shared.
      expect(section.match(/<dt\b/g)).toHaveLength(2);
      const descriptions = [...section.matchAll(/<dd>(.*?)<\/dd>/g)];
      expect(descriptions).toHaveLength(2);
      for (const [, text] of descriptions) expect(text.length).toBeGreaterThan(80);
    }
    expect(html.match(/data-fee-terms/g)).toHaveLength(1);
    expect(html).toContain('href="#inquiry"');
    expect(html).toContain('id="inquiry"');
    const outsideFacts = html.replace(/<span\b[^>]*data-fact="[^"]+"[^>]*>[\s\S]*?<\/span>/g, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]*>/g, '').replace(/&#\d+;/g, '');
    expect(outsideFacts).not.toMatch(/[\d$€£?]/);
    const file = `src/app/(${locale})/sites/${site}/${path}/page.tsx`;
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function check(node: ts.Node) {
      // Layout token numbers and heading levels are markup, not published figures.
      if (ts.isJsxAttribute(node) && ['className', 'level'].includes(node.name.getText(source))) return;
      if (ts.isStringLiteral(node) || ts.isJsxText(node) || ts.isNumericLiteral(node)) {
        expect(node.text, `${file}: raw figure`).not.toMatch(/[\d$€£]/);
      }
      ts.forEachChild(node, check);
    }
    check(source);
  });

  it(`${site}/${path} picks up a newly verified price from the shared fact`, () => {
    const fact = facts['pricing.temporary'] as Fact;
    const original = { verified: fact.verified, display: fact.display };
    try {
      fact.verified = true;
      fact.display = { en: 'USD 1234', es: 'USD 2345', pt: 'USD 3456', sv: 'USD 4567' };
      const html = renderToStaticMarkup(createElement(Page));
      expect(html).toContain(`data-fact="pricing.temporary" data-verified="true"`);
      expect(html).toContain(fact.display[locale]);
      expect(html).not.toContain(`data-fact="pricing.temporary" data-verified="false"`);
    } finally {
      Object.assign(fact, original);
    }
  });
}
