#!/usr/bin/env node
/**
 * Conversion plumbing, checked by hand-written Playwright flows, local AND live.
 *
 *   node scripts/audit/conversion.mjs                       # all brands, both sides
 *   node scripts/audit/conversion.mjs --brands=guide --modes=live
 *
 * Per brand and side:
 *  - WhatsApp: is the floating button visible at 1440 and 390, which number
 *    (last 4 digits only), and is the pre-typed text the brand's language?
 *  - Lead form (/contact): LOCAL is submitted once with obviously fake data
 *    ("Audit Test", audit-test@example.com). LIVE IS NEVER SUBMITTED: every
 *    non-GET request to the brand's own origin is aborted in the browser before
 *    it leaves, so the live check only shows that the form renders, whether the
 *    client validates before posting, and which endpoint the post would hit.
 *  - Guide buy button: the text it shows; on live it is clicked only when it is
 *    a real button, only /api/checkout is let through, and nothing is typed.
 *  - Route Finder: answered to the end (first option each step); does the
 *    result offer a next step (WhatsApp / form / book)?
 *  - Plausible (live): pageview and whatsapp_click requests, intercepted and
 *    answered locally (202) so the audit neither reaches Plausible's stats nor
 *    opens WhatsApp (wa.me is aborted).
 *
 * Writes docs/audit/2026-10/raw/conversion.json and a few shots under shots/.
 */
import { chromium } from 'playwright';
import { lookup } from 'node:dns/promises';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { BRANDS, OUT_DIR, arg, baseUrl, last4 } from './brands.mjs';

const keys = String(arg('brands', BRANDS.map((b) => b.key).join(','))).split(',');
const modes = String(arg('modes', 'local,live')).split(',');
const FAKE = { name: 'Audit Test', email: 'audit-test@example.com', phone: '+1 202 555 0100', message: 'Automated audit test from the 2026-10 site audit. Please ignore.' };

const prefill = {};
for (const loc of ['en', 'es', 'pt', 'sv']) {
  const m = JSON.parse(await readFile(`src/i18n/messages/${loc}/common.json`, 'utf8'));
  prefill[loc] = { prefill: m['whatsapp.prefill'], afterForm: m['whatsapp.afterForm'] };
}

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';

async function newContext(browser, width, mode) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    isMobile: width === 390,
    hasTouch: width === 390,
    userAgent: width === 390 ? MOBILE_UA : undefined,
  });
  // Plausible's script ignores automated browsers; unset the flag so the
  // wiring can be observed. Every event it sends is answered locally below.
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  const log = { plausible: [], aborted: [], checkout: [] };
  await ctx.route(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//, (r) => { log.aborted.push({ url: maskUrl(r.request().url()), why: 'whatsapp' }); return r.abort(); });
  await ctx.route('https://plausible.io/api/event', async (r) => {
    let body = null;
    try { body = JSON.parse(r.request().postData() || 'null'); } catch { /* ignore */ }
    log.plausible.push({ name: body?.n ?? body?.name ?? null, props: body?.p ?? body?.props ?? null, url: body?.u ?? null });
    return r.fulfill({ status: 202, body: 'ok' });
  });
  if (mode === 'live') {
    // The safety net: nothing but GETs reaches production, except
    // /api/checkout, which the guide check allows explicitly per click.
    await ctx.route('**/*', (r) => {
      const req = r.request();
      const url = new URL(req.url());
      const own = BRANDS.some((b) => url.hostname === b.domain || url.hostname === `www.${b.domain}`);
      if (own && req.method() !== 'GET' && req.method() !== 'HEAD') {
        if (url.pathname === '/api/checkout' && log.allowCheckout) {
          log.checkout.push({ method: req.method(), url: req.url() });
          return r.continue();
        }
        log.aborted.push({ method: req.method(), url: req.url(), nextAction: !!req.headers()['next-action'], contentType: req.headers()['content-type'] ?? null, why: 'live write blocked' });
        return r.abort();
      }
      return r.fallback();
    });
  }
  return { ctx, log };
}

/** A context whose page sits on a Chromium error page can hang on close (Windows). */
async function closeQuietly(ctx) {
  for (const p of ctx.pages()) await p.goto('about:blank', { timeout: 5000 }).catch(() => {});
  await Promise.race([ctx.close().catch(() => {}), new Promise((r) => setTimeout(r, 10000))]);
}

function maskUrl(u) {
  return String(u).replace(/(wa\.me\/)(\d+)/, (_, a, d) => a + last4(d)).replace(/([?&]phone=)(\d+)/, (_, a, d) => a + last4(d));
}

function language(text, locale) {
  if (!text) return null;
  if (text === prefill[locale].prefill) return `${locale} (exact brand prefill)`;
  for (const [loc, v] of Object.entries(prefill)) if (text === v.prefill) return `${loc} (prefill of another locale!)`;
  return 'custom text (check)';
}

async function whatsappCheck(browser, brand, mode) {
  const out = {};
  for (const width of [1440, 390]) {
    const { ctx, log } = await newContext(browser, width, mode);
    const page = await ctx.newPage();
    try {
      await page.goto(baseUrl(brand, mode) + '/', { waitUntil: 'load', timeout: 180000 });
      await page.waitForTimeout(2500);
      const fab = page.locator('[data-wa-fab]');
      const fabCount = await fab.count();
      const fabVisible = fabCount ? await fab.first().isVisible() : false;
      const box = fabCount ? await fab.first().boundingBox() : null;
      const links = await page.$$eval('a[href*="wa.me/"], a[href*="api.whatsapp.com"]', (as) => as.map((a) => ({ href: a.href, placement: a.getAttribute('data-placement'), visible: !!(a.offsetWidth || a.offsetHeight) })));
      const parsed = links.map((l) => {
        const u = new URL(l.href);
        const num = u.hostname === 'wa.me' ? u.pathname.slice(1) : u.searchParams.get('phone');
        const text = u.searchParams.get('text');
        return { number: last4(num), text, language: language(text, brand.locale), placement: l.placement, visible: l.visible };
      });
      const sticky = await page.locator('[data-sticky-cta]').count();
      const pageviews = log.plausible.filter((e) => e.name === 'pageview').length;
      const scriptLoaded = await page.evaluate(() => typeof window.plausible === 'function' || !!document.querySelector('script[src*="plausible.io"]'));
      let clickEvent = null;
      if (mode === 'live' && fabVisible) {
        await fab.first().click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);
        clickEvent = log.plausible.filter((e) => e.name === 'whatsapp_click');
      }
      out[width] = {
        fab: { present: fabCount > 0, visible: fabVisible, inViewport: box ? box.y >= 0 && box.y + box.height <= (width === 390 ? 844 : 900) : false, box },
        links: parsed,
        numbers: [...new Set(parsed.map((p) => p.number))],
        stickyCta: sticky,
        plausible: { script: scriptLoaded, pageviewEvents: pageviews, whatsappClickEvents: clickEvent, allEvents: log.plausible },
        abortedWhatsappNavigations: log.aborted.filter((a) => a.why === 'whatsapp').length,
      };
    } catch (e) {
      out[width] = { error: String(e.message).slice(0, 300) };
    } finally {
      await closeQuietly(ctx);
    }
  }
  return out;
}

/**
 * The lead form renders a server version first and swaps in the client
 * (enhanced) version once it scrolls into view, which detaches the old nodes.
 * Scroll it into view and wait for the swap before touching any field.
 */
async function mountEnhanced(page) {
  await page.evaluate(() => document.querySelector('form:has(input[name="kind"])')?.scrollIntoView({ block: 'center' }));
  const ok = await page.locator('[data-enhanced] form:has(input[name="kind"])').first().waitFor({ state: 'attached', timeout: 20000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(500);
  return ok;
}

async function leadFormCheck(browser, brand, mode) {
  const { ctx, log } = await newContext(browser, 1440, mode);
  const page = await ctx.newPage();
  const res = { path: '/contact' };
  try {
    const r = await page.goto(baseUrl(brand, mode) + '/contact', { waitUntil: 'load', timeout: 180000 });
    res.status = r?.status();
    res.renders = (await page.locator('form:has(input[name="kind"])').count()) > 0;
    if (!res.renders) return res;
    res.enhanced = await mountEnhanced(page);
    const form = page.locator('form:has(input[name="kind"])').first();
    res.kind = await form.locator('input[name="kind"]').inputValue();
    res.fields = await form.locator('input:not([type=hidden]), select, textarea').evaluateAll((els) => els.filter((e) => e.name !== 'website').map((e) => `${e.name}${e.required ? '*' : ''}`));
    res.noValidate = await form.evaluate((f) => f.noValidate);
    res.actionAttr = await form.evaluate((f) => (f.getAttribute('action') || '').slice(0, 60));

    // Client-side validation probe: an invalid email and nothing else, with
    // every write aborted in the browser (live always; local via a one-off route).
    let probeAborted = [];
    if (mode === 'local') {
      await page.route('**/*', (rt) => {
        if (rt.request().method() === 'POST') { probeAborted.push({ url: rt.request().url(), nextAction: !!rt.request().headers()['next-action'] }); return rt.abort(); }
        return rt.fallback();
      });
    }
    const before = log.aborted.length;
    await form.locator('input[name="email"]').fill('not-an-email');
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
    const livePosts = log.aborted.slice(before).filter((a) => a.why === 'live write blocked');
    const posts = mode === 'live' ? livePosts : probeAborted;
    res.clientValidation = {
      postAttemptedWithInvalidEmail: posts.length > 0,
      endpoint: posts[0] ? { url: posts[0].url.replace(/\?.*$/, ''), serverAction: posts[0].nextAction, contentType: posts[0].contentType ?? null } : null,
      invalidFields: await page.$$eval('form :invalid', (els) => els.map((e) => e.name).filter(Boolean)).catch(() => []),
      visibleError: (await page.locator('form [role="alert"], form .text-\\[var\\(--danger\\)\\]').allInnerTexts().catch(() => [])).slice(0, 3),
    };
    if (mode === 'local') await page.unroute('**/*');

    if (mode === 'live') {
      res.submission = "not tested — needs Anton's OK (a live submission creates a real lead)";
    } else {
      // Fresh load so the probe above leaves no state behind.
      await page.goto(baseUrl(brand, mode) + '/contact', { waitUntil: 'load', timeout: 180000 });
      await mountEnhanced(page);
      const f = page.locator('form:has(input[name="kind"])').first();
      await f.locator('input[name="name"]').fill(FAKE.name);
      await f.locator('input[name="email"]').fill(FAKE.email);
      if (await f.locator('input[name="phone"]').count()) await f.locator('input[name="phone"]').fill(FAKE.phone);
      if (await f.locator('[name="message"]').count()) await f.locator('[name="message"]').fill(FAKE.message);
      await page.waitForTimeout(3000); // the anti-bot guard wants >= 2.5 s between render and submit
      const post = page.waitForResponse((r) => r.request().method() === 'POST', { timeout: 60000 }).catch(() => null);
      await f.locator('button[type="submit"]').click();
      const postRes = await post;
      await page.locator('[role="status"], form [role="alert"]').first().waitFor({ timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1000);
      const status = await page.locator('[role="status"]').allInnerTexts().catch(() => []);
      const alert = await page.locator('form [role="alert"]').allInnerTexts().catch(() => []);
      res.submission = {
        httpStatus: postRes?.status() ?? null,
        success: status.length > 0 || /[?&]lead=ok/.test(page.url()),
        statusText: status.join(' | ').replace(/\s+/g, ' ').slice(0, 300),
        errorText: alert.join(' | ').slice(0, 300),
        url: page.url().replace(/^https?:\/\/[^/]+/, ''),
        continueOnWhatsapp: await page.locator('[role="status"] a[href*="wa.me"], [data-enhanced] a[href*="wa.me"]').count(),
      };
      await page.screenshot({ path: join(OUT_DIR, 'shots', `${brand.key}-lead-success-${mode}-1440.jpg`), type: 'jpeg', quality: 70 });
    }
  } catch (e) {
    res.error = String(e.message).slice(0, 300);
  } finally {
    await closeQuietly(ctx);
  }
  return res;
}

async function guideBuyCheck(browser, brand, mode) {
  const out = {};
  for (const path of ['/', '/insider']) {
    const { ctx, log } = await newContext(browser, 1440, mode);
    const page = await ctx.newPage();
    const r = { path };
    try {
      await page.goto(baseUrl(brand, mode) + path, { waitUntil: 'load', timeout: 180000 });
      await page.waitForTimeout(1500);
      // The checkout control: a <button> when enabled, a <span> saying "…opens shortly" when not.
      r.controls = await page.$$eval('main button, main span', (els) => els
        .map((e) => ({ tag: e.tagName.toLowerCase(), text: (e.innerText || '').replace(/\s+/g, ' ').trim(), disabled: e.disabled ?? null }))
        .filter((e) => /buy the guide|checkout|opens shortly|insider|join|subscribe|comprar/i.test(e.text) && e.text.length < 80));
      r.priceText = (await page.locator('#price').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
      const buy = page.locator('main button', { hasText: /buy the guide|join insider|start|get the guide/i }).first();
      r.hasBuyButton = (await buy.count()) > 0;
      if (r.hasBuyButton) {
        log.allowCheckout = true;
        const resp = page.waitForResponse((x) => x.url().includes('/api/checkout'), { timeout: 30000 }).catch(() => null);
        await buy.click();
        const cr = await resp;
        r.checkoutResponse = cr ? { status: cr.status(), body: (await cr.text().catch(() => '')).slice(0, 200) } : null;
        await page.waitForTimeout(4000);
        r.afterClickUrlHost = new URL(page.url()).host;
        r.emailFieldShown = (await page.locator('main input[type="email"]').count()) > 0;
        // Stop here: never type an email or card data.
      }
    } catch (e) {
      r.error = String(e.message).slice(0, 300);
    } finally {
      await closeQuietly(ctx);
    }
    out[path] = r;
  }
  return out;
}

async function routeFinderCheck(browser, brand, mode) {
  const { ctx } = await newContext(browser, 390, mode);
  const page = await ctx.newPage();
  const r = { steps: 0 };
  try {
    await page.goto(baseUrl(brand, mode) + '/route-finder', { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(1500);
    r.questions = [];
    for (let i = 0; i < 12; i++) {
      if (page.url().includes('/route-finder/result')) break;
      const legend = page.locator('fieldset legend').first();
      if (!(await legend.count())) break;
      const q = await legend.innerText();
      r.questions.push(q.slice(0, 80));
      await page.locator('fieldset label').first().click();
      // Back / Next live in the div right after the question's fieldset.
      await page.locator('fieldset ~ div button:not([disabled])').last().click();
      r.steps++;
      // Wait for the next question, or for the push to the result page.
      await page.waitForFunction((prev) => location.pathname.includes('/route-finder/result')
        || (document.querySelector('fieldset legend')?.textContent ?? '') !== prev, q, { timeout: 90000 }).catch(() => {});
    }
    await page.waitForURL(/\/route-finder\/result/, { timeout: 60000 }).catch(() => {});
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
    r.reachedResult = page.url().includes('/route-finder/result');
    r.resultPath = page.url().replace(/^https?:\/\/[^/]+/, '').replace(/([?&]a=)[^&]+/, '$1…');
    r.h1 = await page.locator('h1').first().innerText().catch(() => null);
    r.next = {
      whatsapp: await page.locator('main a[href*="wa.me"], main a[href*="api.whatsapp.com"]').count(),
      whatsappFab: await page.locator('[data-wa-fab]').count(),
      leadForm: await page.locator('main form:has(input[name="kind"])').count(),
      book: await page.locator('main a[href*="/book"]').count(),
      contact: await page.locator('main a[href$="/contact"]').count(),
      checkout: await page.locator('main button', { hasText: /buy/i }).count(),
      buttons: (await page.locator('main a[class*="rounded"], main button').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 8),
    };
    await page.screenshot({ path: join(OUT_DIR, 'shots', `${brand.key}-route-result-${mode}-390.jpg`), fullPage: true, type: 'jpeg', quality: 70 });
  } catch (e) {
    r.error = String(e.message).slice(0, 300);
  } finally {
    await closeQuietly(ctx);
  }
  return r;
}

async function main() {
  await mkdir(join(OUT_DIR, 'raw'), { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled'] });
  const file = join(OUT_DIR, 'raw', 'conversion.json');
  let results = {};
  try { results = JSON.parse(await readFile(file, 'utf8')).results ?? {}; } catch { /* first run */ }
  try {
    for (const key of keys) {
      const brand = BRANDS.find((b) => b.key === key);
      results[key] ??= {};
      for (const mode of modes) {
        if (mode === 'live') {
          try { await lookup(brand.domain); } catch (e) {
            results[key][mode] = { reachable: false, reason: `DNS: ${brand.domain} does not resolve (${e.code})` };
            console.log(`[conv] ${key}/${mode}: unreachable`);
            continue;
          }
        }
        const r = { reachable: true, at: new Date().toISOString() };
        r.whatsapp = await whatsappCheck(browser, brand, mode);
        r.leadForm = await leadFormCheck(browser, brand, mode);
        r.routeFinder = await routeFinderCheck(browser, brand, mode);
        if (key === 'guide') r.guideBuy = await guideBuyCheck(browser, brand, mode);
        if (mode === 'local') r.plausibleNote = 'NEXT_PUBLIC_PLAUSIBLE_ENABLED is unset locally, so no Plausible script by design';
        results[key][mode] = r;
        console.log(`[conv] ${key}/${mode}: fab1440=${r.whatsapp[1440]?.fab?.visible} fab390=${r.whatsapp[390]?.fab?.visible} form=${r.leadForm.renders} submit=${typeof r.leadForm.submission === 'string' ? 'skipped(live)' : r.leadForm.submission?.success} quiz=${r.routeFinder.reachedResult}`);
        await writeFile(file, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 1));
      }
    }
  } finally {
    await browser.close();
    await writeFile(file, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 1));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
