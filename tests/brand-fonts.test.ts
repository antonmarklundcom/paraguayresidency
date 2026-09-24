import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { BRAND_FONT } from '@/lib/fonts';
import { SITE_KEYS } from '@/sites/registry';

// Theme token → the @font-face family and file stem in src/styles/fonts.css.
const TOKENS: Record<string, string> = {
  '--font-newsreader': 'newsreader',
  '--font-fraunces': 'fraunces',
  '--font-inter-tight': 'inter-tight',
  '--font-bricolage': 'bricolage',
  '--font-instrument': 'instrument-serif',
};

const fontsCss = readFileSync('src/styles/fonts.css', 'utf8');

for (const site of SITE_KEYS) {
  it(`${site} preloads the one display file its theme renders`, () => {
    const theme = readFileSync(`src/styles/themes/${site}.css`, 'utf8');
    const token = /--display-font: var\((--font-[a-z-]+)\)/.exec(theme)?.[1];
    const weight = /--display-weight: (\d+);/.exec(theme)?.[1];
    expect(token && TOKENS[token]).toBeTruthy();
    expect(BRAND_FONT[site]).toBe(`${TOKENS[token!]}-${weight}`);
    expect(existsSync(`public/fonts/${BRAND_FONT[site]}.woff2`)).toBe(true);
    expect(fontsCss).toContain(`url('/fonts/${BRAND_FONT[site]}.woff2') format('woff2'); font-weight: ${weight};`);
    // Body text stays on the system stack: one font download per page.
    expect(theme).toContain('--body-font: var(--font-system);');
  });
}
