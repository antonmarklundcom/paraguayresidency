#!/usr/bin/env node
/**
 * Lighthouse mobile (the default form factor: Moto G-class emulation, simulated
 * slow 4G) on each LIVE homepage and one live article per brand, categories
 * performance / accessibility / seo / best-practices. Runs `npx lighthouse`
 * with Playwright's Chromium, so no local Chrome install is needed. Equivalent to
 *   CHROME_PATH=<playwright chromium> npx lighthouse <url> --form-factor=mobile \n *     --only-categories=performance,accessibility,seo,best-practices --output=json
 *
 *   node scripts/audit/lighthouse.mjs                  # all brands
 *   node scripts/audit/lighthouse.mjs --brands=guide
 *   node scripts/audit/lighthouse.mjs --from-files      # re-summarise saved reports
 *
 * Writes docs/audit/2026-10/lighthouse/<brand>-<home|article>.json (the LHR,
 * minus its base64 screenshots) and lighthouse/summary.json. A domain that does
 * not resolve is recorded as not run. Run it on an otherwise idle machine:
 * performance scores move with local CPU load.
 */
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { BRANDS, OUT_DIR, arg } from './brands.mjs';

const run = promisify(execFile);
const LH_CLI = join('node_modules', 'lighthouse', 'cli', 'index.js');
const keys = String(arg('brands', BRANDS.map((b) => b.key).join(','))).split(',');
/** Rebuild summary.json from the saved reports without running Lighthouse again. */
const FROM_FILES = !!arg('from-files', false);
const dir = join(OUT_DIR, 'lighthouse');

function lcpElement(lhr) {
  // Lighthouse 13 moved the element into the LCP-breakdown insight; older
  // versions keep it in `largest-contentful-paint-element`.
  const sources = [lhr.audits['lcp-breakdown-insight'], lhr.audits['largest-contentful-paint-element']];
  for (const audit of sources) {
    const items = audit?.details?.items ?? [];
    const node = items.find((i) => i.type === 'node') ?? items.flatMap((i) => i.items ?? []).find((i) => i.node)?.node;
    if (node) return { selector: node.selector ?? null, snippet: (node.snippet ?? '').slice(0, 200), label: node.nodeLabel ?? null };
  }
  return null;
}

function lcpBreakdown(lhr) {
  const table = (lhr.audits['lcp-breakdown-insight']?.details?.items ?? []).find((i) => i.type === 'table');
  return table ? Object.fromEntries(table.items.map((i) => [i.subpart, Math.round(i.duration)])) : null;
}

function row(lhr, brand, kind, url, note = null) {
  const score = (c) => (lhr.categories[c]?.score == null ? null : Math.round(lhr.categories[c].score * 100));
  return {
    brand, kind, url, run: true,
    finalUrl: lhr.finalDisplayedUrl ?? lhr.finalUrl,
    performance: score('performance'),
    accessibility: score('accessibility'),
    seo: score('seo'),
    bestPractices: score('best-practices'),
    lcpMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? NaN),
    tbtMs: Math.round(lhr.audits['total-blocking-time']?.numericValue ?? NaN),
    cls: Number((lhr.audits['cumulative-layout-shift']?.numericValue ?? NaN).toFixed(3)),
    fcpMs: Math.round(lhr.audits['first-contentful-paint']?.numericValue ?? NaN),
    lcpElement: lcpElement(lhr),
    lcpBreakdown: lcpBreakdown(lhr),
    runWarnings: lhr.runWarnings ?? [],
    runtimeError: lhr.runtimeError ?? null,
    note,
    fetchTime: lhr.fetchTime,
    lighthouseVersion: lhr.lighthouseVersion,
  };
}

async function main() {
  await mkdir(dir, { recursive: true });
  const chrome = chromium.executablePath();
  const summary = [];
  for (const key of keys) {
    const brand = BRANDS.find((b) => b.key === key);
    const targets = [['home', '/'], ['article', brand.templates.article]];
    let resolvable = true;
    try { await lookup(brand.domain); } catch { resolvable = false; }
    for (const [kind, path] of targets) {
      const url = `https://${brand.domain}${path}`;
      if (!resolvable) {
        summary.push({ brand: key, kind, url, run: false, reason: `DNS: ${brand.domain} does not resolve` });
        console.log(`[lh] ${key} ${kind}: not run (DNS)`);
        continue;
      }
      const out = join(dir, `${key}-${kind}.json`);
      const tmp = `${out}.tmp`;
      if (FROM_FILES) {
        try {
          summary.push(row(JSON.parse(await readFile(out, 'utf8')), key, kind, url));
        } catch (e) {
          summary.push({ brand: key, kind, url, run: false, reason: `no saved report (${e.code ?? e.message})` });
        }
        continue;
      }
      try {
        // The same binary `npx lighthouse` runs, called directly so the
        // multi-word --chrome-flags value needs no shell quoting on Windows.
        let cleanupError = null;
        await run(process.execPath, [
          LH_CLI, url,
          '--output=json', `--output-path=${tmp}`,
          '--only-categories=performance,accessibility,seo,best-practices',
          '--form-factor=mobile',
          '--max-wait-for-load=60000',
          '--quiet',
          '--chrome-flags=--headless=new --no-first-run --disable-extensions',
        ], { env: { ...process.env, CHROME_PATH: chrome }, maxBuffer: 64 * 1024 * 1024, timeout: 240000 }).catch((e) => {
          // On Windows chrome-launcher often fails to delete its temp profile
          // (EPERM) AFTER the report is saved; keep the report in that case.
          if (!/EPERM/.test(String(e.stderr ?? e.message))) throw e;
          cleanupError = 'chrome-launcher EPERM on temp-profile cleanup (Windows); report was saved';
        });
        const lhr = JSON.parse(await readFile(tmp, 'utf8'));
        await rm(tmp, { force: true });
        for (const heavy of ['screenshot-thumbnails', 'final-screenshot', 'full-page-screenshot']) delete lhr.audits[heavy];
        delete lhr.fullPageScreenshot;
        await writeFile(out, JSON.stringify(lhr));
        const r = row(lhr, key, kind, url, cleanupError);
        summary.push(r);
        console.log(`[lh] ${key} ${kind}: P${r.performance} A${r.accessibility} SEO${r.seo} BP${r.bestPractices} LCP ${r.lcpMs}ms TBT ${r.tbtMs}ms CLS ${r.cls}`);
      } catch (e) {
        summary.push({ brand: key, kind, url, run: false, reason: String(e.message ?? e).slice(0, 300) });
        console.log(`[lh] ${key} ${kind}: failed ${String(e.message ?? e).slice(0, 200)}`);
      }
    }
  }
  // Merge with earlier rows, so a partial re-run (--brands=x) keeps the rest.
  let previous = [];
  try { previous = JSON.parse(await readFile(join(dir, 'summary.json'), 'utf8')).rows ?? []; } catch { /* first run */ }
  const rows = [...previous.filter((r) => !keys.includes(r.brand)), ...summary]
    .sort((a, b) => BRANDS.findIndex((x) => x.key === a.brand) - BRANDS.findIndex((x) => x.key === b.brand));
  await writeFile(join(dir, 'summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
