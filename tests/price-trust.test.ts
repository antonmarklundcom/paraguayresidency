import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { facts, type Fact } from '@content/shared/facts';
import { PROOF, type Proof } from '@content/shared/proof';
import {
  CaseSnapshots,
  CompareTable,
  FromPrice,
  PriceTable,
  ServiceOffer,
  ServiceProof,
  casesFor,
  hasFeeFigure,
} from '@/components';
import { SERVICE_ROUTE_BY_PATH, serviceRouteFor, type OfferRoute } from '@/lib/service-routes';
import { SITE_KEYS, type SiteKey } from '@/sites/registry';
import { PROOF_FIXTURE } from '@/app/(en)/dev/components/fixture';

const html = (element: ReactElement) => renderToStaticMarkup(element);
const SERVICE_BRANDS = SITE_KEYS.filter((site) => site !== 'guide');
const ROUTES: OfferRoute[] = ['temporary', 'permanent', 'cedula', 'tax_residency', 'family', 'investor_pass'];
const FEE_KEY = (route: OfferRoute) => `pricing.${route}` as keyof typeof facts;

/** Fill one pricing fact the way Anton will, then put it back. */
function withFee(route: OfferRoute, patch: Partial<Fact>, run: () => void) {
  const fact = facts[FEE_KEY(route)] as Fact;
  const before = { ...fact };
  Object.assign(fact, patch);
  try {
    run();
  } finally {
    Object.assign(fact, before);
    for (const key of Object.keys(patch)) if (!(key in before)) delete (fact as unknown as Record<string, unknown>)[key];
  }
}

afterEach(() => vi.unstubAllEnvs());

describe('FromPrice while the pricing facts are unset', () => {
  for (const site of SERVICE_BRANDS) {
    it(`${site}: every route degrades to the honest written-quote wording, no figure`, () => {
      for (const route of ROUTES) {
        expect(hasFeeFigure(site, route)).toBe(false);
        const out = html(createElement(FromPrice, { site, route }));
        expect(out).toContain('data-price-state="quote"');
        expect(out).toContain(`data-fact="pricing.${route}" data-verified="false"`);
        const visible = out.replace(/<[^>]+>/g, '').trim();
        expect(visible.length).toBeGreaterThan(10);
        expect(visible).not.toMatch(/\d/);
      }
    });
  }
});

describe('FromPrice once Anton fills a pricing fact', () => {
  it('shows "From <figure> all-in" in each brand language, from the fact alone', () => {
    withFee(
      'temporary',
      { verified: true, display: { en: 'USD 1,800', es: 'USD 1.800', pt: 'USD 1.800', sv: 'USD 1 800' } },
      () => {
        const en = html(createElement(FromPrice, { site: 'residency', route: 'temporary' }));
        expect(en).toContain('data-price-state="from"');
        expect(en).toMatch(/From <span[^>]*data-fact="pricing.temporary" data-verified="true"[^>]*>USD 1,800<\/span> all-in/);
        expect(html(createElement(FromPrice, { site: 'residenciaes', route: 'temporary' }))).toMatch(/Desde <span[^>]*>USD 1\.800<\/span> todo incluido/);
        expect(html(createElement(FromPrice, { site: 'residenciapt', route: 'temporary' }))).toMatch(/A partir de <span[^>]*>USD 1\.800<\/span>, tudo inclu/);
        expect(html(createElement(FromPrice, { site: 'flytta', route: 'temporary' }))).toMatch(/Från <span[^>]*>USD 1 800<\/span> allt inkluderat/);
      },
    );
  });

  it('appears on the price table row and on the matching service page, and only there', () => {
    withFee('permanent', { verified: true, display: { en: 'USD 2,000' } }, () => {
      const table = html(createElement(PriceTable, { site: 'residency' }));
      expect(table).toContain('data-price-state="from"');
      expect(table.match(/data-price-state="from"/g)).toHaveLength(1);
      expect(table.match(/data-price-state="quote"/g)).toHaveLength(3);
      expect(html(createElement(ServiceOffer, { site: 'residency', path: '/residency/permanent-residency' }))).toContain('From <span');
      expect(html(createElement(ServiceOffer, { site: 'residency', path: '/residency/temporary-residency' }))).toContain('data-price-state="quote"');
    });
  });

  it('a published fact without a figure never gets wrapped as "From … all-in"', () => {
    withFee('cedula', { verified: true }, () => {
      expect(hasFeeFigure('residency', 'cedula')).toBe(false);
      const out = html(createElement(FromPrice, { site: 'residency', route: 'cedula' }));
      expect(out).toContain('data-price-state="quote"');
      expect(out).not.toContain('all-in');
    });
  });

  it('a sourced fact counts as published', () => {
    withFee('family', { sourced: { label: 'Fixture source', checkedOn: '2026-10-01' }, display: { en: 'USD 500' } }, () => {
      expect(hasFeeFigure('residency', 'family')).toBe(true);
      expect(html(createElement(FromPrice, { site: 'residency', route: 'family' }))).toContain('data-verified="sourced"');
    });
  });
});

describe('ServiceOffer', () => {
  it('renders on every mapped service page, with the note and a link to that brand’s pricing page', () => {
    const pricing: Partial<Record<SiteKey, string>> = { residency: '/pricing', investorpass: '/pricing', residenciaes: '/precios', residenciapt: '/precos', flytta: '/priser' };
    for (const [site, paths] of Object.entries(SERVICE_ROUTE_BY_PATH) as [SiteKey, Record<string, OfferRoute>][]) {
      for (const path of Object.keys(paths)) {
        const out = html(createElement(ServiceOffer, { site, path }));
        expect(out, `${site}${path}`).toContain('data-service-offer');
        expect(out).toContain(`href="${pricing[site]}"`);
      }
    }
  });

  it('renders nothing on a page with no route', () => {
    expect(html(createElement(ServiceOffer, { site: 'residency', path: '/residency/citizenship' }))).toBe('');
    expect(serviceRouteFor('guide', '/anything')).toBeNull();
  });

  it('is wired into every service shell', () => {
    for (const file of [
      'src/app/(en)/sites/residency/_lib/ServicePage.tsx',
      'src/app/(en)/sites/investorpass/_lib/ServicePage.tsx',
      'src/app/(es)/sites/residenciaes/_lib/ServicePage.tsx',
      'src/app/(pt)/sites/residenciapt/_lib/ServicoPage.tsx',
      'src/app/(sv)/sites/flytta/_lib/TopicPage.tsx',
    ]) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      expect(source, file).toContain('<ServiceOffer');
      expect(source, file).toContain('<ServiceProof');
    }
  });
});

describe('CompareTable', () => {
  for (const site of SERVICE_BRANDS) {
    it(`${site}: three options, shared government-fee and timeline rows through facts`, () => {
      const out = html(createElement(CompareTable, { site }));
      expect(out).toContain('data-compare-table');
      expect(out.match(/<th scope="col"/g)).toHaveLength(3);
      expect(out).toContain('data-row="gov"');
      expect(out).toContain('data-fact="fees.temporary_residency"');
      expect(out).toContain('data-fact="residency.timeline"');
      // Every figure on the table is a fact: none is typed into the copy.
      expect(out.replace(/<span data-fact=[^>]*>.*?<\/span>/g, '').replace(/<[^>]+>/g, '')).not.toMatch(/\d/);
    });
  }

  it('shows our own fee through the route’s pricing fact when given a route', () => {
    const out = html(createElement(CompareTable, { site: 'residency', route: 'cedula' }));
    expect(out).toContain('data-fact="pricing.cedula"');
  });
});

describe('case snapshots', () => {
  it('ship empty and render nothing for any brand', () => {
    expect(PROOF.cases).toEqual([]);
    for (const site of SITE_KEYS) {
      expect(html(createElement(CaseSnapshots, { site }))).toBe('');
      if (site !== 'guide') expect(html(createElement(ServiceProof, { site }))).toBe('');
    }
  });

  it('shows a case in the brand language, with nationality, route, localised weeks and outcome', () => {
    const en = html(createElement(CaseSnapshots, { site: 'residency', proof: PROOF_FIXTURE }));
    expect(en).toContain('data-case-snapshots');
    expect(en).toContain('From United Kingdom');
    expect(en).toContain('9 weeks from filing');
    expect(en).toContain('Fixture case: temporary residency approved.');
    expect(en).toContain('🇬🇧');
    expect(html(createElement(CaseSnapshots, { site: 'flytta', proof: PROOF_FIXTURE }))).toContain('9 veckor från ansökan');
  });

  it('a brand shows only cases that have an outcome in its own language, newest first', () => {
    // The second fixture case has only en + sv.
    expect(casesFor('residenciaes', PROOF_FIXTURE).map(({ item }) => item.countryCode)).toEqual(['GB']);
    expect(casesFor('residency', PROOF_FIXTURE).map(({ item }) => item.countryCode)).toEqual(['GB', 'SE']);
  });

  it('drops a case without permission or with no weeks', () => {
    const [first] = PROOF_FIXTURE.cases;
    const noPermission: Proof = { ...PROOF, cases: [{ ...first, permission: false as unknown as true }] };
    const noWeeks: Proof = { ...PROOF, cases: [{ ...first, weeks: 0 }] };
    expect(html(createElement(CaseSnapshots, { site: 'residency', proof: noPermission }))).toBe('');
    expect(html(createElement(CaseSnapshots, { site: 'residency', proof: noWeeks }))).toBe('');
  });
});

describe('trust surfaces reach the right pages of every brand', () => {
  const read = (file: string) => readFileSync(join(process.cwd(), 'src/app', file), 'utf8');
  const PAGES: Record<string, { home: string; pricing: string; about: string }> = {
    residency: { home: '(en)/sites/residency/page.tsx', pricing: '(en)/sites/residency/pricing/page.tsx', about: '(en)/sites/residency/about/page.tsx' },
    frontier: { home: '(en)/sites/frontier/page.tsx', pricing: '(en)/sites/frontier/pricing/page.tsx', about: '(en)/sites/frontier/about/page.tsx' },
    investorpass: { home: '(en)/sites/investorpass/page.tsx', pricing: '(en)/sites/investorpass/pricing/page.tsx', about: '(en)/sites/investorpass/about/page.tsx' },
    residenciaes: { home: '(es)/sites/residenciaes/page.tsx', pricing: '(es)/sites/residenciaes/precios/page.tsx', about: '(es)/sites/residenciaes/nosotros/page.tsx' },
    residenciapt: { home: '(pt)/sites/residenciapt/page.tsx', pricing: '(pt)/sites/residenciapt/precos/page.tsx', about: '(pt)/sites/residenciapt/sobre/page.tsx' },
    flytta: { home: '(sv)/sites/flytta/page.tsx', pricing: '(sv)/sites/flytta/priser/page.tsx', about: '(sv)/sites/flytta/var-historia/page.tsx' },
  };
  for (const [site, pages] of Object.entries(PAGES)) {
    it(`${site}: home, pricing and about carry the reviews, cases and guarantee blocks; pricing also the table and comparison`, () => {
      for (const page of [pages.home, pages.pricing, pages.about]) {
        const source = read(page);
        expect(source, page).toContain('<Testimonials');
        expect(source, page).toContain('<CaseSnapshots');
        expect(source, page).toContain('<Guarantee');
      }
      const pricing = read(pages.pricing);
      for (const tag of ['<TrustBar', '<PriceTable', '<CompareTable']) expect(pricing, pages.pricing).toContain(tag);
      expect(read(pages.home), pages.home).toContain('<TrustBar');
      expect(read(pages.about), pages.about).toContain('<TrustBar');
    });
  }

  it('every contact layout carries the trust bar, the office and the guarantee', () => {
    for (const file of ['src/lib/brand-contact.tsx', 'src/lib/contact-rich.tsx', 'src/app/(en)/sites/_w5b/ContactLayout.tsx']) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      for (const tag of ['<TrustBar', '<OfficeStrip', '<Guarantee']) expect(source, `${file} ${tag}`).toContain(tag);
    }
  });
});
