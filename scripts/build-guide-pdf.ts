/**
 * Builds the paid Guide PDF from the member-area chapters (the same MDX the
 * logged-in web version renders), so the PDF and the web edition never drift.
 *
 *   npm run guide:pdf            → private/the-paraguay-residency-guide.pdf
 *
 * The output is git-ignored on purpose (plan §13: the real guide PDF is never
 * committed). Upload it to the server's `private/` and set
 * `GUIDE_FILE_KEY=the-paraguay-residency-guide.pdf`, or host it elsewhere and
 * set `GUIDE_FILE_URL`. Needs Playwright's Chromium (PLAYWRIGHT_BROWSERS_PATH
 * or a local install); run it on a dev machine or in a Claude session.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { chromium } from 'playwright';
import { mdxToText } from '../src/lib/mdx-text';

const ROOT = process.cwd();
const OUT = join(ROOT, 'private', 'the-paraguay-residency-guide.pdf');

/** Reading order: the four entry-tier modules seeded in scripts/seed.ts. */
export const GUIDE_CHAPTERS = [
  'getting-started/why-paraguay-and-why-not',
  'getting-started/the-routes-compared',
  'getting-started/documents-by-nationality',
  'costs-and-timeline/real-costs',
  'costs-and-timeline/timeline-week-by-week',
  'after-approval/cedula-and-ruc',
  'after-approval/banking',
  'after-approval/taxes-for-residents',
  'after-approval/family',
  'next-steps/investor-pass-overview',
  'next-steps/mistakes-we-see-monthly',
  'next-steps/checklists',
];

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function toHtml(markdown: string): Promise<string> {
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(markdown);
  // Site-relative images resolve to the files in public/ for the print render.
  return String(file).replace(/src="\/(images\/[^"]+)"/g, (_, path: string) => `src="file://${join(ROOT, 'public', path)}"`);
}

async function main() {
  const chapters = [];
  for (const slug of GUIDE_CHAPTERS) {
    const { data, content } = matter(readFileSync(join(ROOT, 'content', 'guide', 'members', `${slug}.mdx`), 'utf8'));
    const body = mdxToText(content.replace(/<!--[\s\S]*?-->/g, ''), 'guide');
    chapters.push({ id: slug.split('/')[1], title: String(data.title), description: String(data.description ?? ''), html: await toHtml(body) });
  }
  const edition = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());
  const font = `file://${join(ROOT, 'public', 'fonts', 'fraunces-500.woff2')}`;
  const cover = existsSync(join(ROOT, 'public', 'images', 'guide', 'guide-cover.webp'))
    ? `<img class="cover-img" src="file://${join(ROOT, 'public', 'images', 'guide', 'guide-cover.webp')}" alt="">`
    : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Paraguay Residency Guide</title><style>
    @font-face { font-family: Display; src: url('${font}') format('woff2'); }
    @page { size: A4; margin: 22mm 20mm 24mm; }
    :root { --ink:#1d1a16; --muted:#5d554b; --accent:#b0451f; --rule:#e6ddd0; --tint:#faf5ee; }
    body { font: 10.5pt/1.62 Georgia, 'Times New Roman', serif; color: var(--ink); }
    h1, h2, h3, .display { font-family: Display, Georgia, serif; font-weight: 500; line-height: 1.15; }
    .cover { height: 245mm; display: flex; flex-direction: column; justify-content: flex-end; page-break-after: always; position: relative; }
    .cover-img { position: absolute; inset: 0; width: 100%; height: 170mm; object-fit: cover; border-radius: 6px; }
    .cover h1 { font-size: 38pt; margin: 0 0 6mm; }
    .cover p { font: 12pt/1.5 system-ui, sans-serif; color: var(--muted); margin: 0 0 2mm; }
    .cover .brand { color: var(--accent); letter-spacing: .14em; text-transform: uppercase; font-size: 9pt; }
    .toc { page-break-after: always; } .toc h2 { font-size: 22pt; }
    .toc ol { padding-left: 5mm; font: 11pt/2 system-ui, sans-serif; }
    .toc a { color: var(--ink); text-decoration: none; }
    section.chapter { page-break-before: always; }
    section.chapter > h1 { font-size: 26pt; margin: 0 0 3mm; }
    section.chapter > .lede { font: 11.5pt/1.5 system-ui, sans-serif; color: var(--muted); margin: 0 0 8mm; padding-bottom: 5mm; border-bottom: 2px solid var(--accent); }
    h2 { font-size: 15pt; margin: 8mm 0 2.5mm; page-break-after: avoid; } h3 { font-size: 12pt; margin: 6mm 0 2mm; page-break-after: avoid; }
    p, li { orphans: 3; widows: 3; } a { color: var(--accent); }
    table { width: 100%; border-collapse: collapse; margin: 4mm 0 6mm; font: 9pt/1.45 system-ui, sans-serif; page-break-inside: auto; }
    th { background: var(--tint); text-align: left; } th, td { border: 1px solid var(--rule); padding: 2mm 2.5mm; vertical-align: top; }
    tr { page-break-inside: avoid; }
    img { max-width: 100%; border-radius: 4px; margin: 3mm 0; }
    ul.contains-task-list { list-style: none; padding-left: 1mm; } .task-list-item input { margin-right: 2mm; }
    blockquote { margin: 4mm 0; padding: 2mm 5mm; border-left: 3px solid var(--accent); background: var(--tint); }
    .back { page-break-before: always; font: 11pt/1.6 system-ui, sans-serif; } .back h2 { font-size: 20pt; }
  </style></head><body>
    <div class="cover">${cover}
      <p class="brand">Paraguay Residency Guide</p>
      <h1>The Paraguay Residency Guide</h1>
      <p>Every step, document and cost, written down once and kept current.</p>
      <p>${escape(edition)} edition · paraguayresidencyguide.com</p>
    </div>
    <nav class="toc"><h2>Contents</h2><ol>${chapters.map((c) => `<li><a href="#${c.id}">${escape(c.title.replace(/^Chapter \d+:\s*/, ''))}</a></li>`).join('')}</ol>
      <p style="font:9pt/1.5 system-ui,sans-serif;color:var(--muted);margin-top:10mm">Figures in this guide come from the sources named on paraguayresidencyguide.com and were checked for this edition. Rules change: your member area always has the current edition. This guide is general information, not legal or tax advice.</p></nav>
    ${chapters.map((c) => `<section class="chapter" id="${c.id}"><h1>${escape(c.title)}</h1><p class="lede">${escape(c.description)}</p>${c.html}</section>`).join('\n')}
    <div class="back"><h2>Want it done for you?</h2><p>The team that wrote this guide files residency, cédula and tax cases in Asunción every week. Tell us your nationality and your goal; a named person replies in writing within one working day with your route and a fixed fee.</p><p><a href="https://paraguayresidency.co.uk/contact">paraguayresidency.co.uk/contact</a></p></div>
  </body></html>`;
  writeFileSync(OUT.replace(/\.pdf$/, '.html'), html);
  const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const page = await browser.newPage();
  await page.goto(`file://${OUT.replace(/\.pdf$/, '.html')}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;font:8px system-ui,sans-serif;color:#8a8175;padding:0 20mm;display:flex;justify-content:space-between"><span>The Paraguay Residency Guide</span><span class="pageNumber"></span></div>',
    margin: { top: '20mm', bottom: '22mm', left: '0', right: '0' },
  });
  await browser.close();
  console.log(`Wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
