#!/usr/bin/env node
/**
 * `npm run leads:retry` — one pass of the lead delivery queue (O24, item 1).
 *
 * Calls `POST /api/leads/deliveries` on the running app with
 * `LEAD_QUEUE_SECRET`, so it works from anywhere the secret is: Anton's
 * machine, an hPanel cron, CI. The queue itself runs inside the app, next to
 * the CRM key and the mail credentials, which never leave the server.
 *
 *   LEAD_QUEUE_SECRET=… npm run leads:retry
 *   LEAD_QUEUE_SECRET=… npm run leads:retry -- --include-skipped
 *   LEAD_QUEUE_SECRET=… npm run leads:retry -- --base http://127.0.0.1:3000
 *
 * `--base` defaults to `APP_ORIGIN_FALLBACK`, else the hub. Exit 1 on any error or when
 * the queue reports a backlog (something undelivered for over an hour), so a
 * cron wrapper that mails on failure mails when it matters.
 */
import { readFileSync, existsSync } from 'node:fs';

function envFromFile() {
  if (!existsSync('.env')) return {};
  const out = {};
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match) out[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
  }
  return out;
}

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

const fileEnv = envFromFile();
const secret = process.env.LEAD_QUEUE_SECRET || fileEnv.LEAD_QUEUE_SECRET || '';
const base = (value('--base') || process.env.APP_ORIGIN_FALLBACK || fileEnv.APP_ORIGIN_FALLBACK || 'https://paraguayresidency.co.uk').replace(/\/+$/, '');

if (secret.length < 24) {
  console.error('LEAD_QUEUE_SECRET is not set (24+ characters). Set it in the app env and here, then re-run.');
  process.exit(1);
}

const url = new URL('/api/leads/deliveries', base);
if (flag('--include-skipped')) url.searchParams.set('includeSkipped', '1');
if (value('--limit')) url.searchParams.set('limit', value('--limit'));

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(120_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`queue run failed: HTTP ${response.status}`, body);
    process.exit(1);
  }
  console.log(`${body.mode}: ${body.attempted} attempted${body.items?.length ? ` (${body.items.join(', ')})` : ''}`);
  const h = body.health ?? {};
  console.log(
    `health: last success ${h.lastSuccessAt ?? 'never'}, failed 24h ${h.failed24h ?? '?'}, gave up ${h.dead ?? '?'}, oldest undelivered ${h.oldestUndeliveredAt ?? 'none'}`,
  );
  if (h.backlog) {
    console.error('BACKLOG: a lead has been undelivered for over an hour.');
    process.exit(1);
  }
} catch (error) {
  console.error('queue run failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}
