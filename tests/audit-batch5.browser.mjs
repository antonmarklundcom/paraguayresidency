import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Run against a production server: AUDIT_PORT defaults to the local audit port.
const port = process.env.AUDIT_PORT || '3105';
const routes = {
  residency: ['/residency/temporary-residency', '/residency/permanent-residency', '/residency/cedula', '/residency/tax-residency', '/residency/family', '/pricing'],
  investorpass: ['/investor-pass/requirements', '/investor-pass/investment-routes', '/investor-pass/process'],
  residenciaes: ['/residencia/temporal', '/residencia/permanente', '/residencia/cedula', '/residencia-fiscal', '/precios'],
  residenciapt: ['/residencia/temporaria', '/residencia/permanente', '/residencia/cedula', '/residencia-fiscal', '/precos'],
  flytta: ['/uppehallstillstand', '/priser', '/kostnader'],
  frontier: ['/pricing'],
};
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const url = (brand, path) => 'http://' + (brand === 'residency' ? '' : brand + '.') + 'localhost:' + port + path;
try {
  for (const width of [390, 1440]) {
    const height = width === 390 ? 844 : 900;
    await page.setViewportSize({ width, height });
    await page.goto(url('investorpass', '/'));
    // Primary CTA plus the hero contact action (WhatsApp when configured, else "Message us").
    const heroActions = [
      ['See if you qualify', page.getByRole('link', { name: 'See if you qualify', exact: true }).first()],
      ['hero contact', page.locator('[data-hero-contact], [data-hero-contact] > a').last()],
    ];
    for (const [label, locator] of heroActions) {
      const box = await locator.boundingBox();
      assert(box && box.y >= 0 && box.y + box.height <= height, label + ' outside hero fold');
    }
    assert.equal(await page.locator('#inquiry').count(), 1);
    const cards = await page.locator('main .grid:has(> a:nth-child(4):last-child)').first().locator(':scope > a').all();
    assert.equal(cards.length, 4);
    const boxes = await Promise.all(cards.map(card => card.boundingBox()));
    assert(boxes.every(box => Math.abs(box.height - boxes[0].height) < 1));
    if (width >= 640) assert.equal(boxes[2].y, boxes[3].y);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  let count = 0;
  for (const [brand, paths] of Object.entries(routes)) for (const path of paths) {
    await page.goto(url(brand, path));
    const cta = page.locator('[data-service-cta]');
    const box = await cta.boundingBox();
    assert(box && box.y + box.height <= 1688, brand + path + ' early CTA missing');
    assert.equal(await cta.locator('a[href="#inquiry"]').count(), 1);
    assert.equal(await cta.locator('a[href="/route-finder"]').count(), 1);
    await page.locator('[data-sticky-cta]').waitFor({ state: 'visible' });
    const sticky = await page.locator('[data-sticky-cta] a').boundingBox();
    assert(sticky.height >= 44);
    await page.locator('#inquiry').scrollIntoViewIfNeeded();
    await page.locator('[data-sticky-cta]').waitFor({ state: 'detached' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-sticky-cta]').count(), 0);
    const last = await page.locator('footer a').last().boundingBox();
    assert(last && last.y + last.height <= 844, 'last footer link unreachable');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('[data-sticky-cta]').waitFor({ state: 'visible' });
    await page.setViewportSize({ width: 1440, height: 900 });
    assert.equal(await page.locator('[data-sticky-cta]').isVisible(), false);
    await page.setViewportSize({ width: 390, height: 844 });
    count++;
  }
  const titles = [], headings = [];
  for (const brand of ['residency', 'frontier', 'guide']) {
    await page.goto(url(brand, '/route-finder'));
    titles.push(await page.title());
    headings.push(await page.locator('h1').innerText());
  }
  assert.equal(new Set(titles).size, 3);
  assert.equal(new Set(headings).size, 3);
  for (const path of ['/routes', '/why-paraguay']) {
    await page.goto(url('frontier', path));
    const closing = page.locator('main section').last();
    assert.equal(await closing.getByRole('link', { name: 'Find your route', exact: true }).getAttribute('href'), '/route-finder');
    assert.equal(await closing.getByRole('link', { name: 'Talk to us', exact: true }).getAttribute('href'), '/contact');
  }
  console.log('PASS: unique route-finder titles/headings and Frontier closing actions.');
  console.log('PASS: hero folds, balanced Bento, and ' + count + ' pages: early CTA, form/footer hiding, return visibility and desktop hiding.');
} finally { await browser.close(); }
