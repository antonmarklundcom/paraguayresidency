import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * O26 bug 6 (site audit 2026-10, issue 6): the checklist crashed because a
 * `'use client'` component rendered the server-only `LeadForm` (node:crypto,
 * base64url). #97 moved the form into a slot the server page fills. This keeps
 * it that way; `tests/o26-checklist.browser.mjs` is the real-browser proof.
 */
describe('DocumentChecklist stays a pure client component', () => {
  const source = readFileSync('src/components/DocumentChecklist.tsx', 'utf8');

  it('is a client component that imports nothing server-only', () => {
    expect(source.startsWith("'use client'")).toBe(true);
    expect(source).not.toMatch(/from ['"](\.\/LeadForm|@\/components\/LeadForm|@\/components['"]|node:|@\/lib\/form-guard)/);
    expect(source).not.toMatch(/<LeadForm\b/);
  });

  it('receives the lead form as a slot from every page that uses it', () => {
    for (const page of [
      'src/app/(en)/sites/residency/documents/checklist/page.tsx',
      'src/app/(en)/sites/frontier/documents/checklist/page.tsx',
      'src/app/(es)/sites/residenciaes/documentos/lista/page.tsx',
      'src/app/(pt)/sites/residenciapt/documentos/lista/page.tsx',
    ]) {
      const src = readFileSync(page, 'utf8');
      expect(src.startsWith("'use client'"), page).toBe(false);
      expect(src, page).toMatch(/<DocumentChecklist[\s\S]*form=\{\s*<LeadForm/);
    }
  });
});
