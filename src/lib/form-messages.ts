import { t } from '@/i18n';
import { HUB_SITE, isSiteKey } from '@/sites/registry';

/**
 * Messages a public form can show, as i18n keys (O26 bug 1).
 *
 * Validation (`lead-schema.ts`, `subscribers.ts`), the form guard and the rate
 * limiter return one of these keys rather than an English sentence; the server
 * action turns it into the visitor's language with `t(site, …)` using the
 * form's own `site`. Before this, a Spanish, Portuguese or Swedish visitor who
 * mistyped an email got "Enter a valid email address".
 *
 * Deliberately NOT `server-only`: pure, and the tests call it directly.
 */
export const FORM_MESSAGE_KEYS = [
  'formError.email',
  'formError.phone',
  'formError.phoneRequired',
  'formError.whatsapp',
  'formError.country',
  'formError.generic',
  'formError.tooFast',
  'formError.stale',
  'formError.expired',
  'formError.rateLimited',
  'formError.unavailable',
  'formError.checkEmail',
  'formError.reload',
  'newsletter.pending',
  'newsletter.alreadySubscribed',
] as const;

export type FormMessageKey = (typeof FORM_MESSAGE_KEYS)[number];

const known = new Set<string>(FORM_MESSAGE_KEYS);

export function isFormMessageKey(value: string): value is FormMessageKey {
  return known.has(value);
}

/**
 * One message in the form's language. Anything that is not one of our keys —
 * a zod default such as "Too big: expected string to have <=160 characters" —
 * becomes the generic "check the form" line rather than leaking English. An
 * unknown `site` (a tampered hidden field) gets the hub's language.
 */
export function formMessage(site: string, message: string): string {
  const key = isSiteKey(site) ? site : HUB_SITE;
  return t(key, isFormMessageKey(message) ? message : 'formError.generic');
}

/** `formMessage` over a field-keyed error map, as `parseLeadInput` returns it. */
export function localizeErrors(site: string, errors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).map(([field, message]) => [field, formMessage(site, message)]));
}
