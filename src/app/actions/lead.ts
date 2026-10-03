'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { POST as requestMagicLink } from '@/app/(en)/api/auth/magic/route';
import { createLead } from '@/lib/leads';
import { pickUtm } from '@/lib/lead-schema';
import { parseAttribution } from '@/lib/attribution';
import { readExposures } from '@/lib/experiments';
import { articleSlugFromPath } from '@/lib/site-events';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import { subscribe } from '@/lib/subscribers';
import { clientIp, subscribeLimit, takeLimit } from '@/lib/rate-limit';
import { formMessage, localizeErrors } from '@/lib/form-messages';
import type { LeadFormState, SubscribeFormState } from './lead-state';

/**
 * Server actions for the public forms. Everything that touches a secret (the
 * CRM key, SMTP, the database) happens here, never in a client component
 * (`vendercrm-lead-capture`, "the one architectural rule").
 *
 * The initial `useActionState` values live in `./lead-state.ts`, not here —
 * see that file's comment (S14 fix, a `'use server'` module may only export
 * async functions).
 */

const str = (form: FormData, key: string): string => String(form.get(key) ?? '');

/**
 * The two limited public writes (plan §14.2.1). A server action is a POST to
 * the page's own URL, not to `/api/*`, so the middleware's coarse net does NOT
 * cover them — they carry their own, and they are the highest-volume public
 * write path in the app.
 *
 * `state.errors.form` and `state.message` are what `LeadFormFields` and
 * `NewsletterFormFields` already render, so a refusal arrives as a sentence in
 * the form rather than as a thrown error. Every such sentence goes through
 * `formMessage(site, key)`, so it is in the form's language (O26 bug 1).
 */
export async function submitLeadAction(
  _prev: LeadFormState,
  form: FormData,
): Promise<LeadFormState> {
  const h = await headers();
  const site = str(form, 'site');
  const limit = takeLimit('lead', clientIp(h));
  if (!limit.ok) return { status: 'error', errors: { form: formMessage(site, 'formError.rateLimited') } };

  const cookieStore = await cookies();
  const cookie = (name: string) => cookieStore.get(name)?.value;
  const attribution = parseAttribution(cookie('vc_attr'));
  const referrer = h.get('referer');
  const pagePath = str(form, 'pagePath');

  const quizAnswersRaw = str(form, 'quizAnswers');
  let quizAnswers: Record<string, string> | undefined;
  if (quizAnswersRaw) {
    quizAnswers = Object.fromEntries(
      quizAnswersRaw
        .split(',')
        .map((pair) => pair.split(':'))
        .filter((parts): parts is [string, string] => parts.length === 2),
    );
  }

  const result = await createLead(
    {
      site,
      kind: str(form, 'kind'),
      name: str(form, 'name'),
      email: str(form, 'email'),
      phone: str(form, 'phone'),
      whatsapp: str(form, 'whatsapp'),
      country: str(form, 'country'),
      nationality: str(form, 'nationality'),
      message: str(form, 'message'),
      investmentRange: str(form, 'investmentRange') || undefined,
      investmentRoute: str(form, 'investmentRoute'),
      quizResult: str(form, 'quizResult'),
      quizAnswers,
      pagePath,
      utm: pickUtm(Object.fromEntries(new URLSearchParams(str(form, 'utm')))),
    },
    {
      attribution,
      referrer,
      honeypot: form.get(HONEYPOT_FIELD),
      timestamp: form.get(TIMESTAMP_FIELD),
      // O24 items 2 and 10 (`docs/conversion-core.md`, "WhatsApp-first
      // capture"): the article the form sat on, and the variants the visitor
      // was actually shown — read from our cookies, never from the form.
      context: {
        articleSlug: str(form, 'articleSlug') || articleSlugFromPath(pagePath.split(/[?#]/)[0]),
        experiments: readExposures(cookie),
      },
    },
  );

  if (!result.ok) return { status: 'error', errors: localizeErrors(site, result.errors) };
  return { status: 'ok' };
}

export async function subscribeAction(
  _prev: SubscribeFormState,
  form: FormData,
): Promise<SubscribeFormState> {
  const h = await headers();
  const site = str(form, 'site');
  const email = str(form, 'email');

  const gate = subscribeLimit({ ip: clientIp(h), email, site });
  if (gate === 'limited') return { status: 'error', message: formMessage(site, 'formError.rateLimited') };
  // Already mailed inside the hour: the address is pending, it has the link,
  // and a second identical mail is the inbox-bombing the limit exists to stop.
  // The visitor is told the same thing either way — the truth is unchanged.
  if (gate === 'already-sent') return { status: 'ok', message: formMessage(site, 'newsletter.pending') };

  const result = await subscribe(
    {
      site,
      email,
      name: str(form, 'name') || undefined,
      source: str(form, 'source') || h.get('referer') || undefined,
    },
    { honeypot: form.get(HONEYPOT_FIELD), timestamp: form.get(TIMESTAMP_FIELD) },
  );

  if (!result.ok) return { status: 'error', message: formMessage(site, result.error) };
  return {
    status: 'ok',
    message: formMessage(site, result.state === 'already-confirmed' ? 'newsletter.alreadySubscribed' : 'newsletter.pending'),
  };
}

/** Only native form submissions redirect; useActionState keeps its inline result. */
async function redirectFormResult(form: FormData, key: string, status: 'ok' | 'error'): Promise<never> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  let path = str(form, 'pagePath') || (key === 'magic' ? '/login' : '/');
  try {
    const referrer = new URL(h.get('referer') ?? '');
    if (referrer.host === host) path = referrer.pathname + referrer.search;
  } catch { /* A browser may omit Referer; use the form's public path. */ }
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) path = '/';
  const target = new URL(path, 'https://form.invalid');
  target.searchParams.set(key, status);
  redirect(target.pathname + target.search);
}

export async function submitLeadFormAction(form: FormData): Promise<void> {
  const result = await submitLeadAction({ status: 'idle' }, form);
  return redirectFormResult(form, 'lead', result.status === 'ok' ? 'ok' : 'error');
}

export async function subscribeFormAction(form: FormData): Promise<void> {
  const result = await subscribeAction({ status: 'idle' }, form);
  return redirectFormResult(form, 'newsletter', result.status === 'ok' ? 'ok' : 'error');
}

/** Reuse the API's guard, email/IP limits and account-neutral response without an HTTP self-call. */
export async function magicLinkAction(_prev: SubscribeFormState, form: FormData): Promise<SubscribeFormState> {
  const h = await headers();
  const requestHeaders = new Headers(h);
  requestHeaders.set('content-type', 'application/json');
  requestHeaders.delete('content-length');
  const response = await requestMagicLink(new NextRequest('http://localhost/api/auth/magic', {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({
      email: str(form, 'email'), site: str(form, 'site'),
      [TIMESTAMP_FIELD]: str(form, TIMESTAMP_FIELD),
      [HONEYPOT_FIELD]: str(form, HONEYPOT_FIELD),
    }),
  }));
  return response.ok ? { status: 'ok' } : { status: 'error', message: formMessage(str(form, 'site'), 'formError.checkEmail') };
}

export async function magicLinkFormAction(form: FormData): Promise<void> {
  const result = await magicLinkAction({ status: 'idle' }, form);
  return redirectFormResult(form, 'magic', result.status === 'ok' ? 'ok' : 'error');
}
