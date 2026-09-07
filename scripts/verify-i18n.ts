/**
 * `npm run verify:i18n` — the gate that stops a half-translated page shipping
 * (plan §1.3, §5.4.2).
 *
 * Three rules, all of them build-breaking:
 *
 *  1. Every shipped locale's `common.json` carries exactly the key set of
 *     `en/common.json`. There is no silent `en` fallback at runtime, so a key
 *     missing from `es` renders nothing on a Spanish page — that must never be
 *     discoverable in production.
 *  2. All seven per-brand files carry the same key set as each other. A shared
 *     component calls `t(site, 'contact.h1')` with a runtime `site`, so a key
 *     one brand has must exist for all of them.
 *  3. Every literal key referenced in `src/` or `content/` resolves.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const MESSAGES_ROOT = join(ROOT, 'src/i18n/messages');
const SCAN_DIRS = ['src', 'content'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.mdx', '.md']);

/** Kept in step with `src/i18n/locales.ts` and `src/sites/registry.ts`. */
const LOCALES = ['en', 'es', 'pt', 'sv'] as const;
const REFERENCE_LOCALE = 'en';

/** brand file → the locale folder it lives in (a brand has one locale, §1.3). */
const SITE_FILES: Record<string, (typeof LOCALES)[number]> = {
  residency: 'en',
  investorpass: 'en',
  guide: 'en',
  frontier: 'en',
  residenciaes: 'es',
  residenciapt: 'pt',
  flytta: 'sv',
};
const REFERENCE_SITE = 'residency';

const errors: string[] = [];

function readMessages(locale: string, file: string): Record<string, string> {
  const path = join(MESSAGES_ROOT, locale, `${file}.json`);
  if (!existsSync(path)) {
    errors.push(`missing message file: src/i18n/messages/${locale}/${file}.json`);
    return {};
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SCAN_EXT.has(extname(full))) out.push(full);
  }
  return out;
}

function diffKeys(label: string, reference: string[], actual: string[], refLabel: string): void {
  for (const k of reference) {
    if (!actual.includes(k)) errors.push(`${label}: missing key "${k}" (present in ${refLabel})`);
  }
  for (const k of actual) {
    if (!reference.includes(k)) errors.push(`${refLabel}: missing key "${k}" (present in ${label})`);
  }
}

// ---------------------------------------------------------------- 1. locales
const commons = Object.fromEntries(
  LOCALES.map((locale) => [locale, readMessages(locale, 'common')]),
) as Record<string, Record<string, string>>;

const commonKeys = Object.keys(commons[REFERENCE_LOCALE]);
for (const locale of LOCALES) {
  if (locale === REFERENCE_LOCALE) continue;
  diffKeys(
    `${locale}/common.json`,
    commonKeys,
    Object.keys(commons[locale]),
    `${REFERENCE_LOCALE}/common.json`,
  );
}

// ------------------------------------------------------------- 2. brand files
const perSite = Object.fromEntries(
  Object.entries(SITE_FILES).map(([site, locale]) => [site, readMessages(locale, site)]),
) as Record<string, Record<string, string>>;

const siteKeys = Object.keys(perSite[REFERENCE_SITE]);
for (const site of Object.keys(SITE_FILES)) {
  if (site === REFERENCE_SITE) continue;
  diffKeys(
    `${SITE_FILES[site]}/${site}.json`,
    siteKeys,
    Object.keys(perSite[site]),
    `${SITE_FILES[REFERENCE_SITE]}/${REFERENCE_SITE}.json`,
  );
}

// ------------------------------------------------------ 3. no empty values
for (const [locale, msgs] of Object.entries(commons)) {
  for (const [k, v] of Object.entries(msgs)) {
    if (typeof v !== 'string' || v.trim() === '') {
      errors.push(`${locale}/common.json: key "${k}" has no value`);
    }
  }
}
for (const [site, msgs] of Object.entries(perSite)) {
  for (const [k, v] of Object.entries(msgs)) {
    if (typeof v !== 'string' || v.trim() === '') {
      errors.push(`${SITE_FILES[site]}/${site}.json: key "${k}" has no value`);
    }
  }
}

// -------------------------------------- 4. every referenced key must resolve
const known = new Set([...commonKeys, ...siteKeys]);
// t(site, 'key')  |  t(siteVar, 'key')  |  t('key')
// The first argument may itself be a quoted site key, so it must be allowed to
// match before the key — otherwise t('residency', 'home.h1') reads "residency"
// as the key.
const CALL_RE = /\bt\(\s*(?:(?:[A-Za-z0-9_.$]+|['"`][\w-]+['"`])\s*,\s*)?['"`]([\w.-]+)['"`]/g;
// labelKey: 'nav.about' / titleKey: "footer.company"
const PROP_RE = /\b(?:labelKey|titleKey|messageKey|tKey)\s*:\s*['"`]([\w.-]+)['"`]/g;

let scanned = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    if (file.startsWith(MESSAGES_ROOT)) continue;
    const src = readFileSync(file, 'utf8');
    scanned += 1;
    for (const re of [CALL_RE, PROP_RE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        if (!known.has(m[1])) {
          errors.push(`${file.replace(`${ROOT}/`, '')}: unknown i18n key "${m[1]}"`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`verify:i18n FAILED (${errors.length} problem(s)):`);
  for (const e of [...new Set(errors)]) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `verify:i18n OK — ${commonKeys.length} common keys × ${LOCALES.length} locales, ` +
    `${siteKeys.length} brand keys × ${Object.keys(SITE_FILES).length} brands, ${scanned} files scanned.`,
);
