import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTION_KEYS,
  DEDUPE_WINDOW_MS,
  dedupeKey,
  firstTouch,
  hasAttribution,
  normalisePhone,
  parseAttribution,
} from '@/lib/attribution';

/**
 * The two things O9 ported from `flyttatillparaguay` (plan §5.4.7, §12.4):
 * first-touch attribution, and idempotency by phone hash so a double submit is
 * one lead and one CRM contact.
 */
const NOW = new Date('2026-06-15T12:00:00Z');
const cookie = (value: unknown) => encodeURIComponent(JSON.stringify(value));

describe('parseAttribution — the cookie is untrusted input', () => {
  it('reads the keys it knows', () => {
    const value = parseAttribution(
      cookie({
        utm_source: 'google',
        utm_medium: 'cpc',
        gclid: 'abc',
        landing_page: '/residency/temporary-residency',
        referrer: 'https://www.google.com/',
        first_seen: '2026-05-01T09:00:00.000Z',
      }),
    );
    expect(value).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      gclid: 'abc',
      landing_page: '/residency/temporary-residency',
      referrer: 'https://www.google.com/',
      first_seen: '2026-05-01T09:00:00.000Z',
    });
  });

  it('drops anything not on the allowlist', () => {
    const value = parseAttribution(
      cookie({ utm_source: 'google', role: 'admin', tier: 'insider', __proto__: 'x' }),
    );
    expect(value).toEqual({ utm_source: 'google' });
    expect(value).not.toHaveProperty('role');
    expect(value).not.toHaveProperty('tier');
  });

  it('drops non-string and empty values', () => {
    expect(parseAttribution(cookie({ utm_source: 5, utm_medium: '', gclid: null }))).toEqual({});
  });

  it('caps a value rather than storing an unbounded string', () => {
    const value = parseAttribution(cookie({ referrer: 'x'.repeat(5000) }));
    expect(value.referrer).toHaveLength(500);
  });

  it('treats a malformed cookie as no attribution, never an error', () => {
    expect(parseAttribution(undefined)).toEqual({});
    expect(parseAttribution(null)).toEqual({});
    expect(parseAttribution('')).toEqual({});
    expect(parseAttribution('not-json')).toEqual({});
    expect(parseAttribution(cookie('a string'))).toEqual({});
    expect(parseAttribution(cookie([1, 2, 3]))).toEqual({});
    expect(parseAttribution(cookie(null))).toEqual({});
  });

  it('knows the keys it allows', () => {
    expect(ATTRIBUTION_KEYS).toContain('utm_source');
    expect(ATTRIBUTION_KEYS).toContain('landing_page');
    expect(ATTRIBUTION_KEYS).toContain('referrer');
    expect(ATTRIBUTION_KEYS).toContain('first_seen');
  });
});

describe('firstTouch — the first session wins, not the last', () => {
  it('keeps the cookie value when today has a different one', () => {
    const value = firstTouch({
      cookie: { utm_source: 'newsletter', landing_page: '/guides/documents' },
      landingPath: '/contact',
      referrer: 'https://www.google.com/',
      now: NOW,
    });
    expect(value.utm_source).toBe('newsletter');
    expect(value.landing_page).toBe('/guides/documents');
  });

  it('fills in what the cookie did not record', () => {
    const value = firstTouch({
      cookie: { utm_source: 'newsletter' },
      landingPath: '/contact',
      referrer: 'https://news.example/post',
      now: NOW,
    });
    expect(value.landing_page).toBe('/contact');
    expect(value.referrer).toBe('https://news.example/post');
    expect(value.first_seen).toBe(NOW.toISOString());
  });

  it('never overwrites an existing first_seen', () => {
    const value = firstTouch({
      cookie: { first_seen: '2026-01-01T00:00:00.000Z' },
      now: NOW,
    });
    expect(value.first_seen).toBe('2026-01-01T00:00:00.000Z');
  });

  it('reports whether there is anything worth storing', () => {
    expect(hasAttribution({})).toBe(false);
    expect(hasAttribution({ utm_source: 'google' })).toBe(true);
  });
});

describe('dedupeKey — one phone, one lead, within the window', () => {
  it('is the same for a second submit inside the window', () => {
    const a = dedupeKey({ site: 'residency', phone: '+595 981 000 000', now: NOW });
    const b = dedupeKey({
      site: 'residency',
      phone: '+595981000000',
      now: new Date(NOW.getTime() + 30_000),
    });
    expect(a).toBe(b);
  });

  it('ignores punctuation and spacing in the number', () => {
    expect(normalisePhone('+595 (981) 000-000')).toBe('595981000000');
    expect(dedupeKey({ site: 'guide', phone: '+595 (981) 000-000', now: NOW })).toBe(
      dedupeKey({ site: 'guide', phone: '595981000000', now: NOW }),
    );
  });

  it('separates the same person enquiring on two brands', () => {
    expect(dedupeKey({ site: 'residency', phone: '+595981000000', now: NOW })).not.toBe(
      dedupeKey({ site: 'investorpass', phone: '+595981000000', now: NOW }),
    );
  });

  it('separates two genuine enquiries a window apart', () => {
    const later = new Date(NOW.getTime() + DEDUPE_WINDOW_MS * 2);
    expect(dedupeKey({ site: 'residency', phone: '+595981000000', now: NOW })).not.toBe(
      dedupeKey({ site: 'residency', phone: '+595981000000', now: later }),
    );
  });

  it('is null when there is no usable phone, so those leads are never merged', () => {
    expect(dedupeKey({ site: 'residency', phone: undefined, now: NOW })).toBeNull();
    expect(dedupeKey({ site: 'residency', phone: '', now: NOW })).toBeNull();
    expect(dedupeKey({ site: 'residency', phone: '12345', now: NOW })).toBeNull();
    expect(dedupeKey({ site: 'residency', phone: 'not a phone', now: NOW })).toBeNull();
  });

  it('fits the column', () => {
    const key = dedupeKey({ site: 'residency', phone: '+595981000000', now: NOW });
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});
