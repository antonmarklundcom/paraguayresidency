import { describe, expect, it } from 'vitest';
import { parseLeadInput, pickUtm, describeQuizAnswers } from '@/lib/lead-schema';
import {
  checkFormGuard,
  isSilentDrop,
  issueFormTimestamp,
  MAX_FORM_AGE_MS,
  MIN_FILL_MS,
} from '@/lib/form-guard';
import { isCountryCode, COUNTRIES } from '@/lib/countries';

const valid = {
  site: 'residency',
  kind: 'consultation',
  name: '  Ana Ruiz  ',
  email: '  ANA@Example.com ',
  phone: '0981 123 456',
  country: 'py',
  nationality: 'de',
  message: 'Moving in March.',
};

describe('parseLeadInput', () => {
  it('accepts a complete submission and normalises it', () => {
    const result = parseLeadInput(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.email).toBe('ana@example.com');
    expect(result.data.name).toBe('Ana Ruiz');
    expect(result.data.country).toBe('PY');
    expect(result.data.nationality).toBe('DE');
  });

  it('accepts a minimal submission — only site, kind and email are required', () => {
    const result = parseLeadInput({ site: 'guide', kind: 'contact', email: 'a@b.co' });
    expect(result.ok).toBe(true);
  });

  it('rejects a bad email and names the field', () => {
    const result = parseLeadInput({ ...valid, email: 'not-an-email' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.email).toBeTruthy();
  });

  it('rejects an unknown site or kind', () => {
    expect(parseLeadInput({ ...valid, site: 'elsewhere' }).ok).toBe(false);
    expect(parseLeadInput({ ...valid, kind: 'spam' }).ok).toBe(false);
  });

  it('rejects an unknown country code', () => {
    const result = parseLeadInput({ ...valid, country: 'ZZ' });
    expect(result.ok).toBe(false);
  });

  it('treats an empty optional field as absent, not as an empty string', () => {
    const result = parseLeadInput({ ...valid, phone: '', whatsapp: '', message: '' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.phone).toBeUndefined();
    expect(result.data.message).toBeUndefined();
  });

  it('rejects a phone number that is not one', () => {
    expect(parseLeadInput({ ...valid, phone: 'call me' }).ok).toBe(false);
  });

  it('drops quiz answers that are not real questions or options', () => {
    const result = parseLeadInput({
      ...valid,
      kind: 'quiz',
      quizResult: 'investor-pass',
      quizAnswers: { goal: 'invest', nonsense: 'x', capital: 'moon' },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.quizAnswers).toEqual({ goal: 'invest' });
  });

  it('rejects a quiz result that is not one of the three routes', () => {
    expect(parseLeadInput({ ...valid, quizResult: 'golden-visa' }).ok).toBe(false);
  });

  it('caps an over-long message rather than storing it', () => {
    expect(parseLeadInput({ ...valid, message: 'x'.repeat(6000) }).ok).toBe(false);
  });
});

describe('country list', () => {
  it('covers the ISO 3166-1 set and is unique', () => {
    expect(COUNTRIES.length).toBeGreaterThan(230);
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(COUNTRIES.length);
  });

  it('recognises codes case-insensitively', () => {
    expect(isCountryCode('py')).toBe(true);
    expect(isCountryCode('PY')).toBe(true);
    expect(isCountryCode('XX')).toBe(false);
  });
});

describe('pickUtm', () => {
  it('keeps only the known attribution parameters', () => {
    const params = new URLSearchParams(
      'utm_source=google&utm_medium=cpc&gclid=abc&session=secret&page=2',
    );
    expect(pickUtm(params)).toEqual({ utm_source: 'google', utm_medium: 'cpc', gclid: 'abc' });
  });

  it('caps a very long value', () => {
    const params = new URLSearchParams(`utm_campaign=${'x'.repeat(500)}`);
    expect(pickUtm(params).utm_campaign).toHaveLength(200);
  });
});

describe('form guard', () => {
  const now = 1_800_000_000_000;

  it('accepts a form filled at human speed', () => {
    const ts = issueFormTimestamp(now);
    expect(checkFormGuard({ timestamp: ts }, now + MIN_FILL_MS + 1000)).toBe('ok');
  });

  it('rejects a submission that arrives instantly', () => {
    const ts = issueFormTimestamp(now);
    expect(checkFormGuard({ timestamp: ts }, now + 100)).toBe('too-fast');
  });

  it('rejects a form that has been open for days', () => {
    const ts = issueFormTimestamp(now);
    expect(checkFormGuard({ timestamp: ts }, now + MAX_FORM_AGE_MS + 1)).toBe('stale');
  });

  it('rejects a hand-written or re-signed timestamp', () => {
    expect(checkFormGuard({ timestamp: String(now) }, now + 10_000)).toBe('bad-token');
    expect(checkFormGuard({ timestamp: 'abc.def' }, now + 10_000)).toBe('bad-token');
    expect(checkFormGuard({ timestamp: undefined }, now)).toBe('bad-token');
    // Correct payload, someone else's signature.
    const [payload] = issueFormTimestamp(now).split('.');
    expect(checkFormGuard({ timestamp: `${payload}.forged` }, now + 10_000)).toBe('bad-token');
  });

  it('rejects a timestamp from the future', () => {
    const ts = issueFormTimestamp(now + 10 * 60_000);
    expect(checkFormGuard({ timestamp: ts }, now)).toBe('bad-token');
  });

  it('treats a filled honeypot as a silent drop, ahead of every other check', () => {
    const verdict = checkFormGuard({ honeypot: 'http://spam', timestamp: 'rubbish' }, now);
    expect(verdict).toBe('honeypot');
    expect(isSilentDrop(verdict)).toBe(true);
    expect(isSilentDrop('too-fast')).toBe(false);
  });

  it('ignores an empty honeypot', () => {
    const ts = issueFormTimestamp(now);
    expect(checkFormGuard({ honeypot: '  ', timestamp: ts }, now + MIN_FILL_MS + 1)).toBe('ok');
  });
});

describe('describeQuizAnswers', () => {
  it('renders answers in question order for the CRM timeline', () => {
    expect(describeQuizAnswers({ tax: 'yes', goal: 'invest' })).toBe('goal=invest tax=yes');
    expect(describeQuizAnswers(undefined)).toBe('');
  });
});
