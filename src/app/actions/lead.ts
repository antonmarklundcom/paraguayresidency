'use server';

import { cookies, headers } from 'next/headers';
import { createLead } from '@/lib/leads';
import { pickUtm } from '@/lib/lead-schema';
import { parseAttribution } from '@/lib/attribution';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import { subscribe } from '@/lib/subscribers';
import {
  clientIp,
  RATE_LIMIT_MESSAGE,
  SUBSCRIBE_PENDING_MESSAGE,
  subscribeLimit,
  takeLimit,
} from '@/lib/rate-limit';
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
 * The limits (plan §14.2.1). A server action is a POST to the page's own URL,
 * not to `/api/*`, so the middleware's coarse net does NOT cover these two —
 * they carry their own, and they are the highest-volume public write path in
 * the app.
 *
 * `state.errors.form` and `state.message` are what `LeadFormFields` and
 * `NewsletterFormFields` already render, so a 429 arrives as a sentence in the
 * form rather than as a thrown error.
 */

export async function submitLeadAction(
  _prev: LeadFormState,
  form: FormData,
): Promise<LeadFormState> {
  const h = await headers();
  const limit = takeLimit('lead', clientIp(h));
  if (!limit.ok) return { status: 'error', errors: { form: RATE_LIMIT_MESSAGE } };

  const cookieStore = await cookies();
  const attribution = parseAttribution(cookieStore.get('vc_attr')?.value);
  const referrer = h.get('referer');

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
      site: str(form, 'site'),
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
      pagePath: str(form, 'pagePath'),
      utm: pickUtm(Object.fromEntries(new URLSearchParams(str(form, 'utm')))),
    },
    {
      attribution,
      referrer,
      honeypot: form.get(HONEYPOT_FIELD),
      timestamp: form.get(TIMESTAMP_FIELD),
    },
  );

  if (!result.ok) return { status: 'error', errors: result.errors };
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
  if (gate === 'limited') return { status: 'error', message: RATE_LIMIT_MESSAGE };
  // Already mailed inside the hour: the address is pending, it has the link,
  // and a second identical mail is the inbox-bombing the limit exists to stop.
  // The visitor is told the same thing either way — the truth is unchanged.
  if (gate === 'already-sent') return { status: 'ok', message: SUBSCRIBE_PENDING_MESSAGE };

  const result = await subscribe(
    {
      site,
      email,
      name: str(form, 'name') || undefined,
      source: str(form, 'source') || h.get('referer') || undefined,
    },
    { honeypot: form.get(HONEYPOT_FIELD), timestamp: form.get(TIMESTAMP_FIELD) },
  );

  if (!result.ok) return { status: 'error', message: result.error };
  return {
    status: 'ok',
    message: result.state === 'already-confirmed'
        ? 'You are already on the list.'
        : SUBSCRIBE_PENDING_MESSAGE,
  };
}
