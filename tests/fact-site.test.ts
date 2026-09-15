import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

// Balanced expressions handle arrow functions and > comparisons inside props.
// Quoted strings/comments cannot masquerade as an explicit site attribute.
function missingSite(source: string): number {
  let missing = 0;
  const starts = /<Fact(?=\s|\/?>)/g;
  for (const match of source.matchAll(starts)) {
    let depth = 0;
    let attributes = '';
    for (let i = match.index! + 5; i < source.length; i++) {
      const ch = source[i];
      if (source.slice(i, i + 2) === '/*') {
        const end = source.indexOf('*/', i + 2);
        i = end < 0 ? source.length : end + 1;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        const quote = ch;
        while (++i < source.length) {
          if (source[i] === '\\') i++;
          else if (source[i] === quote) break;
        }
      } else if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth === 0) break;
      else if (depth === 0) attributes += ch;
    }
    if (!/(?:^|\s)site\s*=/.test(attributes)) missing++;
  }
  return missing;
}
function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? pages(path) : entry.name === 'page.tsx' ? [path] : [];
  });
}
it('passes site explicitly to every Fact on non-English pages', () => {
  for (const locale of ['es', 'pt', 'sv']) {
    const files = pages(join(process.cwd(), 'src/app', `(${locale})`));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(missingSite(readFileSync(file, 'utf8')), file).toBe(0);
  }
});
it('handles multiline props, expressions and paired tags', () => {
  expect(missingSite('<Fact\n k="x"\n site = {site}\n/> <Fact k={x > 1 ? "a" : "b"} site="flytta"></Fact>')).toBe(0);
});
it('detects missing sites without accepting text, comments or spreads', () => {
  expect(missingSite('<Fact k="site=wrong" /> <Fact {...props} /> <Fact k={/* site="flytta" */ "x"} />')).toBe(3);
});
