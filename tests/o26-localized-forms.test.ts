import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import en from '@/i18n/messages/en/common.json';
import es from '@/i18n/messages/es/common.json';
import pt from '@/i18n/messages/pt/common.json';
import sv from '@/i18n/messages/sv/common.json';
import { FORM_MESSAGE_KEYS, formMessage, localizeErrors } from '@/lib/form-messages';
import { parseLeadInput } from '@/lib/lead-schema';

/**
 * O26 bug 1: a Spanish, Portuguese or Swedish visitor saw English validation,
 * rate-limit and newsletter messages. Validation now returns keys and the
 * action renders them with `t(site, …)` for the form's own brand.
 */

const mocks = vi.hoisted(() => ({
  lead: vi.fn(), subscribe: vi.fn(), magic: vi.fn(), limitOk: true, gate: 'ok' as string,
}));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ host: 'x.localhost' }), cookies: async () => ({ get: () => undefined }) }));
vi.mock('next/navigation', () => ({ redirect: () => { throw new Error('NEXT_REDIRECT'); } }));
vi.mock('@/lib/leads', () => ({ createLead: mocks.lead }));
vi.mock('@/lib/subscribers', () => ({ subscribe: mocks.subscribe }));
vi.mock('@/app/(en)/api/auth/magic/route', () => ({ POST: mocks.magic }));
vi.mock('@/lib/rate-limit', () => ({
  clientIp: () => 'local',
  takeLimit: () => ({ ok: mocks.limitOk }),
  subscribeLimit: () => mocks.gate,
}));
import { magicLinkAction, submitLeadAction, subscribeAction } from '@/app/actions/lead';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries({ kind: 'contact', email: 'a@b.test', ...fields })) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.limitOk = true;
  mocks.gate = 'ok';
});

describe('form message keys', () => {
  it('exist in every locale, and es/pt/sv are actually translated', () => {
    for (const key of FORM_MESSAGE_KEYS) {
      const english = (en as Record<string, string>)[key];
      expect(english, key).toBeTruthy();
      for (const [locale, messages] of Object.entries({ es, pt, sv })) {
        const value = (messages as Record<string, string>)[key];
        expect(value, `${locale} ${key}`).toBeTruthy();
        expect(value, `${locale} ${key} is still English`).not.toBe(english);
      }
    }
  });

  it('parseLeadInput returns keys, not English sentences', () => {
    const result = parseLeadInput({ site: 'residenciaes', kind: 'contact', email: 'nope', phone: '12' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.email).toBe('formError.email');
    expect(result.errors.phone).toBe('formError.phone');
  });

  it('renders a key in the brand language, a stray zod default as the generic line, and a bad site in English', () => {
    expect(formMessage('residenciaes', 'formError.email')).toBe(es['formError.email']);
    expect(formMessage('residenciapt', 'formError.email')).toBe(pt['formError.email']);
    expect(formMessage('flytta', 'formError.email')).toBe(sv['formError.email']);
    expect(formMessage('flytta', 'Too big: expected string to have <=160 characters')).toBe(sv['formError.generic']);
    expect(formMessage('not-a-site', 'formError.email')).toBe(en['formError.email']);
    expect(localizeErrors('residenciapt', { email: 'formError.email', form: 'formError.tooFast' })).toEqual({
      email: pt['formError.email'],
      form: pt['formError.tooFast'],
    });
  });
});

describe('the public actions answer in the form language', () => {
  it('lead field errors on a Spanish form are Spanish', async () => {
    mocks.lead.mockResolvedValue({ ok: false, errors: { email: 'formError.email', phone: 'formError.phoneRequired' } });
    const state = await submitLeadAction({ status: 'idle' }, form({ site: 'residenciaes' }));
    expect(state).toEqual({ status: 'error', errors: { email: es['formError.email'], phone: es['formError.phoneRequired'] } });
  });

  it('the lead rate limit on a Swedish form is Swedish', async () => {
    mocks.limitOk = false;
    const state = await submitLeadAction({ status: 'idle' }, form({ site: 'flytta' }));
    expect(state.errors?.form).toBe(sv['formError.rateLimited']);
    expect(mocks.lead).not.toHaveBeenCalled();
  });

  it('newsletter pending / already-subscribed / limited / invalid are Portuguese on the pt brand', async () => {
    mocks.subscribe.mockResolvedValue({ ok: true, state: 'pending' });
    expect((await subscribeAction({ status: 'idle' }, form({ site: 'residenciapt' }))).message).toBe(pt['newsletter.pending']);
    mocks.subscribe.mockResolvedValue({ ok: true, state: 'already-confirmed' });
    expect((await subscribeAction({ status: 'idle' }, form({ site: 'residenciapt' }))).message).toBe(pt['newsletter.alreadySubscribed']);
    mocks.subscribe.mockResolvedValue({ ok: false, error: 'formError.email' });
    expect((await subscribeAction({ status: 'idle' }, form({ site: 'residenciapt' }))).message).toBe(pt['formError.email']);
    mocks.gate = 'already-sent';
    expect((await subscribeAction({ status: 'idle' }, form({ site: 'residenciapt' }))).message).toBe(pt['newsletter.pending']);
    mocks.gate = 'limited';
    expect((await subscribeAction({ status: 'idle' }, form({ site: 'residenciapt' }))).message).toBe(pt['formError.rateLimited']);
  });

  it('a refused magic link answers in the brand language', async () => {
    mocks.magic.mockResolvedValue(Response.json({ ok: false }, { status: 422 }));
    expect((await magicLinkAction({ status: 'idle' }, form({ site: 'residenciaes' }))).message).toBe(es['formError.checkEmail']);
  });
});

describe('the no-JS error line', () => {
  it('renders the message it is handed, not a hardcoded English sentence', async () => {
    vi.stubGlobal('window', { location: { search: '?lead=error' }, addEventListener() {}, removeEventListener() {} });
    const { ProgressiveForm } = await import('@/components/ProgressiveForm');
    const html = renderToStaticMarkup(createElement(ProgressiveForm, {
      kind: 'lead',
      fields: { site: 'flytta' } as never,
      base: createElement('form', null, 'Base'),
      success: createElement('p', null, 'ok'),
      errorMessage: sv['formError.reload'],
    }));
    vi.unstubAllGlobals();
    expect(html).not.toContain('Check the form and try again');
  });
});
