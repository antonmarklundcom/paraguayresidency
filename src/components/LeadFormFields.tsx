import { initialLeadState, type LeadFormState } from '@/app/actions/lead-state';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import type { INVESTMENT_RANGES, LeadKind } from '@/lib/lead-schema';
import type { SiteKey } from '@/sites/registry';

export type LeadVariant = 'consultation' | 'investor_inquiry' | 'contact' | 'quiz' | 'whatsapp';

const KIND_BY_VARIANT: Record<LeadVariant, LeadKind | 'whatsapp'> = {
  consultation: 'consultation',
  investor_inquiry: 'investor_inquiry',
  contact: 'contact',
  quiz: 'quiz',
  whatsapp: 'whatsapp',
};

export interface LeadFormLabels {
  name: string;
  email: string;
  phoneOrWhatsapp: string;
  nextStep: string;
  whatsapp: string;
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
  'mt-[var(--space-2)] w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-(length:--text-sm) text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const label = 'block text-(length:--text-sm) font-medium text-[var(--fg)]';
const hint = 'text-(length:--text-xs) font-normal text-[var(--fg-muted)]';

function Submit({ labels, pending }: { labels: LeadFormLabels; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-(length:--text-sm) font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
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
  countryOptions,
  id,
  action,
  state = initialLeadState,
  pending = false,
}: {
  site: SiteKey;
  variant: LeadVariant;
  timestamp: string;
  pagePath: string;
  quizResult?: string;
  quizAnswers?: string;
  labels: LeadFormLabels;
  countryOptions: React.ReactNode;
  id: string;
  action: (form: FormData) => void | Promise<void>;
  state?: LeadFormState;
  pending?: boolean;
}) {
  if (state.status === 'ok') {
    return (
      <div
        tabIndex={-1}
        role="status"
        className="rounded-[var(--radius-brand)] border border-[var(--accent)] bg-[var(--accent-soft)] p-[var(--space-6)]"
      >
        <p className="font-[family-name:var(--display-font)] text-(length:--text-lg)">
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
        <p role="alert" className="text-(length:--text-sm) text-[var(--danger)]">
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
        {variant !== 'whatsapp' ? <div>
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
            <p className="mt-1 text-(length:--text-xs) text-[var(--danger)]">{err('email')}</p>
          ) : null}
        </div> : null}
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        {variant !== 'whatsapp' ? <div>
          <label className={label} htmlFor={`${id}-phone`}>
            {labels.phoneOrWhatsapp} <span className={hint}>{labels.optional}</span>
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
            <p className="mt-1 text-(length:--text-xs) text-[var(--danger)]">{err('phone')}</p>
          ) : null}
        </div> : null}
        {variant === 'whatsapp' ? <div>
          <label className={label} htmlFor={`${id}-whatsapp`}>
            {labels.whatsapp}
          </label>
          <input id={`${id}-whatsapp`} name="whatsapp" type="tel" autoComplete="tel" required={variant === 'whatsapp'} aria-invalid={err('whatsapp') ? true : undefined} className={field} />
          {err('whatsapp') ? <p className="mt-1 text-(length:--text-xs) text-[var(--danger)]">{err('whatsapp')}</p> : null}
        </div> : null}
      </div>

      {variant !== 'contact' && variant !== 'whatsapp' ? (
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`${id}-nationality`}>
              {labels.nationality}
            </label>
            <select id={`${id}-nationality`} name="nationality" defaultValue="" className={field}>
              <option value="">{labels.choose}</option>
              {countryOptions}
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
              {(Object.keys(labels.investmentRanges) as (keyof LeadFormLabels['investmentRanges'])[]).map((range) => (
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
        {variant === 'whatsapp' ? <input id={`${id}-message`} name="message" className={field} /> : <textarea id={`${id}-message`} name="message" rows={4} className={field} />}
      </div>

      <div>
        <Submit labels={labels} pending={pending} />
        <p className="mt-[var(--space-2)] text-(length:--text-sm) text-[var(--fg-muted)]">{labels.nextStep}</p>
      </div>
    </form>
  );
}
