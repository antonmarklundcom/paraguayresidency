import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Host-agnostic build (plan §1.7): no Vercel-only APIs, runs behind any Node
  // process. `standalone` keeps the Hostinger/VPS deploy in S6 simple.
  output: 'standalone',
  // Next 16 otherwise rewrites CLAUDE.md on every dev start; this repo's
  // CLAUDE.md is hand-written project law (plan §4).
  agentRules: false,
  poweredByHeader: false,
};

export default nextConfig;
