import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';
import { expect, it } from 'vitest';

// Exact additions in this dispatch may be untracked until the caller commits.
// Do not allow entire source directories: a stray file there must still fail.
const additions = new Set([
  '.nvmrc', 'tests/repo-hygiene.test.ts', 'tests/fact-site.test.ts',
  'tests/metadata.test.ts', 'tests/whatsapp.test.ts',
  'tests/thank-you-token.test.ts', 'tests/subscriber-token.test.ts',
]);
function allowed(path: string): boolean {
  return additions.has(path) || /^(?:\.next|node_modules|coverage)\//.test(path)
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
