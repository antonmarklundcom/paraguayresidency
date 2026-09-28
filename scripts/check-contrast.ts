/**
 * `npm run check:contrast` — WCAG AA for every text/background pair the
 * themes actually use (overhaul plan §1.1). Part of `npm run verify`.
 *
 * Reads the seven `src/styles/themes/*.css` files plus the shared tokens in
 * `src/styles/tokens.css` (the WhatsApp green is shared), resolves each pair
 * below, and exits 1 when any pair is under its bar:
 *
 *  - 4.5:1 for body text (WCAG 1.4.3),
 *  - 3:1 for large text and UI shapes such as a button against the page
 *    (WCAG 1.4.3 large, 1.4.11).
 *
 * How a theme uses its second colour is declared in the theme file itself,
 * in a comment: `check-contrast: accent-2 text | fill | decorative`.
 *   text        `--accent-2` is text on the light surfaces, and
 *               `--accent-2-on-dark` is text on a dark band (`--fg` as the
 *               background);
 *   fill        `--accent-2` is a background carrying `--accent-2-fg` text;
 *   decorative  hairlines and rules only, never text.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Role = 'text' | 'fill' | 'decorative';

export interface Pair {
  fg: string;
  bg: string;
  min: number;
  /** What the pair is used for, printed on failure. */
  use: string;
}

export interface PairResult extends Pair {
  fgHex: string;
  bgHex: string;
  ratio: number;
  ok: boolean;
}

const BODY = 4.5;
const LARGE_OR_UI = 3;

/** `#rgb` / `#rrggbb` → [r, g, b] 0–255. Alpha forms are not used by the themes. */
export function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '').toLowerCase();
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  if (!/^[0-9a-f]{6}$/.test(full)) throw new Error(`Not a solid hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG 2.x relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every `--name: #hex;` declaration in a stylesheet. */
export function parseVars(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
    vars[match[1]] = match[2];
  }
  return vars;
}

export function parseRole(css: string): Role {
  const role = /check-contrast:\s*accent-2\s+(text|fill|decorative)/.exec(css)?.[1];
  if (!role) throw new Error('Theme is missing its `check-contrast: accent-2 <role>` comment.');
  return role as Role;
}

/** The pairs a theme must pass, given how it uses its second colour. */
export function pairsFor(role: Role): Pair[] {
  const pairs: Pair[] = [];
  for (const bg of ['--bg', '--surface', '--surface-alt', '--accent-soft']) {
    pairs.push({ fg: '--fg', bg, min: BODY, use: 'body text' });
  }
  for (const bg of ['--bg', '--surface', '--surface-alt']) {
    pairs.push({ fg: '--fg-muted', bg, min: BODY, use: 'secondary text' });
  }
  for (const bg of ['--bg', '--surface', '--surface-alt', '--accent-soft']) {
    pairs.push({ fg: '--accent', bg, min: BODY, use: 'link text and eyebrows' });
  }
  pairs.push({ fg: '--accent-fg', bg: '--accent', min: BODY, use: 'button label' });
  pairs.push({ fg: '--accent', bg: '--bg', min: LARGE_OR_UI, use: 'button shape and focus ring against the page' });
  pairs.push({ fg: '--wa-fg', bg: '--wa', min: BODY, use: 'WhatsApp button label' });
  pairs.push({ fg: '--wa', bg: '--bg', min: LARGE_OR_UI, use: 'WhatsApp button shape against the page' });
  if (role === 'text') {
    pairs.push({ fg: '--accent-2', bg: '--bg', min: BODY, use: 'second colour as text' });
    pairs.push({ fg: '--accent-2', bg: '--surface', min: BODY, use: 'second colour as text' });
    pairs.push({ fg: '--accent-2-on-dark', bg: '--fg', min: BODY, use: 'second colour as text on a dark band' });
  }
  if (role === 'fill') {
    pairs.push({ fg: '--accent-2-fg', bg: '--accent-2', min: BODY, use: 'text on a second-colour fill' });
  }
  return pairs;
}

export function checkTheme(vars: Record<string, string>, role: Role): PairResult[] {
  return pairsFor(role).map((pair) => {
    const fgHex = vars[pair.fg];
    const bgHex = vars[pair.bg];
    if (!fgHex || !bgHex) {
      throw new Error(`Missing ${!fgHex ? pair.fg : pair.bg} for "${pair.use}"`);
    }
    const ratio = contrast(fgHex, bgHex);
    return { ...pair, fgHex, bgHex, ratio, ok: ratio >= pair.min };
  });
}

function main() {
  const root = process.cwd();
  const shared = parseVars(readFileSync(join(root, 'src/styles/tokens.css'), 'utf8'));
  const themeDir = join(root, 'src/styles/themes');
  const files = readdirSync(themeDir).filter((file) => file.endsWith('.css')).sort();
  let failures = 0;
  let checked = 0;
  for (const file of files) {
    const css = readFileSync(join(themeDir, file), 'utf8');
    // Theme values win over the shared defaults, exactly as in the cascade.
    const vars = { ...shared, ...parseVars(css) };
    const results = checkTheme(vars, parseRole(css));
    checked += results.length;
    const failed = results.filter((result) => !result.ok);
    failures += failed.length;
    const lowest = results.reduce((min, result) => (result.ratio / result.min < min.ratio / min.min ? result : min));
    console.log(
      `${file.replace('.css', '').padEnd(13)} ${failed.length ? 'FAIL' : 'ok  '} ` +
        `${results.length} pairs, tightest ${lowest.fg} on ${lowest.bg} ${lowest.ratio.toFixed(2)}:1 (min ${lowest.min})`,
    );
    for (const result of failed) {
      console.log(
        `    ${result.fg} ${result.fgHex} on ${result.bg} ${result.bgHex}: ` +
          `${result.ratio.toFixed(2)}:1 < ${result.min}:1 (${result.use})`,
      );
    }
  }
  if (failures) {
    console.error(`check:contrast FAILED — ${failures} of ${checked} pairs under WCAG AA.`);
    process.exit(1);
  }
  console.log(`check:contrast OK — ${checked} pairs across ${files.length} themes meet WCAG AA.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
