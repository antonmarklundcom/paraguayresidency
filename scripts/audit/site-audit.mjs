#!/usr/bin/env node
/**
 * Full-site audit, live and local, all seven brands (docs/audit/2026-10).
 *
 *   npm run dev -- -p 3100                      # local side (another terminal)
 *   node scripts/audit/site-audit.mjs           # every brand, live + local
 *   node scripts/audit/site-audit.mjs --brands=guide,frontier --modes=live --no-shots
 *
 * Options: --brands=a,b  --modes=live,local  --concurrency=4  --no-shots
 *          --no-axe  --no-links  --max-discovered=60  --local-style=host|query
 *
 * For every brand and mode it reads /sitemap.xml (following sitemap indexes),
 * visits every URL in the union of the live and local sitemaps, plus internal
 * pages it discovers that the sitemap does not list, and records status, title,
 * description, H1s, canonical, hreflang, JSON-LD types (and whether each block
 * parses), robots, lang, word count, WhatsApp links (last 4 digits only), lead
 * forms, console errors, failed subresources and axe violations (WCAG 2.x
 * A/AA). Every internal href, every img src and every link to a sibling brand
 * domain is then checked once (HEAD, GET fallback, cached). Template pages get
 * full-page screenshots at 1440 and 390.
 *
 * Output: docs/audit/2026-10/raw/<brand>-<live|local>.json and
 *         docs/audit/2026-10/shots/<brand>-<template>-<live|local>-<width>.jpg
 *
 * It never submits a form and never clicks anything: read-only on production.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BRANDS, BRAND_DOMAINS, OUT_DIR, arg, baseUrl, last4, nodeFetchTarget, pool,
} from './brands.mjs';

const brandKeys = String(arg('brands', BRANDS.map((b) => b.key).join(','))).split(',');
const modes = String(arg('modes', 'live,local')).split(',');
const CONCURRENCY = Number(arg('concurrency', 4));
const SHOTS = !arg('no-shots', false);
const AXE = !arg('no-axe', false);
const LINKS = !arg('no-links', false);
const MAX_DISCOVERED = Number(arg('max-discovered', 60));
const LOCAL_STYLE = String(arg('local-style', 'host'));
const UA_NOTE = 'paraguayresidency-site-audit/2026-10';

const ASSET_RE = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|pdf|xml|txt|json|css|js|woff2?|ttf|mp4|webm|zip)$/i;

function normPath(p) {
  if (!p) return '/';
  let out = p.split('#')[0].split('?')[0];
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out || '/';
}

function pageUrl(brand, mode, path) {
  if (mode === 'local' && LOCAL_STYLE === 'query') {
    return `http://localhost:${process.env.AUDIT_LOCAL_PORT || 3100}${path}${path.includes('?') ? '&' : '?'}site=${brand.key}`;
  }
  return baseUrl(brand, mode) + path;
}

async function fetchText(url, brand, mode, timeoutMs = 60000) {
  const t = nodeFetchTarget(url, brand, mode);
  const res = await fetch(t.url, {
    headers: { ...t.headers, 'user-agent': UA_NOTE },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });
  return { status: res.status, text: await res.text(), finalUrl: res.url };
}

/** Sitemap URLs, following <sitemapindex>. Returns { status, urls, error, indexes }. */
async function readSitemap(brand, mode) {
  const root = `${baseUrl(brand, mode)}/sitemap.xml`;
  const seen = new Set();
  const urls = [];
  const indexes = [];
  let firstStatus = null;
  const queue = [root];
  try {
    while (queue.length) {
      const u = queue.shift();
      if (seen.has(u)) continue;
      seen.add(u);
      const { status, text } = await fetchText(u, brand, mode, 180000);
      if (firstStatus === null) firstStatus = status;
      if (status !== 200) continue;
      const locs = [...text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
      if (/<sitemapindex/i.test(text)) {
        indexes.push(u);
        for (const l of locs) queue.push(mode === 'local' ? rebase(l, brand, mode) : l);
      } else {
        urls.push(...locs);
      }
    }
    return { url: root, status: firstStatus, urls, indexes, error: null };
  } catch (e) {
    return { url: root, status: firstStatus, urls, indexes, error: describeError(e) };
  }
}

function rebase(absUrl, brand, mode) {
  const u = new URL(absUrl);
  return baseUrl(brand, mode) + u.pathname + u.search;
}

function describeError(e) {
  const cause = e?.cause;
  return [e?.name, e?.message, cause?.code, cause?.message].filter(Boolean).join(' | ').slice(0, 300);
}

/** Everything the page itself can tell us, collected in one evaluate. */
async function extract(page) {
  return page.evaluate(() => {
    const text = (el) => (el?.innerText ?? el?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null;
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try {
        const data = JSON.parse(s.textContent || '');
        const types = [];
        const visit = (node) => {
          if (Array.isArray(node)) return node.forEach(visit);
          if (!node || typeof node !== 'object') return;
          if (node['@type']) types.push(...[].concat(node['@type']));
          if (node['@graph']) visit(node['@graph']);
        };
        visit(data);
        return { ok: true, types };
      } catch (err) {
        return { ok: false, error: String(err).slice(0, 160), sample: (s.textContent || '').slice(0, 120) };
      }
    });
    const main = document.querySelector('main') || document.body;
    const words = text(main).split(' ').filter((w) => /\p{L}|\d/u.test(w)).length;
    const anchors = [...document.querySelectorAll('a[href]')].map((a) => ({
      href: a.href,
      raw: a.getAttribute('href'),
      text: text(a).slice(0, 80),
      rel: a.getAttribute('rel'),
      target: a.getAttribute('target'),
      inNav: !!a.closest('header, nav'),
      inFooter: !!a.closest('footer'),
    }));
    const imgs = [...document.querySelectorAll('img')].map((i) => ({
      src: i.currentSrc || i.src,
      alt: i.getAttribute('alt'),
      loaded: i.complete && i.naturalWidth > 0,
      lazy: i.loading === 'lazy',
    }));
    const wa = anchors.filter((a) => /wa\.me\/|api\.whatsapp\.com/.test(a.href));
    const waEls = [...document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com"]')];
    const forms = [...document.querySelectorAll('form')].map((f) => ({
      kind: f.querySelector('input[name="kind"]')?.value ?? null,
      site: f.querySelector('input[name="site"]')?.value ?? null,
      hasEmail: !!f.querySelector('input[type="email"], input[name="email"]'),
      fields: [...f.querySelectorAll('input:not([type=hidden]), select, textarea')].filter((x) => x.name !== 'website').map((x) => x.name),
    }));
    return {
      title: document.title,
      lang: document.documentElement.lang || null,
      description: meta('meta[name="description"]'),
      robots: meta('meta[name="robots"]'),
      ogImage: meta('meta[property="og:image"]'),
      ogTitle: meta('meta[property="og:title"]'),
      canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.href),
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => ({ hreflang: l.hreflang, href: l.href })),
      h1: [...document.querySelectorAll('h1')].map(text),
      h2count: document.querySelectorAll('h2').length,
      jsonld: ld,
      words,
      anchors,
      imgs,
      whatsapp: wa.map((a) => {
        const u = new URL(a.href);
        const num = u.hostname === 'wa.me' ? u.pathname.slice(1) : u.searchParams.get('phone');
        return { number: num, text: u.searchParams.get('text'), inNav: a.inNav, inFooter: a.inFooter };
      }),
      whatsappPlacements: waEls.map((a) => a.getAttribute('data-placement') || (a.hasAttribute('data-wa-fab') ? 'floating' : 'link')),
      fab: !!document.querySelector('[data-wa-fab]'),
      forms,
      checkout: [...document.querySelectorAll('#price button, #price [class*="rounded"]')].map(text).filter((t) => /buy|checkout|opens|comprar|kassa/i.test(t)).slice(0, 4),
    };
  });
}

/** Phone numbers never reach the raw JSON in full: last four digits only. */
function maskPhones(data) {
  const mask = (v) => (typeof v === 'string'
    ? v.replace(/(wa\.me\/)(\d+)/g, (_, a, d) => a + last4(d)).replace(/([?&]phone=)(\d+)/g, (_, a, d) => a + last4(d))
    : v);
  for (const a of data.anchors ?? []) { a.href = mask(a.href); a.raw = mask(a.raw); }
  for (const w of data.whatsapp ?? []) w.number = last4(w.number);
  return data;
}

async function crawlPage(context, brand, mode, path, { withAxe }) {
  const page = await context.newPage();
  const consoleErrors = [];
  const badResponses = [];
  const failedRequests = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${String(e.message).slice(0, 300)}`));
  page.on('response', (r) => { if (r.status() >= 400 && r.request().resourceType() !== 'document') badResponses.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }); });
  page.on('requestfailed', (r) => {
    const f = r.failure()?.errorText ?? '';
    if (!/ERR_ABORTED/.test(f)) failedRequests.push({ url: r.url(), error: f, type: r.resourceType() });
  });
  const url = pageUrl(brand, mode, path);
  const rec = { path, url, mode };
  const started = Date.now();
  try {
    let res;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await page.goto(url, { waitUntil: 'load', timeout: mode === 'local' ? 180000 : 60000 });
        break;
      } catch (e) {
        if (attempt === 1) throw e;
        await page.waitForTimeout(2000);
      }
    }
    rec.status = res?.status() ?? null;
    rec.finalUrl = page.url();
    rec.redirected = normPath(new URL(rec.finalUrl).pathname) !== normPath(path);
    const headers = res ? await res.allHeaders() : {};
    rec.xRobotsTag = headers['x-robots-tag'] ?? null;
    rec.xSite = headers['x-site'] ?? null;
    rec.loadMs = Date.now() - started;
    await page.waitForTimeout(1200); // hydration errors land after `load`
    Object.assign(rec, maskPhones(await extract(page)));
    if (withAxe) {
      try {
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        rec.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, sample: v.nodes[0]?.target?.join(' ') ?? null }));
      } catch (e) {
        rec.axeError = describeError(e);
      }
    }
  } catch (e) {
    rec.status = rec.status ?? null;
    rec.error = describeError(e);
  } finally {
    rec.consoleErrors = consoleErrors;
    rec.badResponses = badResponses.slice(0, 30);
    rec.failedRequests = failedRequests.slice(0, 30);
    await safeClose(page);
  }
  return rec;
}

/**
 * Closing a page that ended on Chromium's own error page (a domain that does
 * not resolve) can hang forever on Windows. Leave the error page first, and
 * never wait more than 10 s for the close.
 */
async function safeClose(target) {
  if (target.goto) await target.goto('about:blank', { timeout: 5000 }).catch(() => {});
  await Promise.race([target.close().catch(() => {}), new Promise((r) => setTimeout(r, 10000))]);
}

/** HEAD, falling back to GET when HEAD is refused or unsupported. */
async function checkUrl(url, brand, mode) {
  const t = nodeFetchTarget(url, brand, mode);
  const attempt = async (method) => {
    const res = await fetch(t.url, {
      method,
      headers: { ...t.headers, 'user-agent': UA_NOTE },
      redirect: 'follow',
      signal: AbortSignal.timeout(mode === 'local' ? 180000 : 30000),
    });
    if (method === 'GET') await res.body?.cancel().catch(() => {});
    return { status: res.status, finalUrl: res.url, redirected: res.redirected };
  };
  try {
    let r = await attempt('HEAD');
    if (r.status === 405 || r.status === 501 || r.status >= 500) r = await attempt('GET');
    return r;
  } catch {
    try {
      return await attempt('GET');
    } catch (e2) {
      return { status: null, error: describeError(e2) };
    }
  }
}

async function shoot(browser, brand, mode, template, path) {
  const out = [];
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
      isMobile: width === 390,
      hasTouch: width === 390,
      userAgent: width === 390
        ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
        : undefined,
    });
    const page = await context.newPage();
    const file = join(OUT_DIR, 'shots', `${brand.key}-${template}-${mode}-${width}.jpg`);
    try {
      const res = await page.goto(pageUrl(brand, mode, path), { waitUntil: 'load', timeout: mode === 'local' ? 180000 : 60000 });
      if (mode === 'local') await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
      // Walk the page so lazy images and reveal-on-scroll sections render.
      await page.evaluate(async () => {
        const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 70 });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      out.push({ template, path, width, file, status: res?.status() ?? null, height });
    } catch (e) {
      out.push({ template, path, width, file: null, error: describeError(e) });
    } finally {
      await safeClose(page);
      await safeClose(context);
    }
  }
  return out;
}

async function auditBrand(browser, brand, sitemaps) {
  const union = new Set();
  for (const m of ['live', 'local']) {
    for (const u of sitemaps[m]?.urls ?? []) union.add(normPath(new URL(u).pathname));
  }
  const paths = [...union].sort();
  const results = {};
  for (const mode of modes) {
    const t0 = Date.now();
    const sm = sitemaps[mode];
    const record = {
      brand: brand.key,
      domain: brand.domain,
      mode,
      base: baseUrl(brand, mode),
      localStyle: mode === 'local' ? LOCAL_STYLE : undefined,
      generatedAt: new Date().toISOString(),
      sitemap: sm ? { url: sm.url, status: sm.status, error: sm.error, indexes: sm.indexes, count: sm.urls.length, paths: sm.urls.map((u) => normPath(new URL(u).pathname)), hosts: [...new Set(sm.urls.map((u) => new URL(u).host))] } : null,
      reachable: true,
      pages: [],
      links: {},
      shots: [],
      health: null,
    };
    console.log(`[${brand.key}/${mode}] sitemap ${sm?.status ?? '-'} (${sm?.urls.length ?? 0} urls${sm?.error ? `, ${sm.error}` : ''}); visiting ${paths.length} paths`);
    // A domain that does not resolve cannot be crawled: record the browser's own error once.
    if (mode === 'live' && (sm?.error || sm?.status == null)) {
      const context = await browser.newContext();
      const probe = await crawlPage(context, brand, mode, '/', { withAxe: false });
      await safeClose(context);
      record.pages.push(probe);
      if (probe.error) {
        record.reachable = false;
        record.unreachableReason = probe.error;
        results[mode] = record;
        await save(brand, mode, record);
        console.log(`[${brand.key}/${mode}] unreachable: ${probe.error}`);
        continue;
      }
    }
    try {
      const h = await fetchText(`${baseUrl(brand, mode)}/api/health`, brand, mode, 60000);
      record.health = h.status === 200 ? JSON.parse(h.text) : { status: h.status };
    } catch (e) {
      record.health = { error: describeError(e) };
    }

    const contexts = await Promise.all(Array.from({ length: CONCURRENCY }, () => browser.newContext({ viewport: { width: 1440, height: 900 } })));
    const crawl = async (list, tag) => pool(list, CONCURRENCY, async (path, i, w) => {
      const rec = await crawlPage(contexts[w], brand, mode, path, { withAxe: AXE });
      rec.source = tag;
      if ((i + 1) % 20 === 0) console.log(`[${brand.key}/${mode}] ${tag} ${i + 1}/${list.length}`);
      return rec;
    });
    record.pages = await crawl(paths, 'sitemap');
    for (const p of record.pages) p.inSitemap = (record.sitemap?.paths ?? []).includes(p.path);

    // Internal pages linked from the crawl that no sitemap lists.
    const origin = new URL(baseUrl(brand, mode)).host;
    const known = new Set(paths);
    const discovered = new Set();
    for (const p of record.pages) {
      for (const a of p.anchors ?? []) {
        let u;
        try { u = new URL(a.href); } catch { continue; }
        if (u.host !== origin && !(LOCAL_STYLE === 'query' && u.hostname === 'localhost')) continue;
        const np = normPath(u.pathname);
        if (ASSET_RE.test(np) || np.startsWith('/api/') || np.startsWith('/_next/')) continue;
        if (!known.has(np)) discovered.add(np);
      }
    }
    const extra = [...discovered].sort().slice(0, MAX_DISCOVERED);
    if (extra.length) {
      console.log(`[${brand.key}/${mode}] ${discovered.size} linked pages not in any sitemap; crawling ${extra.length}`);
      const more = await crawl(extra, 'discovered');
      for (const p of more) p.inSitemap = false;
      record.pages.push(...more);
    }
    record.discoveredNotCrawled = [...discovered].sort().slice(MAX_DISCOVERED);
    await Promise.all(contexts.map((c) => safeClose(c)));

    if (LINKS) {
      const byPath = new Map(record.pages.map((p) => [p.path, p]));
      const targets = new Map();
      for (const p of record.pages) {
        for (const a of p.anchors ?? []) {
          let u;
          try { u = new URL(a.href); } catch { continue; }
          if (!/^https?:$/.test(u.protocol)) continue;
          u.hash = '';
          const internal = u.host === origin || (LOCAL_STYLE === 'query' && u.hostname === 'localhost');
          const sibling = BRAND_DOMAINS.has(u.hostname) && !internal;
          if (!internal && !sibling) continue;
          const key = u.toString();
          if (!targets.has(key)) targets.set(key, { kind: internal ? 'link' : 'sibling', from: new Set() });
          targets.get(key).from.add(p.path);
        }
        for (const img of p.imgs ?? []) {
          if (!img.src || img.src.startsWith('data:')) continue;
          const key = img.src;
          if (!targets.has(key)) targets.set(key, { kind: 'img', from: new Set() });
          targets.get(key).from.add(p.path);
        }
      }
      const list = [...targets.entries()];
      console.log(`[${brand.key}/${mode}] checking ${list.length} unique links/images`);
      const checked = await pool(list, CONCURRENCY, async ([url, info]) => {
        const u = new URL(url);
        const crawled = info.kind === 'link' && !u.search ? byPath.get(normPath(u.pathname)) : null;
        const r = crawled && crawled.status != null ? { status: crawled.status, viaCrawl: true } : await checkUrl(url, brand, mode);
        return [url, { ...r, kind: info.kind, from: [...info.from].slice(0, 8), fromCount: info.from.size }];
      });
      record.links = Object.fromEntries(checked);
    }

    if (SHOTS) {
      const templates = Object.entries(brand.templates).filter(([, p]) => p);
      for (const [template, path] of templates) {
        record.shots.push(...(await shoot(browser, brand, mode, template, path)));
      }
    }
    record.elapsedMs = Date.now() - t0;
    results[mode] = record;
    await save(brand, mode, record);
    console.log(`[${brand.key}/${mode}] done in ${Math.round(record.elapsedMs / 1000)}s`);
  }
  return results;
}

async function save(brand, mode, record) {
  await writeFile(join(OUT_DIR, 'raw', `${brand.key}-${mode}.json`), JSON.stringify(record, null, 1));
}

async function main() {
  await mkdir(join(OUT_DIR, 'raw'), { recursive: true });
  await mkdir(join(OUT_DIR, 'shots'), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const key of brandKeys) {
      const brand = BRANDS.find((b) => b.key === key);
      if (!brand) throw new Error(`unknown brand ${key}`);
      const sitemaps = {};
      // Both sitemaps are read even when only one mode is crawled, so each side
      // visits the same path set and the live/local diff is like for like.
      for (const m of ['live', 'local']) sitemaps[m] = await readSitemap(brand, m);
      await auditBrand(browser, brand, sitemaps);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
