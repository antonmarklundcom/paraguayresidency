import type { NextConfig } from 'next';

/**
 * Security headers (plan §14.2.4).
 *
 * They are set here rather than in `src/proxy.ts` on purpose: the
 * proxy matcher deliberately excludes `_next/static` and the image
 * extensions, and a `Content-Security-Policy` that does not cover the script
 * and font files a page loads is not a policy. `headers()` covers every
 * response Next serves.
 */

/** Plausible is the only third-party script the app loads (plan §6.4). */
const PLAUSIBLE = 'https://plausible.io';

/**
 * Where violations go (O20, clearing the KNOWN-ISSUES item O18 left open).
 *
 * `src/app/(en)/api/csp-report/route.ts` logs and answers 204. Both directives
 * are set because browsers disagree about which one they honour:
 * `report-uri` is deprecated but is what Safari and Firefox actually use, and
 * `report-to` is the Reporting API replacement Chrome prefers — it needs the
 * companion `Reporting-Endpoints` header below to name the group.
 *
 * The path is relative on purpose: seven brands share this build (plan §1.7),
 * so an absolute URL here would send six of them reports to the wrong origin.
 */
const CSP_REPORT_PATH = '/api/csp-report';
const CSP_REPORT_GROUP = 'csp-endpoint';
const REPORTING_ENDPOINTS = {
  key: 'Reporting-Endpoints',
  value: `${CSP_REPORT_GROUP}="${CSP_REPORT_PATH}"`,
};

const BASELINE = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Minimal: the app asks for none of these. Listing them empty is what stops
  // an embedded third party from asking on our behalf.
  {
    key: 'Permissions-Policy',
    value: 'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
];

/**
 * HSTS only in production. On `localhost` and on a `*.localhost` dev host a
 * browser that has seen this header refuses plain HTTP for the next two years,
 * which is a very effective way to break a dev machine.
 */
const HSTS = {
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
};

/**
 * The authenticated tree cannot be framed at all, and loads nothing from
 * anywhere but this origin. Enforcing (not report-only) — there is no
 * third-party script under `/admin` or `/members` to break.
 */
const PRIVATE_CSP = [
  "default-src 'self'",
  // Next's inline bootstrap and its hydration payload need these two; the
  // public policy below carries the same note.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join('; ');

/**
 * ENFORCING on the public tree since O24 (item 9, plan §14.2.4).
 *
 * It shipped report-only from O18 so the first real violation would arrive as
 * a report rather than as a broken page. The flip was gated on evidence, and
 * the evidence was gathered in a production build with the third parties
 * switched on (Plausible, WhatsApp, per-brand fonts, the hero video): every
 * sitemap URL of all seven brands loaded in Chromium by `tests/csp-crawl.mjs`
 * raised zero violations. Everything the pages load is same-origin except
 * Plausible, which is allowed below. Run that crawl again before adding any
 * third party (an embed, a chat widget, a map).
 *
 * `'unsafe-inline'`/`'unsafe-eval'` in `script-src` are Next's App Router
 * requirements, not a preference: the framework ships an inline bootstrap and
 * inline flight data on every page. Tightening them means a nonce, which means
 * every page becomes dynamic — exactly what O19 removed.
 *
 * It still reports: `report-uri`/`report-to` keep sending every violation to
 * `/api/csp-report`, so a block on a live page shows up in the log (and on
 * `/admin/readiness` as an error count) rather than only in a visitor's
 * console.
 */
const PUBLIC_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${PLAUSIBLE}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${PLAUSIBLE}`,
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `report-uri ${CSP_REPORT_PATH}`,
  `report-to ${CSP_REPORT_GROUP}`,
].join('; ');

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Host-agnostic build (plan §1.7): no Vercel-only APIs, runs behind any Node
  // process via `next start`. Both deploy paths (Hostinger managed slot, VPS
  // fallback) run `npm run build && npm start` (docs/runbook.md). No
  // `output: 'standalone'`: Next warns that `next start` does not support it,
  // nothing here runs `.next/standalone/server.js`, and it only moved the cwd
  // away from `private/` and `public/`.
  experimental: {
    globalNotFound: true,
    // `forbidden()` (403 + `admin/forbidden.tsx`) for a signed-in staff user
    // without the page's role — before O26 they were redirected to the login
    // page, which redirected them straight back.
    authInterrupts: true,
    // Next defaults build workers to os.cpus().length - 1, which on Hostinger's
    // shared box is the host's core count, not this account's share. Each worker
    // is a Node process, and every process AND thread counts against the
    // account-wide 200 "Max Processes" cap.
    cpus: 1,
  },
  // Nothing renders through next/image (pages use pre-sized files under
  // public/images), so the /_next/image optimizer is closed rather than left for
  // anyone to drive — it runs sharp threads against the same cap.
  images: { unoptimized: true },
  // Next 16 otherwise rewrites CLAUDE.md on every dev start; this repo's
  // CLAUDE.md is hand-written project law (plan §4).
  agentRules: false,
  poweredByHeader: false,
  // With `revalidate = 600` in the root layouts, HTML goes out as
  // `s-maxage=600, stale-while-revalidate=3000`: a CDN may serve a page at most an
  // hour old, never the year-old copy that outlived its CSS (seo-gap.md T2).
  expireTime: 3600,
  async headers() {
    return [
      {
        // Everything, including `_next/static` and `/api` — the headers that
        // are never wrong anywhere.
        source: '/:path*',
        headers: [...BASELINE, ...(isProduction ? [HSTS] : [])],
      },
      {
        // The public tree only: the negative lookahead keeps this policy off
        // `/admin` and `/members`, so those two carry exactly one CSP — the
        // stricter private one below.
        // These sources match the PUBLIC path, before `src/proxy.ts`
        // rewrites `/members` into `/sites/guide/members` — verified against
        // `next start`, not assumed.
        source: '/((?!admin$|admin/|members$|members/).*)',
        headers: [
          { key: 'Content-Security-Policy', value: PUBLIC_CSP },
          // Names the group `report-to` above points at. Without this header
          // `report-to` is inert in Chrome, which is most of the traffic.
          REPORTING_ENDPOINTS,
        ],
      },
      {
        source: '/:path(admin|members)/:rest*',
        headers: [{ key: 'Content-Security-Policy', value: PRIVATE_CSP }],
      },
      {
        source: '/:path(admin|members)',
        headers: [{ key: 'Content-Security-Policy', value: PRIVATE_CSP }],
      },
      {
        // Nothing under /api is cacheable and nothing under it is a document.
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export { PRIVATE_CSP, PUBLIC_CSP, BASELINE, HSTS, REPORTING_ENDPOINTS, CSP_REPORT_PATH };
export default nextConfig;
