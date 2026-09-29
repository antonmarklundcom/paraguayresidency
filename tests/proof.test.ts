import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROOF, type Proof } from '@content/shared/proof';
import { TEAM_KEYS } from '@/content/team';
import { SITE_KEYS, type SiteKey } from '@/sites/registry';
import {
  Guarantee,
  OfficeStrip,
  TeamSection,
  Testimonials,
  TrustBar,
  flagEmoji,
  reviewsFor,
} from '@/components';
import { PROOF_FIXTURE } from '@/app/(en)/dev/components/fixture';

const html = (element: ReactElement) => renderToStaticMarkup(element);
const render = (Component: (props: { site: SiteKey; proof?: Proof }) => ReactElement | null, site: SiteKey, proof?: Proof) =>
  html(createElement(Component, { site, proof }));

afterEach(() => vi.unstubAllEnvs());

describe('content/shared/proof.ts ships empty', () => {
  it('has no stat, review, photo, office, credential, press or guarantee', () => {
    expect(PROOF.stats).toEqual({ residenciesFiled: null, yearsInBusiness: null, googleRating: null });
    expect(PROOF.reviews).toEqual([]);
    expect(PROOF.cases).toEqual([]);
    expect(PROOF.office).toEqual({ address: null, mapsUrl: null, photos: [] });
    expect(PROOF.credentials).toEqual([]);
    expect(PROOF.press).toEqual([]);
    expect(PROOF.guarantee).toBeNull();
    for (const member of PROOF.team) {
      expect(member.photo).toBeNull();
      expect(member.languages).toEqual([]);
      expect(Object.values(member.bio).every((bio) => bio === null)).toBe(true);
    }
  });

  it('lists exactly the team in src/content/team.ts', () => {
    expect(PROOF.team.map((member) => member.key)).toEqual([...TEAM_KEYS]);
  });
});

describe('proof components with the real (empty) file', () => {
  for (const site of SITE_KEYS) {
    it(`${site}: TrustBar, Testimonials, OfficeStrip render nothing`, () => {
      expect(render(TrustBar, site)).toBe('');
      expect(render(Testimonials, site)).toBe('');
      expect(render(OfficeStrip, site)).toBe('');
    });

    it(`${site}: the guarantee shows only the guide's approved refund`, () => {
      const out = render(Guarantee, site);
      if (site === 'guide') {
        expect(out).toContain('14-day refund, no questions');
        expect(out).toContain('href="/refunds"');
      } else {
        expect(out).toBe('');
      }
    });

    it(`${site}: TeamSection shows monograms, never an image or an invented detail`, () => {
      const out = render(TeamSection, site);
      expect(out).not.toMatch(/<img\b/);
      for (const name of ['Anton Marklund', 'Yanina Alvarez', 'Diana Davalos']) expect(out).toContain(name);
      expect(out).toContain('>AM<');
      expect(out).not.toMatch(/Speaks|Habla|Fala|Talar/);
    });
  }
});

describe('proof components with fixture data', () => {
  it('TrustBar shows every item, each formatted in the brand locale', () => {
    const en = render(TrustBar, 'residency', PROOF_FIXTURE);
    expect(en).toContain('data-trust-bar');
    expect(en).toContain('123');
    expect(en).toContain('residencies filed');
    expect(en).toContain('4.8 on Google');
    expect(en).toContain('56 reviews');
    expect(en).toContain('href="https://example.com/fixture-reviews"');
    expect(en).toContain('years in business');
    expect(en.match(/<img\b/g)).toHaveLength(1);
    expect(render(TrustBar, 'residenciaes', PROOF_FIXTURE)).toContain('4,8 en Google');
  });

  it('TrustBar items are independent', () => {
    const onlyYears: Proof = { ...PROOF, stats: { ...PROOF.stats, yearsInBusiness: 3 } };
    const out = render(TrustBar, 'flytta', onlyYears);
    expect(out).toContain('år i branschen');
    expect(out).not.toContain('Google');
    expect(out).not.toMatch(/<img\b/);
  });

  it('Testimonials show the brand language, plus approved translations marked as such', () => {
    const en = render(Testimonials, 'residency', PROOF_FIXTURE);
    expect(en).toContain('Sample A.');
    expect(en).toContain('Sample E.');
    expect(en).not.toContain('Muestra B.');
    expect(en).toContain('🇬🇧');
    expect(en).toContain('aria-label="United Kingdom"');
    expect(en).toContain('May 2026');
    expect(en).toContain('Google review');
    expect(en).toContain('href="https://example.com/fixture-review"');
    expect(en).not.toContain('Translated from');

    const es = render(Testimonials, 'residenciaes', PROOF_FIXTURE);
    expect(es).toContain('Muestra B.');
    expect(es).toContain('Sample A.');
    expect(es).toContain('Traducido del inglés');
    expect(es).not.toContain('Exemplo C.');
    // Newest first: July's Spanish review before May's translated one.
    expect(es.indexOf('Muestra B.')).toBeLessThan(es.indexOf('Sample A.'));
  });

  it('Testimonials drop a review without permission', () => {
    const [first] = PROOF_FIXTURE.reviews;
    const proof = { ...PROOF, reviews: [{ ...first, permission: false as unknown as true }] };
    expect(reviewsFor('residency', proof)).toEqual([]);
    expect(render(Testimonials, 'residency', proof)).toBe('');
  });

  it('flags come from the country code', () => {
    expect(flagEmoji('se')).toBe('🇸🇪');
    expect(flagEmoji('BR')).toBe('🇧🇷');
    expect(flagEmoji('XYZ')).toBe('');
  });

  it('TeamSection renders the photo slot, languages and bio in the brand locale', () => {
    const sv = render(TeamSection, 'flytta', PROOF_FIXTURE);
    expect(sv.match(/<img\b/g)).toHaveLength(1);
    expect(sv).toContain('alt="Porträtt av Anton Marklund"');
    expect(sv).toContain('Talar svenska, engelska och spanska');
    expect(sv).toContain('Testbiografi');
    // Yanina and Diana have no photo: monograms.
    expect(sv).toContain('>YA<');
    expect(sv).toContain('>DD<');
  });

  it('Guarantee renders Anton’s wording on a service brand', () => {
    expect(render(Guarantee, 'residenciapt', PROOF_FIXTURE)).toContain('Garantia de teste');
  });

  it('OfficeStrip renders photos with localized alt text, the address and the map link', () => {
    const out = render(OfficeStrip, 'residenciapt', PROOF_FIXTURE);
    expect(out.match(/<img\b/g)).toHaveLength(3);
    expect(out).toContain('alt="Foto de teste"');
    expect(out).toContain('Fixture address, line one');
    expect(out).toContain('Abrir no Google Maps');
  });
});
