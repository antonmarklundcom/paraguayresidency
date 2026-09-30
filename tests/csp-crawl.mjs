#!/usr/bin/env node
/**
 * CSP evidence crawl (O24, item 9). Loads every sitemap URL of every brand in
 * headless Chromium against a running `next start` and records each
 * Content-Security-Policy violation the page raises — report-only or
 * enforced, the browser fires `securitypolicyviolation` for both.
 *
 * This is the "check every page type in a built app" step before (and after)
 * the public policy is enforced. Build with the third parties switched on, or
 * the check proves nothing about them:
 *
 *   NEXT_PUBLIC_PLAUSIBLE_ENABLED=true NEXT_PUBLIC_WHATSAPP_NUMBER=595981000000 npm run build
 *   SESSION_SECRET=… npx next start -p 3100 &
 *   node tests/csp-crawl.mjs http://127.0.0.1:3100
 *
 * Desktop width, so `HeroVideo` actually mounts its `<video>`; each page waits
 * for `load` plus idle time, then scrolls, so lazy tiles and the video load.
 * Exit 1 on any violation. Uses the pre-installed Chromium when present.
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { HOSTS } from '../scripts/smoke-hosts.mjs';

const BASE = (process.argv[2] ?? 'http://127.0.0.1:3100').replace(/\/+$/, '');
const LIMIT = Number(process.env.CSP_CRAWL_LIMIT ?? 0) || Infinity;
const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;

async function sitemap(host) {
  const res = await fetch(`${BASE}/sitemap.xml`, { headers: { 'x-forwarded-host': host } });
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const violations = [];
let pages = 0;

for (const { key, host } of HOSTS) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: { 'x-forwarded-host': host },
  });
  // Collect violations from inside the page, where the browser reports them.
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__csp.push({ directive: e.violatedDirective, blocked: e.blockedURI, disposition: e.disposition, sample: e.sample });
    });
  });
  // Third-party requests are aborted: the policy decision happens before the
  // network, and the crawl must not depend on (or send data to) plausible.io.
  await context.route(/^https:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  const page = await context.newPage();
  const paths = (await sitemap(host)).slice(0, LIMIT);
  for (const path of paths) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 30_000 });
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(2500);
      const found = await page.evaluate(() => window.__csp ?? []);
      for (const v of found) violations.push({ site: key, path, ...v });
      pages += 1;
    } catch (error) {
      violations.push({ site: key, path, directive: 'LOAD-ERROR', blocked: String(error).slice(0, 120) });
    }
  }
  await context.close();
}
await browser.close();

console.log(`csp crawl: ${pages} pages, ${violations.length} violation(s)`);
for (const v of violations) console.log(`  ${v.site} ${v.path} — ${v.directive} ${v.disposition ?? ''} blocked=${v.blocked} ${v.sample ?? ''}`);
process.exit(violations.length ? 1 : 0);
