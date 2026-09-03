/**
 * `npm run verify:i18n` — fails the build when a translation key referenced in
 * code or content does not exist, or when the three per-site message files
 * drift apart. Part of `npm run verify` (plan §5.1.4).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const MESSAGES_DIR = join(ROOT, 'src/i18n/messages/en');
const SCAN_DIRS = ['src', 'content'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.mdx', '.md']);
const SITE_FILES = ['residency.json', 'investorpass.json', 'guide.json'];

function readJson(file: string): Record<string, string> {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, file), 'utf8'));
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

const common = readJson('common.json');
const perSite = Object.fromEntries(SITE_FILES.map((f) => [f, readJson(f)]));

const errors: string[] = [];

// 1. The three site files must carry the same key set — a key used as
//    `t(site, 'x')` with a runtime `site` must exist for every brand.
const referenceKeys = Object.keys(perSite['residency.json']).sort();
for (const file of SITE_FILES.slice(1)) {
  const keys = Object.keys(perSite[file]).sort();
  for (const k of referenceKeys) {
    if (!keys.includes(k)) errors.push(`${file}: missing key "${k}" (present in residency.json)`);
  }
  for (const k of keys) {
    if (!referenceKeys.includes(k)) {
      errors.push(`residency.json: missing key "${k}" (present in ${file})`);
    }
  }
}

// 2. Empty values are almost always an unfinished key.
for (const [file, msgs] of Object.entries({ 'common.json': common, ...perSite })) {
  for (const [k, v] of Object.entries(msgs)) {
    if (typeof v !== 'string' || v.trim() === '') errors.push(`${file}: key "${k}" has no value`);
  }
}

// 3. Every literal key referenced in code must resolve.
const known = new Set([...Object.keys(common), ...referenceKeys]);
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
    if (file.includes(`${MESSAGES_DIR}`)) continue;
    const src = readFileSync(file, 'utf8');
    scanned += 1;
    for (const re of [CALL_RE, PROP_RE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        const key = m[1];
        if (!known.has(key)) {
          errors.push(`${file.replace(`${ROOT}/`, '')}: unknown i18n key "${key}"`);
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
  `verify:i18n OK — ${known.size} keys, ${SITE_FILES.length} site files in sync, ${scanned} files scanned.`,
);
