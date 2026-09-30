#!/usr/bin/env node
/**
 * Seven-host smoke (O24 item 5). Curls every brand host and FAILS LOUDLY:
 * health, robots, sitemap, the home page's `<html lang>`, one page from the
 * sitemap, the www → apex redirect, the hub-only `/admin`, and (with
 * `--legacy`) the old-site 301 tables in `src/sites/redirects.ts`.
 *
 *   # live, after DNS points at the app
 *   node scripts/smoke-hosts.mjs
 *
 *   # a local `npm start`, every host sent as x-forwarded-host
 *   node scripts/smoke-hosts.mjs --base http://127.0.0.1:3000
 *
 *   # every URL in every sitemap must answer 200 (slow: hundreds of requests)
 *   node scripts/smoke-hosts.mjs --base http://127.0.0.1:3000 --all-sitemap-urls
 *
 * Options: `--only <siteKey>` to smoke one brand, `--timeout <ms>` (default
 * 15000). Exit code 1 and a list of every failure when anything is wrong.
 *
 * `HOSTS` duplicates the registry on purpose (this is plain Node, no TS
 * loader); `tests/host-cutover.test.ts` fails the build when the two drift.
 */

export const HOSTS = [
  { key: 'residency', host: 'paraguayresidency.co.uk', lang: 'en', hub: true },
  { key: 'investorpass', host: 'paraguayinvestorpass.com', lang: 'en' },
  { key: 'guide', host: 'paraguayresidencyguide.com', lang: 'en' },
  { key: 'frontier', host: 'paraguayfrontier.com', lang: 'en' },
  { key: 'residenciaes', host: 'residenciaenparaguay.es', lang: 'es' },
  { key: 'residenciapt', host: 'vidanoparaguai.com', lang: 'pt-BR' },
  { key: 'flytta', host: 'flyttatillparaguay.se', lang: 'sv' },
];

/** A few old-site paths per brand that must 301 (sampled from `src/sites/redirects.ts`). */
export const LEGACY_SAMPLES = {
  flytta: [
    ['/kontakt', '/contact'],
    ['/livet-i-paraguay/asuncion', '/stader/asuncion'],
  ],
};

function parseArgs(argv) {
  const args = { base: null, only: null, timeout: 15000, allSitemapUrls: false, legacy: true };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--base') args.base = argv[++i]?.replace(/\/+$/, '') ?? null;
    else if (arg === '--only') args.only = argv[++i] ?? null;
    else if (arg === '--timeout') args.timeout = Number(argv[++i]) || args.timeout;
    else if (arg === '--all-sitemap-urls') args.allSitemapUrls = true;
    else if (arg === '--no-legacy') args.legacy = false;
  }
  return args;
}

function makeClient({ base, timeout }) {
  /** One request as `host` would receive it; redirects are never followed. */
  return async function request(host, path, init = {}) {
    const url = base ? `${base}${path}` : `https://${host}${path}`;
    const headers = { 'user-agent': 'paraguayresidency-smoke/1', ...(init.headers ?? {}) };
    if (base) headers['x-forwarded-host'] = host;
    const response = await fetch(url, { ...init, headers, redirect: 'manual', signal: AbortSignal.timeout(timeout) });
    const text = init.method === 'HEAD' ? '' : await response.text();
    return { status: response.status, headers: response.headers, text };
  };
}

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function smokeHost(entry, request, args, fail) {
  const { key, host, lang } = entry;
  const origin = `https://${host}`;
  const check = async (label, fn) => {
    try {
      await fn();
    } catch (error) {
      fail(`${key} ${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  const expect = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  await check('/api/health', async () => {
    const res = await request(host, '/api/health');
    expect(res.status === 200, `status ${res.status}`);
    const body = JSON.parse(res.text);
    expect(body.site === key, `site is ${body.site}, expected ${key}`);
  });

  await check('/robots.txt', async () => {
    const res = await request(host, '/robots.txt');
    expect(res.status === 200, `status ${res.status}`);
    expect(res.text.includes(`Sitemap: ${origin}/sitemap.xml`), 'does not point at its own sitemap');
  });

  let locs = [];
  await check('/sitemap.xml', async () => {
    const res = await request(host, '/sitemap.xml');
    expect(res.status === 200, `status ${res.status}`);
    locs = sitemapLocs(res.text);
    expect(locs.length > 0, 'no <loc> entries');
    const foreign = locs.filter((loc) => !loc.startsWith(`${origin}/`) && loc !== origin);
    expect(foreign.length === 0, `lists another origin: ${foreign.slice(0, 3).join(', ')}`);
  });

  await check('/ lang', async () => {
    const res = await request(host, '/');
    expect(res.status === 200, `status ${res.status}`);
    const match = res.text.match(/<html[^>]*\slang="([^"]+)"/);
    expect(match?.[1] === lang, `lang is ${match?.[1] ?? 'missing'}, expected ${lang}`);
  });

  const pages = args.allSitemapUrls ? locs : locs.filter((loc) => loc !== origin && loc !== `${origin}/`).slice(0, 1);
  for (const loc of pages) {
    const path = loc.slice(origin.length) || '/';
    await check(`page ${path}`, async () => {
      const res = await request(host, path);
      expect(res.status === 200, `status ${res.status}`);
    });
  }

  await check('www → apex', async () => {
    const res = await request(`www.${host}`, '/contact?x=1');
    expect(res.status === 301 || res.status === 308, `status ${res.status}`);
    expect(res.headers.get('location') === `${origin}/contact?x=1`, `location ${res.headers.get('location')}`);
  });

  await check('/admin', async () => {
    const res = await request(host, '/admin/login');
    if (entry.hub) expect(res.status === 200, `hub /admin/login status ${res.status}`);
    else expect(res.status === 404, `non-hub /admin/login status ${res.status}, expected 404`);
  });

  if (args.legacy) {
    for (const [from, to] of LEGACY_SAMPLES[key] ?? []) {
      await check(`legacy ${from}`, async () => {
        const res = await request(host, from);
        expect(res.status === 301 || res.status === 308, `status ${res.status}`);
        const location = res.headers.get('location') ?? '';
        expect(location === to || location === `${origin}${to}`, `location ${location}, expected ${to}`);
      });
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const request = makeClient(args);
  const failures = [];
  const fail = (message) => failures.push(message);
  const hosts = HOSTS.filter((entry) => !args.only || entry.key === args.only);

  for (const entry of hosts) await smokeHost(entry, request, args, fail);

  // Only meaningful locally: a live unknown host never reaches the app.
  if (args.base && !args.only) {
    try {
      const res = await request('unknown-host.example', '/some/page');
      const hub = HOSTS.find((entry) => entry.hub);
      if (res.status !== 301 || res.headers.get('location') !== `https://${hub.host}/`) {
        fail(`unknown host: status ${res.status} location ${res.headers.get('location')}`);
      }
    } catch (error) {
      fail(`unknown host: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length) {
    console.error(`\nSMOKE FAILED — ${failures.length} problem(s):`);
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exit(1);
  }
  console.log(`smoke ok — ${hosts.length} host(s)${args.base ? ` via ${args.base}` : ''}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('SMOKE CRASHED', error);
    process.exit(1);
  });
}
