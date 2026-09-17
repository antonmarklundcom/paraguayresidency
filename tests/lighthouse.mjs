#!/usr/bin/env node
/**
 * O19 performance check (plan section 14.3): real Lighthouse mobile audits
 * against a running production server, with a performance bar of 0.90.
 *
 * Requires Node >= 22.19 (Lighthouse). One-time setup (after npm install):
 *   npx playwright install chromium
 * Linux CI may need `npx playwright install --with-deps chromium` instead.
 * Playwright finds its bundled browser; no machine-specific Chrome path needed.
 *
 *   npm run build
 *   npm start
 *   node tests/lighthouse.mjs http://127.0.0.1:3000
 *
 * This is a manual/CI tool, deliberately not part of npm run test or verify.
 * It uses Lighthouse's built-in mobile emulation and default throttling. Run
 * on an otherwise idle machine: performance scores vary with machine load.
 * Prints results only (no report files); exits 1 for any failed audit or score
 * below the bar, and 2 if the server/browser cannot be started or reached.
 */

import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3000';
const BAR = 0.90;
const brands = [
  ['residency', 'paraguayresidency.co.uk'],
  ['investorpass', 'paraguayinvestorpass.com'],
  ['guide', 'paraguayresidencyguide.com'],
  ['frontier', 'paraguayfrontier.com'],
  ['residenciaes', 'residenciaenparaguay.es'],
  ['residenciapt', 'vidanoparaguai.com'],
  ['flytta', 'flyttatillparaguay.se'],
];
const pages = [
  ...brands.map(([brand, host]) => ({ page: `${brand} /`, host, path: '/' })),
  { page: 'residency /residency/temporary-residency', host: brands[0][1], path: '/residency/temporary-residency' },
  // Explicitly repeated in the plan's additional-page list.
  { page: 'investorpass / (repeat)', host: brands[1][1], path: '/' },
  { page: 'frontier /tax', host: brands[3][1], path: '/tax' },
];

// Same production proxy shape as abuse.mjs: middleware reads this before Host.
const hostHeaders = (host) => ({ 'x-forwarded-host': host });

let browser;
let profile;
let failures = 0;
try {
  const base = new URL(BASE);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) {
    throw new Error('Use an HTTP(S) base URL without credentials.');
  }
  await fetch(new URL('/', base), {
    headers: hostHeaders(brands[0][1]), signal: AbortSignal.timeout(15000),
  });

  profile = await mkdtemp(join(tmpdir(), 'o19-lighthouse-'));
  browser = await chromium.launchPersistentContext(profile, {
    headless: true,
    args: ['--remote-debugging-port=0'],
  });
  // Chrome chooses a free port and records it in this isolated temporary profile.
  const port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
  if (!Number.isInteger(port) || port < 1) throw new Error('Chrome did not provide a debugging port.');

  console.log(`Lighthouse mobile | performance (0-1) | bar >= ${BAR.toFixed(2)}`);
  console.log(`${'Page'.padEnd(44)} ${'Score'.padEnd(7)} Result`);
  console.log('-'.repeat(64));
  for (const { page, host, path } of pages) {
    try {
      const result = await lighthouse(new URL(path, base).href, {
        port,
        logLevel: 'error',
        onlyCategories: ['performance'],
        formFactor: 'mobile',
        extraHeaders: hostHeaders(host),
      });
      const lhr = result?.lhr;
      const score = lhr?.categories.performance.score;
      if (lhr?.runtimeError || !Number.isFinite(score)) {
        const error = new Error('Lighthouse did not produce a valid score.');
        error.code = lhr?.runtimeError?.code ?? 'NO_PERFORMANCE_SCORE';
        throw error;
      }
      const ok = score >= BAR;
      if (!ok) failures += 1;
      console.log(`${page.padEnd(44)} ${score.toFixed(2).padEnd(7)} ${ok ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      failures += 1;
      // Error codes only: avoid dumping URLs, response bodies or browser logs.
      console.log(`${page.padEnd(44)} ${'N/A'.padEnd(7)} FAIL (${error.code ?? error.name})`);
    }
  }
  console.log(`\n${failures === 0 ? 'all audits passed' : `${failures} audit(s) failed`}`);
  process.exitCode = failures === 0 ? 0 : 1;
} catch (error) {
  console.error(`Audit setup failed (${error.code ?? error.name}). Check the base URL, running server and Playwright Chromium installation.`);
  process.exitCode = 2;
} finally {
  try {
    if (browser) await browser.close();
    if (profile) await rm(profile, { recursive: true, force: true });
  } catch {
    console.error('Could not completely clean up the temporary Chromium profile.');
    process.exitCode = 2;
  }
}
