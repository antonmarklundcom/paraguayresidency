import type { NextConfig } from 'next';

/**
 * Security headers (plan §14.2.4).
 *
 * They are set here rather than in `src/middleware.ts` on purpose: the
 * middleware matcher deliberately excludes `_next/static` and the image
 * extensions, and a `Content-Security-Policy` that does not cover the script
 * and font files a page loads is not a policy. `headers()` covers every
 * response Next serves.
 */

/** Plausible is the only third-party script the app loads (plan §6.4). */
const PLAUSIBLE = 'https://plausible.io';

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
 * REPORT-ONLY for the public tree, on purpose (plan §14.2.4).
 *
 * S6 or S15 flips this to `Content-Security-Policy` after a week of clean
 * reports — the flip is this one constant name in the header key below, and
 * nothing else. It is report-only first because the public pages are the ones
 * that carry Plausible, per-brand fonts and MDX content, so the first real
 * violation should arrive as a report rather than as a blank page on a live
 * brand.
 *
 * `'unsafe-inline'`/`'unsafe-eval'` in `script-src` are Next's App Router
 * requirements, not a preference: the framework ships an inline bootstrap and
 * inline flight data on every page. Tightening them means a nonce, which means
 * every page becomes dynamic — exactly what O19 is removing. Revisit with O19's
 * rendering work, not before.
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
].join('; ');

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Host-agnostic build (plan §1.7): no Vercel-only APIs, runs behind any Node
  // process. `standalone` keeps the Hostinger/VPS deploy in S6 simple.
  output: 'standalone',
  // Next 16 otherwise rewrites CLAUDE.md on every dev start; this repo's
  // CLAUDE.md is hand-written project law (plan §4).
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Everything, including `_next/static` and `/api` — the headers that
        // are never wrong anywhere.
        source: '/:path*',
        headers: [...BASELINE, ...(isProduction ? [HSTS] : [])],
      },
      {
        // The public tree only: the negative lookahead keeps the report-only
        // policy off `/admin` and `/members`, so those two carry exactly one
        // CSP and a violation there is a real block rather than a report.
        // These sources match the PUBLIC path, before `src/middleware.ts`
        // rewrites `/members` into `/sites/guide/members` — verified against
        // `next start`, not assumed.
        source: '/((?!admin$|admin/|members$|members/).*)',
        headers: [{ key: 'Content-Security-Policy-Report-Only', value: PUBLIC_CSP }],
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

export { PRIVATE_CSP, PUBLIC_CSP, BASELINE, HSTS };
export default nextConfig;
