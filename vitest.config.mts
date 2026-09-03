import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Node-environment tests only. Nothing here touches a database or the network:
 * `npm run verify` must pass on a clean checkout with no env (plan §4.5).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // `server-only` is a build-time guard for the Next.js bundler; in a plain
      // node test run it throws, so it resolves to a no-op here.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
