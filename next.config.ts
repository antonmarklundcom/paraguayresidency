import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Host-agnostic build (plan §1.7): no Vercel-only APIs, runs behind any Node
  // process via `next start` — both the Hostinger managed slot and the VPS
  // fallback run `npm run build && npm start` (plan §6.4, docs/runbook.md).
  // `output: 'standalone'` was tried in O1/O2 but Next 16 warns and does not
  // support it under `next start` ("next start does not work with output:
  // standalone — use node .next/standalone/server.js instead"); since neither
  // deploy path invokes server.js directly, standalone only added the
  // private/public/.next-static copying problem in KNOWN-ISSUES.md for no
  // benefit, so S6 dropped it (`src/lib/download-policy.ts`'s cwd fallback
  // logic still works unchanged, it just always resolves `<cwd>/private` now).
  // Next 16 otherwise rewrites CLAUDE.md on every dev start; this repo's
  // CLAUDE.md is hand-written project law (plan §4).
  agentRules: false,
  poweredByHeader: false,
};

export default nextConfig;
