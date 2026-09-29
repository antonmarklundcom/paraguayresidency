import assert from 'node:assert/strict';
import { chromium } from 'playwright';

/**
 * Browser check for the phone action bar (overhaul plan §2, MobileWhatsAppBar
 * and the StickyCta merge). Manual, like the other *.browser.mjs audits:
 *
 *   NEXT_PUBLIC_WHATSAPP_NUMBER=<any test number> npm run build && npm start -- -p 3200
 *   AUDIT_BASE=http://localhost:3200 node tests/mobile-bar.browser.mjs
 *
 * Brands are picked with the dev `?site=` override when AUDIT_BASE is a dev
 * server, and with x-forwarded-host on a production server.
 */
const base = process.env.AUDIT_BASE || 'http://localhost:3200';
const hosts = { residency: 'paraguayresidency.co.uk', guide: 'paraguayresidencyguide.com', residenciapt: 'vidanoparaguai.com' };
const browser = await chromium.launch({ headless: true });
const state = (page) => page.locator('[data-mobile-bar]').getAttribute('data-state');
const visible = (page, selector) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0).catch(() => false);

async function open(brand, path, width = 390) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 844 : 900 },
    extraHTTPHeaders: process.env.AUDIT_DEV ? {} : { 'x-forwarded-host': hosts[brand] },
  });
  const page = await context.newPage();
  const url = new URL(path, base);
  if (process.env.AUDIT_DEV) url.searchParams.set('site', brand);
  await page.goto(url.href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  return { page, context };
}

try {
  // Service brand homepage: one WhatsApp bar, no floating button on phones.
  {
    const { page, context } = await open('residenciapt', '/');
    assert.equal(await page.locator('[data-mobile-bar]').count(), 1);
    assert.equal(await state(page), 'shown');
    assert.equal(await visible(page, '[data-wa-fab]'), false, 'floating WhatsApp hidden under the bar');
    const link = page.locator('[data-mobile-bar] a[data-placement="mobile-bar"]');
    assert.match(await link.getAttribute('href'), /^https:\/\/wa\.me\/\d+\?text=/);
    const box = await link.boundingBox();
    assert(box.height >= 44 && box.y + box.height <= 844);
    // Steps aside over a form, comes back after.
    await page.locator('main form').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    assert.equal(await state(page), 'hidden', 'hidden while a form is on screen');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    assert.equal(await state(page), 'shown');
    // The end of the footer is reachable above the bar.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const last = await page.locator('footer a').last().boundingBox();
    assert(last && last.y + last.height <= 844 - 68, 'last footer link clear of the bar');
    await context.close();
  }
  // Guide: the buy anchor leads, WhatsApp beside it; hidden at the offer.
  {
    const { page, context } = await open('guide', '/');
    const links = await page.locator('[data-mobile-bar] a').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
    assert.equal(links[0], '/#price');
    await page.locator('#price').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    assert.equal(await state(page), 'hidden', 'hidden while the offer is on screen');
    await context.close();
  }
  // A page with an inquiry form: StickyCta takes over, one bar only.
  {
    const { page, context } = await open('residency', '/pricing');
    await page.locator('[data-sticky-cta]').waitFor({ state: 'visible' });
    assert.equal(await visible(page, '[data-mobile-bar]'), false, 'shell bar hidden on a StickyCta page');
    assert.match(await page.locator('[data-sticky-cta] a[data-whatsapp]').getAttribute('href'), /^https:\/\/wa\.me\//);
    await context.close();
  }
  // Desktop: no bar.
  {
    const { page, context } = await open('residency', '/', 1440);
    assert.equal(await visible(page, '[data-mobile-bar]'), false);
    await context.close();
  }
  console.log('PASS: mobile bar on service brands, the guide, StickyCta pages and desktop.');
} finally {
  await browser.close();
}
