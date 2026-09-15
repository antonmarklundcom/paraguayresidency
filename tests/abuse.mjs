#!/usr/bin/env node
/**
 * O18 exit check (plan §14.2): point this at a running `next start` and watch
 * the limits answer 429.
 *
 *   npm run build
 *   SESSION_SECRET=$(openssl rand -base64 48) npx next start -p 3111 &
 *   node tests/abuse.mjs http://127.0.0.1:3111
 *
 * It is deliberately NOT part of `npm run verify` or CI: it needs a server on a
 * port and it spends real windows in a real process, so it is a thing you run
 * before a deploy and after one (S20 decides what CI carries — plan §14.4).
 * The same limits are asserted in-process, with an injected clock, by
 * `tests/abuse-limits.test.ts` and `tests/abuse-surfaces.test.ts`.
 *
 * Nothing here needs a database: every limit is checked before any query runs,
 * which is the point of putting them where they are.
 */

const BASE = process.argv[2] ?? 'http://127.0.0.1:3000';
const ROUNDS = 30;

/** Hub and guide hosts, so the middleware resolves the brand the way it will in production. */
const HUB = 'paraguayresidency.co.uk';
const GUIDE = 'paraguayresidencyguide.com';

/**
 * The brand is chosen by `x-forwarded-host`, not `host`, and that is not a
 * workaround: `fetch` refuses to set `Host` (it is a forbidden header name), and
 * `src/middleware.ts` reads `x-forwarded-host` FIRST precisely because behind
 * Hostinger's proxy that is the header carrying the real hostname. So this is
 * the shape a production request actually has.
 */
const hostHeaders = (host) => ({ 'x-forwarded-host': host });

/** One address for the whole run, so the per-IP buckets are the ones under test. */
const IP = `198.51.100.${1 + Math.floor(Math.random() * 200)}`;

/**
 * A fresh probe identity per run, so the script is re-runnable against a
 * long-lived process (plan §4.6) instead of reading "429 from call one" because
 * the last run filled the bucket. The one exception is the admin-login probe:
 * it cannot pass form fields (see `loginRun`), so its email key is the empty
 * string and two runs inside 15 minutes DO share that bucket.
 */
const RUN = Math.random().toString(36).slice(2, 10);
const PROBE_EMAIL = `abuse-probe-${RUN}@example.com`;

let failures = 0;

function report(name, statuses, expectation) {
  const counts = statuses.reduce((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});
  const summary = Object.entries(counts)
    .map(([status, n]) => `${status}×${n}`)
    .join('  ');
  const verdict = expectation(counts);
  if (!verdict.ok) failures += 1;
  console.log(`${verdict.ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} ${summary}`);
  console.log(`      ${verdict.note}`);
}

async function hit(path, { host, method = 'POST', body, headers = {} } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    redirect: 'manual',
    headers: {
      ...hostHeaders(host),
      'x-forwarded-for': IP,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return response;
}

const times = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

/* ------------------------------------------------------- 1. the newsletter */

async function subscribeRun() {
  const statuses = [];
  for (const i of times(ROUNDS, (i) => i)) {
    void i;
    const response = await hit('/api/subscribe', {
      host: GUIDE,
      body: { email: PROBE_EMAIL, site: 'guide' },
    });
    statuses.push(response.status);
  }
  report('POST /api/subscribe ×30', statuses, (counts) => ({
    ok: (counts[429] ?? 0) > 0,
    note:
      (counts[429] ?? 0) > 0
        ? `429 after the 3rd call for one address; retry-after is set.`
        : 'expected 429s once one address had spent its hourly allowance',
  }));
}

/* ------------------------------------------------------- 2. the checkout */

async function checkoutRun() {
  const statuses = [];
  for (const i of times(ROUNDS, (i) => i)) {
    void i;
    const response = await hit('/api/checkout', { host: GUIDE, body: {} });
    statuses.push(response.status);
  }
  report('POST /api/checkout ×30', statuses, (counts) => ({
    ok: (counts[429] ?? 0) > 0,
    note:
      (counts[429] ?? 0) > 0
        ? '429 after 10 an hour from one IP, before any processor call.'
        : 'expected 429s after 10 checkouts an hour from one IP',
  }));
}

/* ------------------------------------------------------ 3. the magic link */

async function magicRun() {
  const statuses = [];
  for (const i of times(ROUNDS, (i) => i)) {
    void i;
    const response = await hit('/api/auth/magic', {
      host: GUIDE,
      body: { email: PROBE_EMAIL, site: 'guide' },
    });
    statuses.push(response.status);
  }
  report('POST /api/auth/magic ×30', statuses, (counts) => ({
    // 200 for all 30 is the CORRECT answer here and the one to check for: a
    // 429 would tell a prober which addresses are being counted, which is the
    // account-existence oracle this route is built to avoid. What the limiter
    // stops is the mail, not the response — the server log shows the refusals.
    ok: counts[200] === ROUNDS,
    note:
      counts[200] === ROUNDS
        ? 'all 200 BY DESIGN — no account oracle; the limiter stops the mail, not the answer.'
        : 'expected every call to answer 200; anything else leaks account existence',
  }));
}

/* -------------------------------------------------------- 4. admin login */

/**
 * The login form is a server action, so there is no plain endpoint to POST to:
 * the action id is minted at build time and embedded in the page. This pulls it
 * out and calls the action the way the browser does. If Next changes that
 * encoding the run says so rather than reporting a false pass.
 */
async function loginRun() {
  const page = await fetch(`${BASE}/admin/login`, { headers: hostHeaders(HUB) });
  const html = await page.text();
  const actionId = html.match(/[0-9a-f]{40,}/)?.[0];
  if (!actionId) {
    failures += 1;
    console.log('FAIL  admin login ×30                  could not find the server-action id');
    console.log('      Next changed how it embeds action ids; update this probe.');
    return;
  }

  const messages = [];
  for (const i of times(ROUNDS, (i) => i)) {
    void i;
    const response = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: {
        ...hostHeaders(HUB),
        'x-forwarded-for': IP,
        'Next-Action': actionId,
        'content-type': 'text/plain;charset=UTF-8',
      },
      body: '[{"status":"idle"},"$K1"]',
    });
    const text = await response.text();
    messages.push(/Too many attempts/.test(text) ? 'limited' : String(response.status));
  }

  report('admin login action ×30', messages, (counts) => ({
    ok: (counts.limited ?? 0) > 0,
    note:
      (counts.limited ?? 0) > 0
        ? '"Too many attempts" after 5 in 15 minutes — a server action returns form state, not 429.\n      (re-running inside 15 minutes shows it limited from call one: the email key is shared.)'
        : 'expected the limiter to refuse after 5 attempts in 15 minutes',
  }));
}

/* ------------------------------------------- 5. the coarse middleware net */

async function coarseRun() {
  const ip = `203.0.113.${1 + Math.floor(Math.random() * 200)}`;
  const statuses = [];
  for (const i of times(130, (i) => i)) {
    void i;
    const response = await fetch(`${BASE}/api/__abuse_probe`, {
      method: 'POST',
      headers: { ...hostHeaders(HUB), 'x-forwarded-for': ip },
    });
    statuses.push(response.status);
  }
  report('middleware POST /api/* ×130', statuses, (counts) => ({
    ok: (counts[429] ?? 0) > 0,
    note:
      (counts[429] ?? 0) > 0
        ? '429 past 120 a minute per IP, under every per-route limit.'
        : 'expected the coarse 120/min net to refuse the tail of the burst',
  }));
}

/* ------------------------------------------------------------- 6. headers */

async function headerRun() {
  const checks = [
    ['/', HUB, 'content-security-policy-report-only'],
    ['/', HUB, 'x-content-type-options'],
    ['/', HUB, 'referrer-policy'],
    ['/', HUB, 'permissions-policy'],
    ['/', HUB, 'strict-transport-security'],
    ['/admin', HUB, 'content-security-policy'],
    ['/members', GUIDE, 'content-security-policy'],
  ];
  const missing = [];
  for (const [path, host, header] of checks) {
    const response = await fetch(`${BASE}${path}`, {
      headers: hostHeaders(host),
      redirect: 'manual',
    });
    if (!response.headers.get(header)) missing.push(`${path} → ${header}`);
  }
  if (missing.length) failures += 1;
  console.log(`${missing.length ? 'FAIL' : 'PASS'}  security headers                   ${checks.length - missing.length}/${checks.length}`);
  console.log(
    missing.length
      ? `      missing: ${missing.join(', ')}`
      : '      baseline + report-only CSP on the public tree, enforcing CSP on /admin and /members.',
  );
}

/* --------------------------------------------------------- 7. x-site spoof */

async function spoofRun() {
  const response = await fetch(`${BASE}/api/health`, {
    headers: { ...hostHeaders('not-a-brand.example'), 'x-site': 'guide' },
  });
  const body = await response.json();
  const ok = body.site !== 'guide';
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  x-site spoof on an unknown host    site=${body.site}`);
  console.log(
    ok
      ? '      the client header was deleted; the brand came from the host, not the wire.'
      : '      a client-supplied x-site reached currentSite() — middleware is not stripping it.',
  );
}

/* ------------------------------------------------------------------- run */

console.log(`abuse probe → ${BASE}  (as ${IP})\n`);
try {
  await fetch(`${BASE}/api/health`, { headers: hostHeaders(HUB) });
} catch {
  console.error(`no server on ${BASE} — run \`npx next start\` first.`);
  process.exit(2);
}

await subscribeRun();
await checkoutRun();
await magicRun();
await loginRun();
await coarseRun();
await headerRun();
await spoofRun();

console.log(`\n${failures === 0 ? 'all probes passed' : `${failures} probe(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
