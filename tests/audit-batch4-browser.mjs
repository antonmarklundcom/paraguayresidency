import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Run against a production server: node tests/audit-batch4-browser.mjs [port]
const port = process.argv[2] ?? '3000';
const brands = [
  ['residency', '/guides'], ['investorpass', '/insights'], ['frontier', '/stories'],
  ['guide', '/blog'], ['residenciaes', '/guias'], ['residenciapt', '/guias'], ['flytta', '/stader'],
];
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [brand, hub] of brands) {
    await page.goto(`http://${brand}.localhost:${port}${hub}`);
    assert.equal(await page.locator('header').count(), 1, brand);
    const header = await page.locator('header').boundingBox();
    assert.ok(header.height <= 80, `${brand}: closed header ${header.height}px`);
    const summary = page.locator('header summary');
    const box = await summary.boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44, `${brand}: summary target`);
    // Reach the disclosure using only Tab, then open and close with native keys.
    for (let i = 0; i < 12 && !await summary.evaluate(el => el === document.activeElement); i++) await page.keyboard.press('Tab');
    assert.ok(await summary.evaluate(el => el === document.activeElement), `${brand}: keyboard reachability`);
    await page.keyboard.press('Enter');
    assert.ok(await page.locator('header details').evaluate(el => el.open), `${brand}: Enter opens`);
    const mobileLinks = await page.locator('header details a').all();
    const desktopHrefs = await page.locator('header nav > ul a').evaluateAll(links => links.map(a => a.getAttribute('href')));
    assert.deepEqual(await page.locator('header details a').evaluateAll(links => links.map(a => a.getAttribute('href'))), desktopHrefs);
    for (const link of mobileLinks) assert.ok(await link.isVisible(), `${brand}: open menu link visible`);
    const ax = await context.newCDPSession(page);
    const expanded = (await ax.send('Accessibility.getFullAXTree')).nodes.find(n => n.role?.value === 'DisclosureTriangle');
    assert.equal(expanded?.properties?.find(p => p.name === 'expanded')?.value.value, true, `${brand}: accessible expanded state`);
    await page.keyboard.press('Tab');
    assert.ok(await mobileLinks[0].evaluate(el => el === document.activeElement), `${brand}: Tab enters links`);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Space');
    assert.equal(await page.locator('header details').evaluate(el => el.open), false);
    const collapsed = (await ax.send('Accessibility.getFullAXTree')).nodes.find(n => n.role?.value === 'DisclosureTriangle');
    assert.equal(collapsed?.properties?.find(p => p.name === 'expanded')?.value.value, false, `${brand}: accessible collapsed state`);
    await page.keyboard.press('Enter');
    for (const link of await page.locator('header a, footer a, nav[aria-label="Breadcrumb"] a').all()) {
      if (await link.isVisible()) assert.ok((await link.boundingBox()).height >= 44, `${brand}: short target ${await link.textContent()}`);
    }
    const rects = await page.locator('header details a').evaluateAll(links => links.map(a => { const r = a.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }));
    for (let i = 1; i < rects.length; i++) assert.ok(rects[i].top >= rects[i - 1].bottom, `${brand}: stacked targets`);
    for (const width of [768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await summary.isVisible(), false, `${brand}: desktop disclosure hidden`);
      assert.equal(await page.locator('header nav > ul').isVisible(), true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://${brand}.localhost:${port}/`);
    assert.ok((await page.locator('header').boundingBox()).height <= 80, `${brand}: homepage header`);
    const siblings = page.locator('main a[href^="https://paraguay"], footer a[href^="https://paraguay"]');
    for (const link of await siblings.all()) {
      assert.equal(await link.getAttribute('target'), null);
      assert.equal(await link.getAttribute('rel'), null);
    }
    console.log(`PASS ${brand}: header ${header.height}px; targets, keyboard, accessible state, desktop nav, sibling links`);
  }
} finally {
  await browser.close();
}
