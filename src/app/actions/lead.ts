'use server';

import { cookies, headers } from 'next/headers';
import { createLead } from '@/lib/leads';
import { pickUtm } from '@/lib/lead-schema';
import { readAttribution } from '@/lib/vendercrm';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import { subscribe } from '@/lib/subscribers';

/**
 * Server actions for the public forms. Everything that touches a secret (the
 * CRM key, SMTP, the database) happens here, never in a client component
 * (`vendercrm-lead-capture`, "the one architectural rule").
 */

export interface LeadFormState {
  status: 'idle' | 'ok' | 'error';
  errors?: Record<string, string>;
  message?: string;
}

export const initialLeadState: LeadFormState = { status: 'idle' };

const str = (form: FormData, key: string): string => String(form.get(key) ?? '');

export async function submitLeadAction(
  _prev: LeadFormState,
  form: FormData,
): Promise<LeadFormState> {
  const cookieStore = await cookies();
  const attribution = readAttribution(cookieStore.get('vc_attr')?.value);

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
      honeypot: form.get(HONEYPOT_FIELD),
      timestamp: form.get(TIMESTAMP_FIELD),
    },
  );

  if (!result.ok) return { status: 'error', errors: result.errors };
  return { status: 'ok' };
}

export interface SubscribeFormState {
  status: 'idle' | 'ok' | 'error';
  message?: string;
}

export const initialSubscribeState: SubscribeFormState = { status: 'idle' };

export async function subscribeAction(
  _prev: SubscribeFormState,
  form: FormData,
): Promise<SubscribeFormState> {
  const h = await headers();
  const result = await subscribe(
    {
      site: str(form, 'site'),
      email: str(form, 'email'),
      name: str(form, 'name') || undefined,
      source: str(form, 'source') || h.get('referer') || undefined,
    },
    { honeypot: form.get(HONEYPOT_FIELD), timestamp: form.get(TIMESTAMP_FIELD) },
  );

  if (!result.ok) return { status: 'error', message: result.error };
  return {
    status: 'ok',
    message:
      result.state === 'already-confirmed'
        ? 'You are already on the list.'
        : 'Check your inbox — click the link in the confirmation email to finish.',
  };
}
