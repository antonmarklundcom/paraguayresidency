import { initialSubscribeState, type SubscribeFormState } from '@/app/actions/lead-state';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import type { SiteKey } from '@/sites/registry';

export interface MagicLinkLabels {
  email: string;
  submit: string;
  sending: string;
  sentTitle: string;
  sentBody: string;
}

/** Shared server-rendered view, also used by the client enhancement. */
export function MagicLinkFormFields({
  site,
  timestamp,
  labels,
  id,
  action,
  state = initialSubscribeState,
  pending = false,
}: {
  site: SiteKey;
  timestamp: string;
  labels: MagicLinkLabels;
  id: string;
  action: (form: FormData) => void | Promise<void>;
  state?: SubscribeFormState;
  pending?: boolean;
}) {
  if (state.status === 'ok') {
    return (
      <div role="status">
        <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
          {labels.sentTitle}
        </p>
        <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{labels.sentBody}</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-[var(--space-3)]"
      action={action}
    >
      <input type="hidden" name="site" value={site} />
      {state.status === 'error' ? <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">{state.message}</p> : null}
      <input type="hidden" name={TIMESTAMP_FIELD} value={timestamp} />
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-px w-px overflow-hidden opacity-0"
      />
      <label htmlFor={`${id}-email`} className="text-[var(--text-sm)]">
        {labels.email}
      </label>
      <input
        id={`${id}-email`}
        name="email"
        type="email"
        required
        autoComplete="email"
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
      />
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
