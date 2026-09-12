# Prompt: scan an existing live domain before cutover

Run this locally (in any repo/folder with Playwright installed) before pointing
`paraguayresidencyguide.com` (or any other domain in this project) at the new
app, to confirm whether there's an existing site worth preserving SEO/content
for.

## Setup

```bash
npm init -y
npm install -D playwright
npx playwright install chromium
```

Save as `scan-site.mjs`, then run:

```bash
node scan-site.mjs https://paraguayresidencyguide.com
```

## The script

```js
// scan-site.mjs
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const startUrl = process.argv[2];
if (!startUrl) {
  console.error('Usage: node scan-site.mjs <https://domain>');
  process.exit(1);
}
const origin = new URL(startUrl).origin;

const visited = new Set();
const queue = [startUrl];
const pages = [];

const browser = await chromium.launch();
const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (SEO-audit-bot)' });

// 1. Fetch sitemap.xml and robots.txt first, seed the queue from the sitemap
async function fetchText(url) {
  try {
    const res = await context.request.get(url);
    if (res.ok()) return await res.text();
  } catch {}
  return null;
}

const robots = await fetchText(`${origin}/robots.txt`);
const sitemapXml = await fetchText(`${origin}/sitemap.xml`);
if (sitemapXml) {
  const locs = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  queue.push(...locs);
}

let count = 0;
const MAX_PAGES = 200;

while (queue.length && count < MAX_PAGES) {
  const url = queue.shift();
  if (visited.has(url) || !url.startsWith(origin)) continue;
  visited.add(url);
  count++;

  const page = await context.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const status = resp?.status() ?? null;

    const data = await page.evaluate(() => {
      const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content
        || document.querySelector(`meta[property="${name}"]`)?.content || null;
      return {
        title: document.title,
        metaDescription: meta('description'),
        canonical: document.querySelector('link[rel="canonical"]')?.href || null,
        h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
        h2: [...document.querySelectorAll('h2')].map(h => h.textContent.trim()),
        ogTitle: meta('og:title'),
        ogDescription: meta('og:description'),
        ogImage: meta('og:image'),
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map(s => { try { return JSON.parse(s.textContent); } catch { return s.textContent; } }),
        wordCount: document.body.innerText.trim().split(/\s+/).length,
        links: [...document.querySelectorAll('a[href]')].map(a => a.href),
      };
    });

    pages.push({ url, status, ...data });

    for (const link of data.links) {
      try {
        const abs = new URL(link, url).href.split('#')[0];
        if (abs.startsWith(origin) && !visited.has(abs)) queue.push(abs);
      } catch {}
    }
  } catch (err) {
    pages.push({ url, error: String(err) });
  } finally {
    await page.close();
  }
}

await browser.close();

const report = {
  scannedAt: new Date().toISOString(),
  origin,
  robotsTxt: robots,
  hadSitemap: !!sitemapXml,
  pageCount: pages.length,
  pages,
};

writeFileSync('site-scan-report.json', JSON.stringify(report, null, 2));

console.log(`Scanned ${pages.length} pages under ${origin}`);
console.log(`Report written to site-scan-report.json`);
console.log(sitemapXml ? 'Sitemap found and seeded.' : 'No sitemap.xml found.');
```

## What to do with the output

- If `pageCount` is 0 or 1 (just a parking/coming-soon page) → confirms the plan's assumption: nothing to preserve, safe to launch the new app fresh.
- If it finds real content pages → send `site-scan-report.json` back so titles, meta descriptions, headings, and URL paths can be folded into the new app's content and a redirect map (like `docs/flytta-redirects.md`) can be built before DNS cutover.
- Keep `robots.txt` / sitemap URLs found — Search Console re-verification and 301s should point old indexed URLs at their new equivalents to keep existing rankings.
