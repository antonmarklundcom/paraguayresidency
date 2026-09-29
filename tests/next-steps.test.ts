import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextSteps, MobileWhatsAppBar, WhatsAppFab } from '@/components';
import { priceKeyFor, replyHours, withPageMessage } from '@/lib/reply-window';
import { SITE_KEYS } from '@/sites/registry';

afterEach(() => vi.unstubAllEnvs());
const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe('reply window config', () => {
  it('is null unless a positive whole number is configured', () => {
    for (const bad of [undefined, '', 'abc', '0', '-2', '1.5', '9999']) expect(replyHours(bad)).toBeNull();
    expect(replyHours('24')).toBe(24);
  });
});

describe('priceKeyFor', () => {
  it('maps paths to pricing.* facts, defaulting to temporary', () => {
    expect(priceKeyFor('/investor-pass/process')).toBe('pricing.investor_pass');
    expect(priceKeyFor('/residencia-fiscal')).toBe('pricing.tax_residency');
    expect(priceKeyFor('/familj')).toBe('pricing.family');
    expect(priceKeyFor('/residencia/cedula')).toBe('pricing.cedula');
    expect(priceKeyFor('/residency/permanent-residency')).toBe('pricing.permanent');
    expect(priceKeyFor('/guides/anything')).toBe('pricing.temporary');
  });
});

describe('withPageMessage', () => {
  const href = 'https://wa.me/595981123456?text=Hi';
  it('puts the page name in the text, dropping the brand suffix', () => {
    const out = new URL(withPageMessage(href, 'Reading "{page}".', 'Cédula in Paraguay | Brand'));
    expect(out.searchParams.get('text')).toBe('Reading "Cédula in Paraguay".');
  });
  it('leaves the link alone without a template placeholder or title', () => {
    expect(withPageMessage(href, 'no placeholder', 'Title')).toBe(href);
    expect(withPageMessage(href, '{page}', '')).toBe(href);
  });
});

describe.each(SITE_KEYS)('%s', (site) => {
  it('NextSteps renders 3 steps, a fact-backed price and no reply number by default', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '595981123456');
    vi.stubEnv('NEXT_PUBLIC_REPLY_HOURS', '');
    const out = html(createElement(NextSteps, { site, path: '/x' }));
    expect(out.match(/<li/g)).toHaveLength(3);
    expect(out).toContain('data-fact="pricing.temporary"');
    expect(out).toContain('data-reply-window="none"');
    expect(out).toContain('https://wa.me/595981123456');
    expect(out).not.toMatch(/nextSteps\./);
  });
  it('NextSteps shows the configured reply hours', () => {
    vi.stubEnv('NEXT_PUBLIC_REPLY_HOURS', '24');
    expect(html(createElement(NextSteps, { site, path: '/x' }))).toContain('data-reply-window="24"');
  });
  it('without a WhatsApp number: no wa.me link anywhere, contact fallback instead', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '');
    const out = html(createElement(NextSteps, { site })) + html(createElement(MobileWhatsAppBar, { site })) + html(createElement(WhatsAppFab, { site }));
    expect(out).not.toContain('wa.me');
    expect(out).toContain('href="/contact"');
  });
});
