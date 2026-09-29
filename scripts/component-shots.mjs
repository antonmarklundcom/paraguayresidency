#!/usr/bin/env node
/**
 * Screenshots of the dev-only component showcase (/dev/components) for every
 * brand theme, full page, at desktop and phone width (overhaul plan §2, W4).
 *
 *   npm run dev -- -p 3200          (NEXT_PUBLIC_WHATSAPP_NUMBER set to any
 *                                    test number to see the WhatsApp buttons)
 *   node scripts/component-shots.mjs docs/audit/2026-10/w4-components
 *   node scripts/component-shots.mjs <dir> guide,residency 390
 *
 * BASE overrides the server (default http://localhost:3200). Writes
 * <brand>-<width>.jpg. A manual tool, not part of npm run verify.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'docs/audit/2026-10/w4-components';
const brands = (process.argv[3] ?? 'residency,investorpass,guide,frontier,residenciaes,residenciapt,flytta').split(',');
const widths = (process.argv[4] ?? '1440,390').split(',').map(Number);
const base = process.env.BASE ?? 'http://localhost:3200';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const brand of brands) {
      await page.goto(`${base}/dev/components?site=${brand}`, { waitUntil: 'networkidle', timeout: 180000 });
      await page.evaluate(() => document.fonts.ready);
      // Scroll once so every lazy image loads, then back to the top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
      const file = join(out, `${brand}-${width}.jpg`);
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 72 });
      console.log(file);
      // SECTIONS=1 also saves each section on its own, for a closer look.
      if (process.env.SECTIONS) {
        const sections = await page.locator('[data-theme] > section, [data-theme] > div > section').all();
        for (const [index, section] of sections.entries()) {
          await section.screenshot({ path: join(out, `${brand}-${width}-${String(index).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 72 });
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
