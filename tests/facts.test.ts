import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { factKeys, getFact, factText, localized, type FactLocale } from '@content/shared/facts';
import { LOCALES } from '@/i18n/locales';
import { SITE_KEYS, sites } from '@/sites/registry';

const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (['.ts', '.tsx', '.mdx'].includes(extname(full))) out.push(full);
  }
  return out;
}

describe('facts (plan §1.10)', () => {
  it('seeds every key the plan requires', () => {
    for (const key of [
      'investorpass.min_investment_usd',
      'investorpass.launch_date',
      'investorpass.validity_years',
      'permanent.presence_rule',
      'temporary.duration',
      'cedula.timeline',
      'tax.territorial_rate',
      // Added in O9 for the ES/PT Mercosur pages and the frontier tax angle.
      'mercosur.residency_route',
      'tax.foreign_income_treatment',
    ]) {
      expect(factKeys).toContain(key);
    }
  });

  it('renders hedged wording while unverified, in every locale, with no bare figure', () => {
    // A threshold, rate or term. A hedged fact may anchor a year, never these.
    const FIGURE =
      /(USD|EUR|BRL|SEK|PYG|\$|€|R\$|kr)\s?[\d,.]+|[\d,.]+\s?%|\b\d+\s?(years?|months?|weeks?|days?|años?|meses|anos|år|månader|dagar|días?|dias?)\b/i;
    for (const key of factKeys) {
      const fact = getFact(key);
      if (fact.verified) continue;
      for (const locale of LOCALES) {
        const text = factText(key, locale as FactLocale);
        expect(text, `${key} renders nothing in ${locale}`).toBeTruthy();
        expect(text, `hedged text for ${key} (${locale}) quotes a figure`).not.toMatch(FIGURE);
        expect(text).toBe(localized(fact.hedged, locale as FactLocale));
      }
    }
  });

  it('always has an English string for every fact (plan §5.4.2)', () => {
    for (const key of factKeys) {
      const fact = getFact(key);
      expect(localized(fact.display, 'en'), `${key} display has no en`).toBeTruthy();
      expect(localized(fact.hedged, 'en'), `${key} hedged has no en`).toBeTruthy();
    }
  });

  it('resolves a fact for every brand locale without throwing', () => {
    for (const site of SITE_KEYS) {
      for (const key of factKeys) {
        expect(factText(key, sites[site].locale)).toBeTruthy();
      }
    }
  });

  it('gives the two O9 facts a translation in all four locales', () => {
    for (const key of ['mercosur.residency_route', 'tax.foreign_income_treatment'] as const) {
      const fact = getFact(key);
      for (const locale of LOCALES) {
        expect(typeof fact.hedged).toBe('object');
        expect(
          (fact.hedged as Record<string, string>)[locale],
          `${key} is missing a ${locale} hedged translation`,
        ).toBeTruthy();
      }
      expect(fact.verified, `${key} must ship unverified`).toBe(false);
    }
  });

  it('requires verifiedBy and verifiedOn on anything marked verified', () => {
    for (const key of factKeys) {
      const fact = getFact(key);
      if (fact.verified) {
        expect(fact.verifiedBy, `${key} verified without verifiedBy`).toBeTruthy();
        expect(fact.verifiedOn, `${key} verified without verifiedOn`).toBeTruthy();
      }
    }
  });

  it('every <Fact k="…"> in code or content points at a real key', () => {
    const re = /<Fact\s+[^>]*k=["']([\w.]+)["']/g;
    let found = 0;
    for (const dir of ['src', 'content']) {
      for (const file of walk(join(ROOT, dir))) {
        const src = readFileSync(file, 'utf8');
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(src))) {
          found += 1;
          expect(factKeys, `${file} uses unknown fact "${m[1]}"`).toContain(m[1]);
        }
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  it('never hardcodes a USD figure in MDX (facts rule)', () => {
    for (const file of walk(join(ROOT, 'content'))) {
      if (extname(file) !== '.mdx') continue;
      const src = readFileSync(file, 'utf8');
      expect(src, `${file} hardcodes a currency figure`).not.toMatch(/(USD|\$)\s?\d/i);
    }
  });
});
