#!/usr/bin/env node
/**
 * Turns the raw audit JSON into the numbers the report quotes.
 *
 *   node scripts/audit/analyze.mjs            # prints markdown tables
 *   node scripts/audit/analyze.mjs --json     # also writes raw/summary.json
 *
 * Reads docs/audit/2026-10/raw/<brand>-<mode>.json, raw/conversion.json and
 * lighthouse/summary.json (whichever exist).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRANDS, OUT_DIR, arg } from './brands.mjs';

const WRITE_JSON = !!arg('json', false);
const THIN = 300;

async function load(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return null; }
}

const isNoindex = (p) => /noindex/i.test(p.robots ?? '') || /noindex/i.test(p.xRobotsTag ?? '');
const len = (s) => (s == null ? 0 : [...s].length);
const ok = (s) => s != null && s >= 200 && s < 400;

function templateOf(path) {
  if (path === '/') return 'home';
  if (/^\/(privacy|terms|refunds)$/.test(path)) return 'legal';
  if (/^\/(contact|route-finder|book)/.test(path)) return 'conversion';
  if (path.split('/').length > 2 && /^\/(guides|guias|guider|blog|insights|stories|stader)\//.test(path)) return 'article';
  return 'page';
}

function analyzeSide(brand, rec) {
  if (!rec) return null;
  if (!rec.reachable) return { reachable: false, reason: rec.unreachableReason, health: rec.health };
  const pages = rec.pages.filter((p) => !p.error);
  const errored = rec.pages.filter((p) => p.error);
  const html = pages.filter((p) => ok(p.status));
  const statuses = {};
  for (const p of rec.pages) statuses[p.error ? 'error' : p.status] = (statuses[p.error ? 'error' : p.status] ?? 0) + 1;
  const smPaths = new Set(rec.sitemap?.paths ?? []);
  const indexable = html.filter((p) => !isNoindex(p) && !p.redirected);

  const titleCount = {};
  for (const p of indexable) titleCount[p.title] = (titleCount[p.title] ?? 0) + 1;
  const descCount = {};
  for (const p of indexable) if (p.description) descCount[p.description] = (descCount[p.description] ?? 0) + 1;

  const expectedCanon = (p) => `https://${brand.domain}${p.path === '/' ? '/' : p.path}`;
  const canonOk = (p) => p.canonical?.length === 1 && [expectedCanon(p), expectedCanon(p).replace(/\/$/, '')].includes(p.canonical[0]);

  const issues = {
    missingTitle: indexable.filter((p) => !p.title).map((p) => p.path),
    longTitle: indexable.filter((p) => len(p.title) > 60).map((p) => ({ path: p.path, len: len(p.title), title: p.title })),
    shortTitle: indexable.filter((p) => p.title && len(p.title) < 25).map((p) => ({ path: p.path, len: len(p.title), title: p.title })),
    dupTitle: Object.entries(titleCount).filter(([, n]) => n > 1).map(([t, n]) => ({ title: t, n, paths: indexable.filter((p) => p.title === t).map((p) => p.path) })),
    missingDesc: indexable.filter((p) => !p.description).map((p) => p.path),
    longDesc: indexable.filter((p) => len(p.description) > 160).map((p) => ({ path: p.path, len: len(p.description) })),
    shortDesc: indexable.filter((p) => p.description && len(p.description) < 70).map((p) => ({ path: p.path, len: len(p.description), description: p.description })),
    dupDesc: Object.entries(descCount).filter(([, n]) => n > 1).map(([d, n]) => ({ description: d.slice(0, 90), n })),
    h1Missing: html.filter((p) => (p.h1?.length ?? 0) === 0).map((p) => p.path),
    h1Multiple: html.filter((p) => (p.h1?.length ?? 0) > 1).map((p) => ({ path: p.path, h1: p.h1 })),
    canonicalMissing: indexable.filter((p) => !p.canonical?.length).map((p) => p.path),
    canonicalWrong: indexable.filter((p) => p.canonical?.length && !canonOk(p)).map((p) => ({ path: p.path, canonical: p.canonical })),
    noindexInSitemap: html.filter((p) => isNoindex(p) && smPaths.has(p.path)).map((p) => p.path),
    noindexPages: html.filter((p) => isNoindex(p)).map((p) => p.path),
    wrongLang: html.filter((p) => !(p.lang ?? '').toLowerCase().startsWith(brand.locale)).map((p) => ({ path: p.path, lang: p.lang })),
    thin: indexable.filter((p) => p.words < THIN).map((p) => ({ path: p.path, words: p.words, template: templateOf(p.path) })),
    notInSitemap: html.filter((p) => !smPaths.has(p.path)).map((p) => ({ path: p.path, status: p.status, noindex: isNoindex(p), source: p.source })),
    sitemapNon200: rec.pages.filter((p) => smPaths.has(p.path) && (!ok(p.status) || p.redirected)).map((p) => ({ path: p.path, status: p.status, finalUrl: p.finalUrl, error: p.error })),
    jsonldParseErrors: html.flatMap((p) => (p.jsonld ?? []).filter((b) => !b.ok).map((b) => ({ path: p.path, error: b.error }))),
    noOgImage: indexable.filter((p) => !p.ogImage).map((p) => p.path),
  };

  // Inbound links (other pages -> this page), all zones and body-only.
  const inbound = new Map(html.map((p) => [p.path, { all: 0, body: 0 }]));
  const host = new URL(rec.base).host;
  for (const p of html) {
    const seen = new Set();
    for (const a of p.anchors ?? []) {
      let u; try { u = new URL(a.href); } catch { continue; }
      if (u.host !== host) continue;
      let tp = u.pathname.replace(/\/$/, '') || '/';
      if (tp === p.path || seen.has(tp) || !inbound.has(tp)) continue;
      seen.add(tp);
      inbound.get(tp).all++;
      if (!a.inNav && !a.inFooter) inbound.get(tp).body++;
    }
  }
  issues.orphans = [...inbound.entries()].filter(([path, v]) => v.all === 0 && path !== '/' && smPaths.has(path)).map(([path]) => path);
  issues.noBodyInbound = [...inbound.entries()].filter(([path, v]) => v.body === 0 && path !== '/' && smPaths.has(path) && templateOf(path) === 'article').map(([path]) => path);

  // Schema coverage.
  const typeCount = {};
  for (const p of html) for (const b of p.jsonld ?? []) for (const t of b.types ?? []) typeCount[t] = (typeCount[t] ?? 0) + 1;
  const articles = html.filter((p) => templateOf(p.path) === 'article');
  const schema = {
    types: typeCount,
    homeTypes: [...new Set((html.find((p) => p.path === '/')?.jsonld ?? []).flatMap((b) => b.types ?? []))],
    articlesWithBreadcrumb: articles.filter((p) => p.jsonld?.some((b) => b.types?.includes('BreadcrumbList'))).length,
    articlesWithArticleType: articles.filter((p) => p.jsonld?.some((b) => b.types?.some((t) => /Article|BlogPosting/.test(t)))).length,
    articles: articles.length,
    pagesWithFaq: html.filter((p) => p.jsonld?.some((b) => b.types?.includes('FAQPage'))).length,
    localBusiness: html.some((p) => p.jsonld?.some((b) => b.types?.some((t) => /LocalBusiness|ProfessionalService|LegalService/.test(t)))),
    organization: html.some((p) => p.jsonld?.some((b) => b.types?.includes('Organization'))),
  };

  // Broken links / images.
  const links = Object.entries(rec.links ?? {});
  const broken = links.filter(([, v]) => !ok(v.status)).map(([url, v]) => ({ url, status: v.status, kind: v.kind, error: v.error?.slice(0, 80), fromCount: v.fromCount, from: v.from?.slice(0, 3) }));
  const redirects = links.filter(([, v]) => v.redirected && v.kind === 'link').map(([url, v]) => ({ url, finalUrl: v.finalUrl }));

  // axe.
  const axeImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const axeNodes = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const axeRules = {};
  for (const p of html) for (const v of p.axe ?? []) {
    axeImpact[v.impact] = (axeImpact[v.impact] ?? 0) + 1;
    axeNodes[v.impact] = (axeNodes[v.impact] ?? 0) + v.nodes;
    axeRules[v.id] ??= { impact: v.impact, pages: 0, nodes: 0, help: v.help, sample: v.sample, samplePath: p.path };
    axeRules[v.id].pages++;
    axeRules[v.id].nodes += v.nodes;
  }

  const consolePages = html.filter((p) => (p.consoleErrors ?? []).length).map((p) => ({ path: p.path, errors: p.consoleErrors.slice(0, 2) }));
  const consoleMsgs = {};
  for (const p of html) for (const m of p.consoleErrors ?? []) { const k = m.replace(/https?:\/\/\S+/g, '<url>').slice(0, 140); consoleMsgs[k] = (consoleMsgs[k] ?? 0) + 1; }
  const badSub = {};
  for (const p of html) for (const b of [...(p.badResponses ?? []), ...(p.failedRequests ?? [])]) { const k = `${b.status ?? b.error} ${b.type} ${String(b.url).replace(/\?.*$/, '').slice(0, 120)}`; badSub[k] = (badSub[k] ?? 0) + 1; }

  const wa = html.filter((p) => (p.whatsapp ?? []).length > 0).length;
  const waNumbers = [...new Set(html.flatMap((p) => (p.whatsapp ?? []).map((w) => w.number)))];
  const waTexts = [...new Set(html.flatMap((p) => (p.whatsapp ?? []).map((w) => w.text)))].slice(0, 6);
  const leadPages = html.filter((p) => (p.forms ?? []).some((f) => f.kind)).length;
  const newsletterPages = html.filter((p) => (p.forms ?? []).some((f) => !f.kind && f.hasEmail)).length;

  return {
    reachable: true,
    health: rec.health,
    sitemap: { status: rec.sitemap?.status, count: rec.sitemap?.count, hosts: rec.sitemap?.hosts },
    crawled: rec.pages.length,
    fromSitemapUnion: rec.pages.filter((p) => p.source === 'sitemap').length,
    discovered: rec.pages.filter((p) => p.source === 'discovered').length,
    discoveredNotCrawled: rec.discoveredNotCrawled?.length ?? 0,
    statuses,
    errored: errored.map((p) => ({ path: p.path, error: p.error })),
    indexable: indexable.length,
    issues,
    schema,
    broken,
    redirects,
    linksChecked: links.length,
    axe: { violationsByImpact: axeImpact, nodesByImpact: axeNodes, rules: Object.entries(axeRules).sort((a, b) => b[1].pages - a[1].pages).map(([id, v]) => ({ id, ...v })) },
    console: { pages: consolePages.length, top: Object.entries(consoleMsgs).sort((a, b) => b[1] - a[1]).slice(0, 6) },
    badSubresources: Object.entries(badSub).sort((a, b) => b[1] - a[1]).slice(0, 10),
    whatsapp: { pagesWithLink: wa, of: html.length, numbers: waNumbers, texts: waTexts, fabPages: html.filter((p) => p.fab).length },
    leadForms: { pagesWithLeadForm: leadPages, newsletterPages, of: html.length },
    wordsMedian: median(indexable.map((p) => p.words)),
    shots: rec.shots?.filter((s) => s.file).length ?? 0,
  };
}

function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function diff(live, local) {
  if (!live?.reachable || !local?.reachable) return null;
  const lp = new Set(live.sitemap?.paths ?? []);
  const cp = new Set(local.sitemap?.paths ?? []);
  const lm = new Map(live.pages.map((p) => [p.path, p]));
  const cm = new Map(local.pages.map((p) => [p.path, p]));
  const common = [...lm.keys()].filter((k) => cm.has(k));
  return {
    onlyLiveSitemap: [...lp].filter((p) => !cp.has(p)),
    onlyLocalSitemap: [...cp].filter((p) => !lp.has(p)),
    statusDiff: common.filter((k) => lm.get(k).status !== cm.get(k).status).map((k) => ({ path: k, live: lm.get(k).status, local: cm.get(k).status })),
    titleDiff: common.filter((k) => ok(lm.get(k).status) && ok(cm.get(k).status) && lm.get(k).title !== cm.get(k).title).map((k) => ({ path: k, live: lm.get(k).title, local: cm.get(k).title })),
    h1Diff: common.filter((k) => ok(lm.get(k).status) && ok(cm.get(k).status) && (lm.get(k).h1 ?? []).join(' | ') !== (cm.get(k).h1 ?? []).join(' | ')).map((k) => ({ path: k, live: lm.get(k).h1, local: cm.get(k).h1 })),
    descDiff: common.filter((k) => ok(lm.get(k).status) && ok(cm.get(k).status) && lm.get(k).description !== cm.get(k).description).length,
    wordDelta: common.filter((k) => ok(lm.get(k).status) && ok(cm.get(k).status) && Math.abs((lm.get(k).words ?? 0) - (cm.get(k).words ?? 0)) > 40).map((k) => ({ path: k, live: lm.get(k).words, local: cm.get(k).words })),
    compared: common.length,
  };
}

async function main() {
  const out = { generatedAt: new Date().toISOString(), brands: {} };
  const crossTitles = new Map();
  for (const brand of BRANDS) {
    const live = await load(join(OUT_DIR, 'raw', `${brand.key}-live.json`));
    const local = await load(join(OUT_DIR, 'raw', `${brand.key}-local.json`));
    out.brands[brand.key] = {
      domain: brand.domain,
      live: analyzeSide(brand, live),
      local: analyzeSide(brand, local),
      diff: diff(live, local),
    };
    for (const p of local?.pages ?? []) {
      if (!ok(p.status) || isNoindex(p) || !p.title) continue;
      if (!crossTitles.has(p.title)) crossTitles.set(p.title, new Set());
      crossTitles.get(p.title).add(`${brand.key}${p.path}`);
    }
  }
  out.crossBrandDuplicateTitles = [...crossTitles.entries()]
    .filter(([, s]) => new Set([...s].map((x) => x.split('/')[0])).size > 1)
    .map(([title, s]) => ({ title, pages: [...s] }));
  out.lighthouse = (await load(join(OUT_DIR, 'lighthouse', 'summary.json')))?.rows ?? null;
  out.conversion = (await load(join(OUT_DIR, 'raw', 'conversion.json')))?.results ?? null;
  if (WRITE_JSON) await writeFile(join(OUT_DIR, 'raw', 'summary.json'), JSON.stringify(out, null, 1));
  printMarkdown(out);
}

function printMarkdown(out) {
  const L = [];
  L.push('| Brand | Side | Pages crawled | Statuses | Title >60 | Title dup | Desc missing / >160 / <70 | H1 ≠1 | Canonical missing / wrong | noindex in sitemap | Thin <300w | Not in sitemap | Broken links / imgs / siblings | axe crit / serious / mod / minor (rule×page) | Console-error pages |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const [key, b] of Object.entries(out.brands)) {
    for (const side of ['live', 'local']) {
      const s = b[side];
      if (!s) continue;
      if (!s.reachable) { L.push(`| ${key} | ${side} | unreachable: ${String(s.reason).slice(0, 70)} |||||||||||||`); continue; }
      const i = s.issues;
      const br = (k) => s.broken.filter((x) => x.kind === k).length;
      L.push(`| ${key} | ${side} | ${s.crawled} (${s.discovered} discovered) | ${Object.entries(s.statuses).map(([k, v]) => `${k}×${v}`).join(' ')} | ${i.longTitle.length} | ${i.dupTitle.length} | ${i.missingDesc.length} / ${i.longDesc.length} / ${i.shortDesc.length} | ${i.h1Missing.length + i.h1Multiple.length} | ${i.canonicalMissing.length} / ${i.canonicalWrong.length} | ${i.noindexInSitemap.length} | ${i.thin.length} | ${i.notInSitemap.length} | ${br('link')} / ${br('img')} / ${br('sibling')} | ${s.axe.violationsByImpact.critical} / ${s.axe.violationsByImpact.serious} / ${s.axe.violationsByImpact.moderate} / ${s.axe.violationsByImpact.minor} | ${s.console.pages} |`);
    }
  }
  console.log(L.join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
