import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';
import { expect, it } from 'vitest';

// Exact additions in this dispatch may be untracked until the caller commits.
// Do not allow entire source directories: a stray file there must still fail.
const additions = new Set([
  'src/components/ProcessTimeline.tsx', 'tests/process-and-whatsapp.test.ts',
  'tests/pricing.test.ts',
  'tests/quiz-destinations.test.ts',
  'tests/s21-surfaces.test.ts',
  '.nvmrc', 'tests/repo-hygiene.test.ts', 'tests/fact-site.test.ts',
  'tests/metadata.test.ts', 'tests/whatsapp.test.ts',
  'tests/thank-you-token.test.ts', 'tests/subscriber-token.test.ts',
  '.github/dependabot.yml', 'docs/known-issues-archive.md',
  'src/app/(en)/sites/frontier/feed.xml/route.ts',
  'src/app/(en)/sites/frontier/stories/page.tsx',
  'src/app/(en)/sites/guide/feed.xml/route.ts',
  'src/app/(en)/sites/investorpass/feed.xml/route.ts',
  'src/app/(en)/sites/investorpass/insights/page.tsx',
  'src/app/(en)/sites/residency/feed.xml/route.ts',
  'src/app/(en)/sites/residency/guides/[hub]/page.tsx',
  'src/app/(en)/sites/residency/guides/page.tsx',
  'src/app/(es)/sites/residenciaes/feed.xml/route.ts',
  'src/app/(es)/sites/residenciaes/guias/[hub]/page.tsx',
  'src/app/(es)/sites/residenciaes/guias/page.tsx',
  'src/app/(pt)/sites/residenciapt/feed.xml/route.ts',
  'src/app/(pt)/sites/residenciapt/guias/[hub]/page.tsx',
  'src/app/(pt)/sites/residenciapt/guias/page.tsx',
  'src/app/(sv)/sites/flytta/feed.xml/route.ts',
  'src/app/(sv)/sites/flytta/guider/page.tsx',
  'src/app/(sv)/sites/flytta/stader/page.tsx',
  'src/lib/rss.ts', 'tests/collection-metadata.test.ts', 'tests/rss.test.ts',
]);
function allowed(path: string): boolean {
  return additions.has(path) || /^(?:\.next|node_modules|coverage)\//.test(path)
    || /^docs\/log\/[\w-]+\.md$/.test(path)
    || /^(?:\.DS_Store|Thumbs\.db|desktop\.ini)$/.test(basename(path))
    || /^\..+\.sw[op]$/.test(basename(path)) || /~$/.test(basename(path));
}
it('has no unexpected untracked files, including after a build', () => {
  const status = execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { encoding: 'utf8' });
  const records = status.split('\0');
  const unexpected: string[] = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record.startsWith('?? ') && !allowed(record.slice(3))) unexpected.push(record.slice(3));
    if (/^[RC]|^.[RC]/.test(record)) i++; // -z rename/copy records include a second path.
  }
  expect(unexpected).toEqual([]);
});
it('rejects stray source, root and build-backup files', () => {
  for (const path of ['scratch.txt', 'tests/forgotten.ts', 'src/debug.ts', '.next-backup/trace']) expect(allowed(path)).toBe(false);
  for (const path of ['.next/trace', 'node_modules/pkg/index.js', '.file.swp', '.DS_Store']) expect(allowed(path)).toBe(true);
});
