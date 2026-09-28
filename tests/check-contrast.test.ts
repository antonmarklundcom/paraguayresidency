import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkTheme, contrast, parseRole, parseVars } from '../scripts/check-contrast';
import { SITE_KEYS } from '@/sites/registry';

const shared = parseVars(readFileSync('src/styles/tokens.css', 'utf8'));
const themes = readdirSync('src/styles/themes').filter((file) => file.endsWith('.css'));

describe('check:contrast', () => {
  it('computes WCAG ratios', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#ffffff', '#ffffff')).toBe(1);
    // Order does not matter.
    expect(contrast('#0b7a43', '#ffffff')).toBeCloseTo(contrast('#ffffff', '#0b7a43'), 10);
  });

  it('has one theme file per brand', () => {
    expect(themes.map((file) => file.replace('.css', '')).sort()).toEqual([...SITE_KEYS].sort());
  });

  for (const file of themes) {
    it(`${file} meets WCAG AA on every pair it uses`, () => {
      const css = readFileSync(`src/styles/themes/${file}`, 'utf8');
      const failed = checkTheme({ ...shared, ...parseVars(css) }, parseRole(css)).filter((pair) => !pair.ok);
      expect(failed.map((pair) => `${pair.fg} on ${pair.bg} ${pair.ratio.toFixed(2)}`)).toEqual([]);
    });

    it(`${file} has no warm pink or peach soft tint`, () => {
      const soft = parseVars(readFileSync(`src/styles/themes/${file}`, 'utf8'))['--accent-soft'];
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(soft.slice(i, i + 2), 16));
      // A peach/rose tint has red clearly above blue (the old guide #fbe7dc: 251 vs 220).
      expect(r - b, `${file} --accent-soft ${soft} leans warm`).toBeLessThanOrEqual(12);
    });
  }

  it('fails a pair under the bar', () => {
    const vars = { ...shared, ...parseVars(readFileSync('src/styles/themes/guide.css', 'utf8')), '--fg-muted': '#b0b0b0' };
    const failed = checkTheme(vars, 'text').filter((pair) => !pair.ok);
    expect(failed.map((pair) => pair.fg)).toContain('--fg-muted');
  });
});
