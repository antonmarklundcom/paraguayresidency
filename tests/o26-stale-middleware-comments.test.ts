import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * O26 bug 5: comments pointed at `src/middleware.ts`, but Next 16 runs
 * `src/proxy.ts` (CLAUDE.md, "Host → site resolution lives in src/proxy.ts").
 * A reader following the old name found nothing.
 */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(ts|tsx|mts)$/.test(name) ? [path] : [];
  });
}

describe('no source file names src/middleware.ts', () => {
  it('src/ and next.config.ts point at src/proxy.ts', () => {
    const offenders = [...files('src'), 'next.config.ts'].filter((file) => /\bmiddleware\.ts\b/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
