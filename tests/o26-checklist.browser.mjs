/**
 * O26 bug 6 proof: the document checklist (site audit 2026-10, issue 6) renders
 * and hydrates in a real browser on every brand that has it. Before #97 it
 * threw "Unknown encoding: base64url" client-side and showed "This page
 * couldn't load".
 *
 * Run against a production server: `npm run build && npx next start -p 3100`,
 * then `node tests/o26-checklist.browser.mjs 3100`.
 */
import { chromium } from 'playwright';

const port = process.argv[2] ?? '3100';
const PAGES = [
  ['residency', '/documents/checklist', 'en'],
  ['frontier', '/documents/checklist', 'en'],
  ['residenciaes', '/documentos/lista', 'es'],
  ['residenciapt', '/documentos/lista', 'pt-BR'],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let failed = 0;
for (const [brand, path, lang] of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  const response = await page.goto(`http://${brand}.localhost:${port}${path}`, { waitUntil: 'networkidle' });
  const body = await page.locator('body').innerText();
  const title = await page.title();
  const htmlLang = await page.getAttribute('html', 'lang');
  const canonical = await page.locator('link[rel="canonical"]').count();
  const selects = await page.locator('main select').count();
  // Interact: pick the second route and confirm the list re-renders without an error.
  const before = await page.locator('main li').count();
  if (selects) {
    const values = await page.locator('main select').first().locator('option').evaluateAll((o) => o.map((x) => x.value));
    if (values[1]) await page.locator('main select').first().selectOption(values[1]);
  }
  const after = await page.locator('main li').count();
  const form = await page.locator('main form input[name="email"]').count();
  const crashed = /couldn.t load|Unknown encoding|Application error/i.test(body);
  const ok = response?.status() === 200 && !crashed && !errors.length && title && htmlLang === lang && canonical === 1 && selects >= 2 && form >= 1 && after > 0;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${brand}${path}  status=${response?.status()} lang=${htmlLang} title="${title}" canonical=${canonical} selects=${selects} items=${before}->${after} leadForm=${form} errors=${JSON.stringify(errors)}`);
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
