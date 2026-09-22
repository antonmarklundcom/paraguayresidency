import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { factLocaleErrors } from '../scripts/verify-i18n';
import type { Fact } from '../content/shared/facts';

const forbidden = /two\s+years,\s+then\s+permanent|dos\s+años,\s+y\s+después|ten-year\s+card|10-year\s+card|valid\s+for\s+only\s+90\s+days/i;

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

describe('legal copy', () => {
  it('contains no prohibited bare legal figures in app or content source', () => {
    const violations = ['src/app', 'content'].flatMap((dir) =>
      files(join(process.cwd(), dir))
        // The facts register holds the verified wording on purpose; pages must not.
        .filter((file) => !file.endsWith(join('shared', 'facts.ts')))
        .filter((file) => forbidden.test(readFileSync(file, 'utf8'))),
    );
    expect(violations.map((file) => relative(process.cwd(), file))).toEqual([]);
  });

  it.each([
    'TWO YEARS, THEN PERMANENT', 'Dos años, y después',
    'Ten-year card', '10-Year Card', 'valid for only 90 days',
  ])('recognises the prohibited phrase %s', (phrase) => {
    expect(forbidden.test(phrase)).toBe(true);
  });
});

describe('Fact locale verification', () => {
  it('covers every Fact rendered in the current non-English brand sources', () => {
    const errors = ['src/app', 'content'].flatMap((dir) =>
      files(join(process.cwd(), dir)).flatMap((file) =>
        factLocaleErrors(relative(process.cwd(), file), readFileSync(file, 'utf8')),
      ),
    );
    expect(errors).toEqual([]);
  });

  const fact: Fact = {
    key: 'sample', label: 'Sample', display: 'display',
    hedged: { en: 'pending review' }, verified: false, sources: [],
  };
  const register = { sample: fact };

  it.each([
    ['src/app/(es)/sites/residenciaes/page.tsx', 'es'],
    ['src/app/(pt)/sites/residenciapt/page.tsx', 'pt'],
    ['src/app/(sv)/sites/flytta/page.tsx', 'sv'],
    ['content/residenciaes/article.mdx', 'es'],
    ['content/residenciapt/article.mdx', 'pt'],
    ['content/flytta/article.mdx', 'sv'],
  ])('rejects a missing hedge in %s', (file, locale) => {
    expect(factLocaleErrors(file, '<Fact\n site={SITE}\n k="sample" />', register))
      .toEqual([`${file}: Fact "sample" has no hedged string for locale "${locale}"`]);
    expect(factLocaleErrors(file, "<Fact k={'sample'} />", {
      sample: { ...fact, hedged: { en: 'pending review', [locale]: 'local wording' } },
    })).toEqual([]);
  });

  it('handles Windows paths and rejects empty, scalar and unknown hedges', () => {
    const file = 'content\\flytta\\article.mdx';
    for (const hedged of ['pending review', { en: 'pending review', sv: ' ' }]) {
      expect(factLocaleErrors(file, '<Fact k="sample" />', {
        sample: { ...fact, hedged },
      })).toHaveLength(1);
    }
    expect(factLocaleErrors(file, '<Fact k="unknown" />', register)).toHaveLength(1);
    expect(factLocaleErrors(file, '<Fact k={key} />', register)).toHaveLength(1);
  });

  it('does not require unused locales or translate English-only content', () => {
    expect(factLocaleErrors('src/app/(en)/sites/frontier/page.tsx', '<Fact k="sample" />', register)).toEqual([]);
    expect(factLocaleErrors('content/frontier/story.mdx', '<Fact k="sample" />', register)).toEqual([]);
    expect(factLocaleErrors('content/flytta/article.mdx', 'No facts here.', register)).toEqual([]);
  });
});
