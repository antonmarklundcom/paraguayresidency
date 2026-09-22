// Production regression: npm run build, npx next start -p 3010, then
// node tests/f016-not-found.mjs. Uses curl so no browser hydration can hide SSR failures.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const brands = [
  ['localhost', 'residency', 'en', '/guides/taxes/nope'],
  ['investorpass.localhost', 'investorpass', 'en', '/insights/nope'],
  ['guide.localhost', 'guide', 'en', '/blog/nope'],
  ['frontier.localhost', 'frontier', 'en', '/stories/nope'],
  ['residenciaes.localhost', 'residenciaes', 'es', '/guias/impuestos/nope'],
  ['residenciapt.localhost', 'residenciapt', 'pt-BR', '/guias/impostos/nope'],
  ['flytta.localhost', 'flytta', 'sv', '/guider/nope'],
];

let failures = 0;
console.log('Host | Path | Status | Lang | next-error | Nav');
for (const [host, site, lang, missing] of brands) {
  for (const path of ['/no-such-page-f016', missing]) {
    try {
      const response = execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', [
        '-sS', '--max-time', '30', '-w', '\n%{http_code}',
        '-H', `Host: ${host}:3010`, `http://127.0.0.1:3010${path}`,
      ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
      const split = response.lastIndexOf('\n');
      const html = response.slice(0, split);
      const status = response.slice(split + 1);
      const actualLang = html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1];
      const defaultError = html.includes('next-error-h1');
      const nav = html.includes(`data-site="${site}"`) && html.includes('<nav aria-label="Main">');
      console.log(`${host} | ${path} | ${status} | ${actualLang ?? '-'} | ${defaultError} | ${nav}`);
      assert.equal(status, '404');
      assert.equal(actualLang, lang);
      assert.equal(defaultError, false);
      assert.equal(nav, true);
      assert.equal(html.includes('id="__next_error__"'), false);
      assert.equal((html.match(/<html\b/g) ?? []).length, 1);
      assert.equal((html.match(/<nav aria-label="Main">/g) ?? []).length, 1);
      assert.match(html, /<main\b[^>]*id="main"[\s\S]*?<h1\b/);
      assert.match(html, /<meta name="robots" content="noindex"/);
    } catch (error) {
      failures++;
      console.error(`FAIL ${host}${path}: ${error.message}`);
    }
  }
}
assert.equal(failures, 0, `${failures} production 404 checks failed`);
