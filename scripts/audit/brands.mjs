/**
 * Brand table for the audit scripts. Mirrors src/sites/registry.ts (SiteKey ->
 * canonical host, locale). Kept as plain data so the audit runs with plain
 * `node`, without tsx or the app's path aliases.
 *
 * `templates` names one representative path per template type, used for the
 * 1440/390 screenshots. `null` = the brand has no page of that type.
 */
export const BRANDS = [
  {
    key: 'residency',
    domain: 'paraguayresidency.co.uk',
    locale: 'en',
    templates: {
      home: '/',
      article: '/guides/documents/apostille-uk-documents-for-paraguay',
      contact: '/contact',
      pricing: '/pricing',
      'route-finder': '/route-finder',
      checklist: '/documents/checklist',
      about: '/about',
      legal: '/privacy',
    },
  },
  {
    key: 'investorpass',
    domain: 'paraguayinvestorpass.com',
    locale: 'en',
    templates: {
      home: '/',
      article: '/insights/what-the-investor-pass-is',
      contact: '/contact',
      pricing: null,
      'route-finder': '/route-finder',
      checklist: '/investor-pass/requirements',
      about: '/about',
      legal: '/privacy',
    },
  },
  {
    key: 'guide',
    domain: 'paraguayresidencyguide.com',
    locale: 'en',
    templates: {
      home: '/',
      article: '/blog/paraguay-residency-cost',
      contact: '/contact',
      pricing: '/insider',
      'route-finder': '/route-finder',
      checklist: null,
      about: '/about',
      legal: '/privacy',
    },
  },
  {
    key: 'frontier',
    domain: 'paraguayfrontier.com',
    locale: 'en',
    templates: {
      home: '/',
      article: '/stories/american-first-90-days',
      contact: '/contact',
      pricing: '/pricing',
      'route-finder': '/route-finder',
      checklist: '/documents/checklist',
      about: '/about',
      legal: '/privacy',
    },
  },
  {
    key: 'residenciaes',
    domain: 'residenciaenparaguay.es',
    locale: 'es',
    templates: {
      home: '/',
      article: '/guias/documentos/como-obtener-la-residencia-en-paraguay-paso-a-paso',
      contact: '/contact',
      pricing: '/precios',
      'route-finder': '/route-finder',
      checklist: '/documentos/lista',
      about: '/nosotros',
      legal: '/privacy',
    },
  },
  {
    key: 'residenciapt',
    domain: 'vidanoparaguai.com',
    locale: 'pt',
    templates: {
      home: '/',
      article: '/guias/documentos/rotas-de-residencia-temporaria-permanente-mercosul',
      contact: '/contact',
      pricing: '/precos',
      'route-finder': '/route-finder',
      checklist: '/documentos/lista',
      about: '/sobre',
      legal: '/privacy',
    },
  },
  {
    key: 'flytta',
    domain: 'flyttatillparaguay.se',
    locale: 'sv',
    templates: {
      home: '/',
      article: '/guider/residency-i-paraguay-komplett-guide',
      contact: '/contact',
      pricing: '/priser',
      'route-finder': '/route-finder',
      checklist: null,
      about: '/var-historia',
      legal: '/privacy',
    },
  },
];

export const BRAND_DOMAINS = new Set(BRANDS.flatMap((b) => [b.domain, `www.${b.domain}`]));

export const OUT_DIR = 'docs/audit/2026-10';

/** Local dev server. Chromium resolves `<key>.localhost` to loopback by itself. */
export const LOCAL_PORT = Number(process.env.AUDIT_LOCAL_PORT || 3100);

export function brandByKey(key) {
  const b = BRANDS.find((x) => x.key === key);
  if (!b) throw new Error(`unknown brand ${key}`);
  return b;
}

/**
 * Base URL a browser uses for a brand. Local uses the registry's
 * `<key>.localhost` hosts (the hub also answers on plain `localhost`), which
 * keeps the brand across navigation; the `?site=` override does not persist
 * (src/sites/resolve.ts reads it per request, no cookie).
 */
export function baseUrl(brand, mode) {
  return mode === 'live' ? `https://${brand.domain}` : `http://${brand.key}.localhost:${LOCAL_PORT}`;
}

/**
 * Node's resolver does not map `*.localhost`, so Node-side fetches go to
 * 127.0.0.1 with `x-forwarded-host`, which src/proxy.ts reads before `host`.
 */
export function nodeFetchTarget(url, brand, mode) {
  if (mode === 'live') return { url, headers: {} };
  const u = new URL(url);
  if (u.hostname.endsWith('.localhost') || u.hostname === 'localhost') {
    const host = u.host;
    u.hostname = '127.0.0.1';
    return { url: u.toString(), headers: { 'x-forwarded-host': host } };
  }
  return { url, headers: {} };
}

export async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async (_, w) => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i, w);
    }
  });
  await Promise.all(workers);
  return results;
}

export function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  if (process.argv.includes(`--${name}`)) return true;
  return fallback;
}

/** Last four digits only: the report never carries a full phone number. */
export function last4(digits) {
  const d = String(digits ?? '').replace(/\D/g, '');
  return d ? `…${d.slice(-4)}` : null;
}
