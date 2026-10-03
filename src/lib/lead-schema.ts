import { z } from 'zod';
import { UTM_KEYS } from './utm';
import { COUNTRIES } from './countries';
import { SITE_KEYS } from '@/sites/registry';
import { QUESTION_IDS, ROUTES, sanitizeAnswers } from '@/features/quiz/scoring';

/**
 * Lead validation, kept free of `server-only`, the database and the network so
 * it can be unit-tested directly (plan §5.2.8).
 */

export const LEAD_KINDS = ['consultation', 'investor_inquiry', 'contact', 'quiz'] as const;
/** Every kind a lead can have. `whatsapp` needs only a number (O24 item 2, `docs/conversion-core.md`). */
export const ALL_LEAD_KINDS = [...LEAD_KINDS, 'whatsapp'] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

/** Bands, not figures — the real thresholds are unverified (`facts.ts`). */
export const INVESTMENT_RANGES = ['under_50k', 'band_50k_150k', 'over_150k', 'undecided'] as const;

const countryCodes = new Set(COUNTRIES.map((c) => c.code));

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? undefined : v))
    .optional();

const countryCode = z
  .string()
  .trim()
  .toUpperCase()
  .refine((v) => v === '' || countryCodes.has(v), { message: 'formError.country' })
  .transform((v) => (v === '' ? undefined : v))
  .optional();

/**
 * VenderCRM uses the phone as the contact identity and WhatsApp replies thread
 * onto it, so every lead form requires one (Anton, 2026-09-24: leads come in by
 * WhatsApp or the form, never a booked call). `00` becomes `+`, the
 * international form the CRM expects.
 */
const phone = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || /^[+()\d][\d\s()+.-]{5,}$/.test(v), { message: 'formError.phone' })
  .transform((v) => (v === '' ? undefined : v.replace(/^00/, '+')))
  .optional();

export const leadInputSchema = z.object({
  site: z.enum(SITE_KEYS as unknown as [string, ...string[]]),
  kind: z.enum(ALL_LEAD_KINDS),
  name: optionalTrimmed(160),
  email: z.union([z.string().trim().toLowerCase().email('formError.email').max(255), z.literal('')]).default(''),
  phone,
  whatsapp: phone,
  country: countryCode,
  nationality: countryCode,
  message: optionalTrimmed(5000),
  investmentRange: z.enum(INVESTMENT_RANGES).optional(),
  /** Investor inquiry only: which qualifying route they think they want. */
  investmentRoute: optionalTrimmed(60),
  quizResult: z
    .string()
    .trim()
    .refine((v) => v === '' || (ROUTES as readonly string[]).includes(v))
    .transform((v) => (v === '' ? undefined : v))
    .optional(),
  quizAnswers: z.record(z.string(), z.string()).optional(),
  pagePath: optionalTrimmed(512),
  utm: z.record(z.string(), z.string()).optional(),
}).superRefine((input, ctx) => {
  if (input.kind !== 'whatsapp' && !input.email) {
    ctx.addIssue({ code: 'custom', path: ['email'], message: 'formError.email' });
  }
  if (input.kind === 'whatsapp' && !input.phone && !input.whatsapp) {
    ctx.addIssue({ code: 'custom', path: ['whatsapp'], message: 'formError.whatsapp' });
  }
  if (input.kind !== 'whatsapp' && !input.phone && !input.whatsapp) {
    ctx.addIssue({ code: 'custom', path: ['phone'], message: 'formError.phoneRequired' });
  }
});
// `whatsapp` is stored as its own `leads.kind` since O24 (item 2); the NOT NULL
// email column stores its absence as an empty string. On a database that has
// not run migration 0002, `createLead` stores `contact` instead — see there.

export type LeadInput = z.infer<typeof leadInputSchema>;

/**
 * Parses raw form/JSON input. Returns field-keyed errors so the form can show
 * them next to the input that caused them. The messages are i18n keys
 * (`formError.*`, `src/lib/form-messages.ts`), not sentences: the server action
 * renders them in the form's language (O26 bug 1).
 */
export function parseLeadInput(
  raw: unknown,
): { ok: true; data: LeadInput } | { ok: false; errors: Record<string, string> } {
  const result = leadInputSchema.safeParse(raw);
  if (result.success) {
    return {
      ok: true,
      data: {
        ...result.data,
        quizAnswers: result.data.quizAnswers
          ? (sanitizeAnswers(result.data.quizAnswers) as Record<string, string>)
          : undefined,
      },
    };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** `utm_source` … `fbclid` off a query string, capped and deduplicated. */
export { UTM_KEYS } from './utm';

export function pickUtm(params: URLSearchParams | Record<string, string>): Record<string, string> {
  const get = (key: string): string | null =>
    params instanceof URLSearchParams ? params.get(key) : (params[key] ?? null);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = get(key);
    if (value) out[key] = value.slice(0, 200);
  }
  return out;
}

/** Quiz answers rendered for the CRM timeline and the notification email. */
export function describeQuizAnswers(answers: Record<string, string> | undefined): string {
  if (!answers) return '';
  return QUESTION_IDS.filter((q) => answers[q]).map((q) => `${q}=${answers[q]}`).join(' ');
}
