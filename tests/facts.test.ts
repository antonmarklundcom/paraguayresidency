import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { factKeys, getFact, factText } from '@content/shared/facts';

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
    ]) {
      expect(factKeys).toContain(key);
    }
  });

  it('renders hedged wording while unverified, and hedged wording carries no bare figure', () => {
    for (const key of factKeys) {
      const fact = getFact(key);
      if (!fact.verified) {
        expect(factText(key)).toBe(fact.hedged);
        // A hedged fact may anchor a year, but never a threshold, rate or term.
        expect(fact.hedged, `hedged text for ${key} quotes a figure`).not.toMatch(
          /(USD|EUR|\$|€)\s?[\d,.]+|[\d,.]+\s?%|\b\d+\s?(years?|months?|weeks?|days?)\b/i,
        );
      }
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
