import { existsSync } from 'node:fs';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import imagery from '../docs/imagery-manifest.json';

// Make sure the AVIF encodes of one hero exist, and those of another do not, whatever is on disk.
const AVIF_HERO = 'frontier-hero-red-earth-road';
const PLAIN_HERO = 'guide-hero-reading-terrace-asuncion';
vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>();
  const readdirSync = ((path: string, ...rest: unknown[]) => {
    const list = (fs.readdirSync as (...args: unknown[]) => unknown)(path, ...rest);
    return String(path).replace(/\\/g, '/').endsWith('public/images/arrival') && Array.isArray(list)
      ? [...new Set([...list, `${AVIF_HERO}-1200.avif`, `${AVIF_HERO}-2400.avif`])].filter((f) => !String(f).startsWith(`${PLAIN_HERO}-`) || !String(f).endsWith('.avif'))
      : list;
  }) as typeof fs.readdirSync;
  return { ...fs, default: { ...fs, readdirSync }, readdirSync };
});

const {
  AfterYouMessage, ArticleCards, BookMockup, ForWhom, Guarantee, MobileWhatsAppBar, OfficeStrip, PhotoHero,
  PriceTable, SamplePages, ServiceUpsell, TeamSection, Testimonials, TocPreview, TrustBar,
} = await import('@/components');
const { getHubs } = await import('@/content');
const { HUB_IMAGES, BRAND_CARD_IMAGE, BRAND_CARD_POOL, cardImages } = await import('@/lib/hub-images');
const { SITE_KEYS } = await import('@/sites/registry');
const { PROOF_FIXTURE } = await import('@/app/(en)/dev/components/fixture');

const html = (element: ReactElement) => renderToStaticMarkup(element);
const WA = '5950000000';

afterEach(() => vi.unstubAllEnvs());

describe('PriceTable', () => {
  it('renders one row per route, fees through hedged facts, a pre-typed WhatsApp action each', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', WA);
    const out = html(createElement(PriceTable, { site: 'residency' }));
    expect([...out.matchAll(/data-route="([^"]+)"/g)].map((m) => m[1])).toEqual(['temporary', 'permanent', 'cedula', 'investor_pass']);
    for (const key of ['pricing.temporary', 'pricing.permanent', 'pricing.cedula', 'pricing.investor_pass']) {
      expect(out).toContain(`data-fact="${key}" data-verified="false"`);
    }
    for (const key of ['fees.temporary_residency', 'fees.permanent_residency', 'fees.cedula_first']) expect(out).toContain(`data-fact="${key}"`);
    expect(out).toContain('quoted in writing');
    expect(out.match(/href="https:\/\/wa\.me\/5950000000\?text=/g)).toHaveLength(4);
    expect(out).toContain(encodeURIComponent('written quote for Temporary residency'));
    expect(out).toContain('data-placement="price-cedula"');
    expect(out).toContain('Government fees, paid directly to the state');
  });

  it('falls back to the contact page without a WhatsApp number, and follows each brand’s route set', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '');
    const sv = html(createElement(PriceTable, { site: 'flytta' }));
    expect(sv.match(/data-route=/g)).toHaveLength(3);
    expect(sv).not.toContain('wa.me');
    expect(sv).toContain('href="/contact"');
    expect(sv).toContain('Vårt arvode');
    expect(html(createElement(PriceTable, { site: 'guide' }))).toBe('');
    expect(html(createElement(PriceTable, { site: 'investorpass' })).match(/data-route=/g)).toHaveLength(1);
  });
});

describe('AfterYouMessage', () => {
  it('lays out four steps and promises nothing the sites do not already promise', () => {
    const out = html(createElement(AfterYouMessage, { site: 'residency' }));
    expect(out.match(/<h3\b/g)).toHaveLength(4);
    expect(out).toContain('Within one working day');
    expect(out).toContain('Nothing starts until you say yes in writing');
    expect(out).not.toMatch(/within the hour|guarantee/i);
    expect(html(createElement(AfterYouMessage, { site: 'residenciaes' }))).toContain('En un día hábil');
  });
});

describe('guide sales parts', () => {
  it('BookMockup is a labelled image of the real cover text, over the cover art or the brand colour', () => {
    const out = html(createElement(BookMockup, { site: 'guide' }));
    expect(out).toContain('role="img"');
    expect(out).toContain('aria-label="The cover of The Paraguay Residency Guide, 2026 edition"');
    expect(out).toContain('The Paraguay Residency Guide');
    expect(out).toContain('guide-cover-art-river-topography-600.avif');
    expect(out).toContain('bg-[var(--accent)]');
  });

  it('TocPreview lists the twelve chapters of docs/guide-outline.md', () => {
    const out = html(createElement(TocPreview, { site: 'guide' }));
    expect(out.match(/<h3\b/g)).toHaveLength(12);
    expect(out).toContain('id="inside"');
    expect(out).toContain('Why Paraguay (and why not)');
    expect(out).toContain('Checklists');
  });

  it('SamplePages quotes three short passages, without figures', () => {
    const out = html(createElement(SamplePages, { site: 'guide' }));
    expect(out.match(/<blockquote\b/g)).toHaveLength(3);
    const text = out.replace(/<[^>]+>/g, ' ');
    expect(text).toContain('The advertisements don’t make that distinction');
    // Only chapter numbers may appear as digits.
    expect(text.replace(/Chapter \d+/g, '')).not.toMatch(/\d/);
  });

  it('ForWhom lists four for and four not-for lines', () => {
    const out = html(createElement(ForWhom, { site: 'guide' }));
    expect(out.match(/<li\b/g)).toHaveLength(8);
  });

  it('ServiceUpsell links to the hub’s message page', () => {
    const out = html(createElement(ServiceUpsell, { site: 'guide' }));
    expect(out).toContain('href="https://paraguayresidency.co.uk/book"');
    expect(out).toContain('Want it done for you?');
  });
});

describe('ArticleCards v2', () => {
  const alts = new Map(imagery.images.map((image) => [image.id, image.alt_en]));

  it('gives every card a lazy, sized, captioned photo and never repeats one in a row', () => {
    const articles = ['a', 'b', 'c'].map((slug) => ({ title: slug, href: `/blog/${slug}`, hub: 'blog' }));
    const out = html(createElement(ArticleCards, { site: 'guide', title: 'Latest', articles }));
    const imgs = [...out.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(3);
    const ids = imgs.map((img) => /\/images\/arrival\/([a-z0-9-]+?)-\d+\.webp/.exec(img)?.[1]);
    expect(new Set(ids).size).toBe(3);
    expect(ids[0]).toBe(HUB_IMAGES.guide.blog);
    for (const [index, img] of imgs.entries()) {
      expect(img).toContain('loading="lazy"');
      expect(img).toContain('srcSet=');
      expect(img).toContain('sizes=');
      expect(img).toMatch(/width="\d+" height="\d+"/);
      expect(img).toContain(`alt="${alts.get(ids[index]!)}"`);
    }
  });

  it('uses the card’s own image, and falls back past an unknown one', () => {
    expect(cardImages('residency', [{ image: 'guide-tile-terere-cafe', hub: 'taxes' }])).toEqual(['guide-tile-terere-cafe']);
    const out = html(createElement(ArticleCards, {
      site: 'residency', title: 'x', articles: [{ title: 't', href: '/x', image: 'no-such-image', hub: 'taxes' }],
    }));
    expect(out).toContain(`/images/arrival/${HUB_IMAGES.residency.taxes}-`);
  });

  it('maps every content hub of every brand to an image that exists', () => {
    for (const site of SITE_KEYS) {
      for (const hub of getHubs(site)) expect(HUB_IMAGES[site][hub], `${site}/${hub}`).toBeTruthy();
      const ids = [...Object.values(HUB_IMAGES[site]), BRAND_CARD_IMAGE[site], ...BRAND_CARD_POOL[site]];
      for (const id of ids) {
        expect(alts.has(id), id).toBe(true);
        expect(existsSync(`public/images/arrival/${id}-800.webp`), id).toBe(true);
      }
    }
  });
});

describe('PhotoHero', () => {
  const base = { title: 'T', sub: 'S', actions: null };

  it('adds an AVIF source once the AVIF files exist, and keeps the WebP fallback', () => {
    const out = html(createElement(PhotoHero, { ...base, image: AVIF_HERO }));
    expect(out).toContain(`<source type="image/avif" srcSet="/images/arrival/${AVIF_HERO}-1200.avif 1200w, /images/arrival/${AVIF_HERO}-2400.avif 2400w"`);
    expect(out).toContain(`src="/images/arrival/${AVIF_HERO}-2400.webp"`);
    const plain = html(createElement(PhotoHero, { ...base, image: PLAIN_HERO }));
    expect(plain).not.toContain('image/avif');
    expect(plain).toContain('srcSet="/images/arrival/guide-hero-reading-terrace-asuncion-1200.webp 1200w, /images/arrival/guide-hero-reading-terrace-asuncion-2400.webp 2400w"');
  });

  it.each(['overlay', 'split', 'editorial-dark'] as const)('%s layout has exactly one high-priority image', (layout) => {
    const out = html(createElement(PhotoHero, { ...base, image: 'investorpass-hero-asuncion-river-dusk', layout }));
    expect(out).toContain(`data-hero-layout="${layout}"`);
    expect(out.match(/<img\b[^>]*fetchPriority="high"/g)).toHaveLength(1);
    expect(out).toMatch(/width="2400" height="1350"/);
  });
});

describe('MobileWhatsAppBar', () => {
  it('is WhatsApp with the brand text on service brands, tracked as mobile-bar', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', WA);
    const out = html(createElement(MobileWhatsAppBar, { site: 'residenciapt' }));
    expect(out).toContain('data-mobile-bar');
    expect(out).toContain('data-placement="mobile-bar"');
    expect(out).toMatch(/href="https:\/\/wa\.me\/5950000000\?text=/);
    expect(out).toContain('md:hidden');
    expect(out).toContain('safe-area-inset-bottom');
  });

  it('leads with the buy anchor on the guide, WhatsApp beside it', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', WA);
    const out = html(createElement(MobileWhatsAppBar, { site: 'guide' }));
    expect(out).toContain('href="/#price"');
    expect(out).toContain('Get the guide');
    expect(out).toContain('aria-label="Message us on WhatsApp"');
    expect(out.indexOf('/#price')).toBeLessThan(out.indexOf('wa.me'));
  });

  it('falls back to the contact page without a number', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '');
    const out = html(createElement(MobileWhatsAppBar, { site: 'residency' }));
    expect(out).toContain('href="/contact"');
    expect(out).not.toContain('wa.me');
  });
});

describe('every overhaul component, every brand', () => {
  // t() returns the key itself in development when a string is missing.
  const RAW_KEY = /\b(?:trust|reviews|price|after|guarantee|guideOffer|team|office|mobileBar|guideBook|guideToc|guideSample|guideFor|upsell|nav|thankYou|about|contact|whatsapp)\.[a-zA-Z_.\d]+/;
  for (const site of SITE_KEYS) {
    it(`${site} renders translated text only`, () => {
      vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', WA);
      const out = [
        html(createElement(TrustBar, { site, proof: PROOF_FIXTURE })),
        html(createElement(Testimonials, { site, proof: PROOF_FIXTURE })),
        html(createElement(PriceTable, { site, routes: ['temporary', 'permanent', 'cedula', 'investor_pass'] })),
        html(createElement(AfterYouMessage, { site })),
        html(createElement(Guarantee, { site, proof: PROOF_FIXTURE })),
        html(createElement(TeamSection, { site, proof: PROOF_FIXTURE })),
        html(createElement(OfficeStrip, { site, proof: PROOF_FIXTURE })),
        html(createElement(MobileWhatsAppBar, { site })),
        html(createElement(BookMockup, { site })),
        html(createElement(TocPreview, { site })),
        html(createElement(SamplePages, { site })),
        html(createElement(ForWhom, { site })),
        html(createElement(ServiceUpsell, { site })),
      ].join('\n').replace(/href="[^"]*"|src="[^"]*"|srcSet="[^"]*"/g, '');
      expect(out.match(RAW_KEY)?.[0]).toBeUndefined();
    });
  }
});
