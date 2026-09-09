'use client';

import { useActionState, useEffect, useId, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { submitLeadAction } from '@/app/actions/lead';
import { initialLeadState, type LeadFormState } from '@/app/actions/lead-state';
import { COUNTRIES } from '@/lib/countries';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import { INVESTMENT_RANGES, type LeadKind } from '@/lib/lead-schema';
import type { SiteKey } from '@/sites/registry';

export type LeadVariant = 'consultation' | 'investor_inquiry' | 'contact' | 'quiz';

const KIND_BY_VARIANT: Record<LeadVariant, LeadKind> = {
  consultation: 'consultation',
  investor_inquiry: 'investor_inquiry',
  contact: 'contact',
  quiz: 'quiz',
};

export interface LeadFormLabels {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  nationality: string;
  message: string;
  investmentRange: string;
  investmentRoute: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  optional: string;
  choose: string;
  investmentRanges: Record<(typeof INVESTMENT_RANGES)[number], string>;
  investmentRoutes: { id: string; label: string }[];
}

const field =
  'mt-[var(--space-2)] w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-sm)] text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const label = 'block text-[var(--text-sm)] font-medium text-[var(--fg)]';
const hint = 'text-[var(--text-xs)] font-normal text-[var(--fg-muted)]';

function Submit({ labels }: { labels: LeadFormLabels }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? labels.sending : labels.submit}
    </button>
  );
}

export function LeadFormFields({
  site,
  variant,
  timestamp,
  pagePath,
  quizResult,
  quizAnswers,
  labels,
}: {
  site: SiteKey;
  variant: LeadVariant;
  timestamp: string;
  pagePath: string;
  quizResult?: string;
  quizAnswers?: string;
  labels: LeadFormLabels;
}) {
  const [state, action] = useActionState<LeadFormState, FormData>(
    submitLeadAction,
    initialLeadState,
  );
  const id = useId();
  const successRef = useRef<HTMLDivElement>(null);

  // In-place success, plus `?lead=ok` so analytics can count conversions
  // without a separate thank-you page (plan §5.2.2).
  useEffect(() => {
    if (state.status !== 'ok') return;
    successRef.current?.focus();
    const url = new URL(window.location.href);
    if (url.searchParams.get('lead') !== 'ok') {
      url.searchParams.set('lead', 'ok');
      window.history.replaceState({}, '', url);
    }
  }, [state.status]);

  if (state.status === 'ok') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-[var(--radius-brand)] border border-[var(--accent)] bg-[var(--accent-soft)] p-[var(--space-6)]"
      >
        <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
          {labels.successTitle}
        </p>
        <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{labels.successBody}</p>
      </div>
    );
  }

  const err = (key: string) => state.errors?.[key];

  return (
    <form action={action} className="grid gap-[var(--space-4)]" noValidate>
      <input type="hidden" name="site" value={site} />
      <input type="hidden" name="kind" value={KIND_BY_VARIANT[variant]} />
      <input type="hidden" name="pagePath" value={pagePath} />
      <input type="hidden" name={TIMESTAMP_FIELD} value={timestamp} />
      {quizResult ? <input type="hidden" name="quizResult" value={quizResult} /> : null}
      {quizAnswers ? <input type="hidden" name="quizAnswers" value={quizAnswers} /> : null}

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {state.errors?.form ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {state.errors.form}
        </p>
      ) : null}

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-name`}>
            {labels.name}
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor={`${id}-email`}>
            {labels.email}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={err('email') ? true : undefined}
            className={field}
          />
          {err('email') ? (
            <p className="mt-1 text-[var(--text-xs)] text-[var(--danger)]">{err('email')}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-phone`}>
            {labels.phone}
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+595 981 123 456"
            aria-invalid={err('phone') ? true : undefined}
            className={field}
          />
          {err('phone') ? (
            <p className="mt-1 text-[var(--text-xs)] text-[var(--danger)]">{err('phone')}</p>
          ) : null}
        </div>
        <div>
          <label className={label} htmlFor={`${id}-whatsapp`}>
            {labels.whatsapp} <span className={hint}>{labels.optional}</span>
          </label>
          <input id={`${id}-whatsapp`} name="whatsapp" type="tel" className={field} />
        </div>
      </div>

      {variant !== 'contact' ? (
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${id}-nationality`}>
              {labels.nationality}
            </label>
            <select id={`${id}-nationality`} name="nationality" defaultValue="" className={field}>
              <option value="">{labels.choose}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor={`${id}-country`}>
              {labels.country}
            </label>
            <select id={`${id}-country`} name="country" defaultValue="" className={field}>
              <option value="">{labels.choose}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {variant === 'investor_inquiry' ? (
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${id}-range`}>
              {labels.investmentRange}
            </label>
            <select id={`${id}-range`} name="investmentRange" defaultValue="" className={field}>
              <option value="">{labels.choose}</option>
              {INVESTMENT_RANGES.map((range) => (
                <option key={range} value={range}>
                  {labels.investmentRanges[range]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor={`${id}-route`}>
              {labels.investmentRoute}
            </label>
            <select id={`${id}-route`} name="investmentRoute" defaultValue="" className={field}>
              <option value="">{labels.choose}</option>
              {labels.investmentRoutes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div>
        <label className={label} htmlFor={`${id}-message`}>
          {labels.message}
        </label>
        <textarea id={`${id}-message`} name="message" rows={4} className={field} />
      </div>

      <div>
        <Submit labels={labels} />
      </div>
    </form>
  );
}
