/**
 * The form-guard field names, in their own dependency-free module so client
 * components can name the inputs without importing `form-guard.ts` — which
 * signs timestamps with `node:crypto` and must stay on the server. Importing it
 * from a client component put `node:crypto` in the browser graph, which
 * Turbopack tolerated and webpack refuses (the Hostinger build, 2026-09-30).
 */
export const HONEYPOT_FIELD = 'website';
export const TIMESTAMP_FIELD = 'ts';
