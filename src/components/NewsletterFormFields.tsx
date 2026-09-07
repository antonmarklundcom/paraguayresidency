'use client';

import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import {
  initialSubscribeState,
  subscribeAction,
  type SubscribeFormState,
} from '@/app/actions/lead';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import type { SiteKey } from '@/sites/registry';

export interface NewsletterLabels {
  email: string;
  submit: string;
  sending: string;
  note: string;
}

function Submit({ labels }: { labels: NewsletterLabels }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? labels.sending : labels.submit}
    </button>
  );
}

export function NewsletterFormFields({
  site,
  timestamp,
  source,
  labels,
}: {
  site: SiteKey;
  timestamp: string;
  source: string;
  labels: NewsletterLabels;
}) {
  const [state, action] = useActionState<SubscribeFormState, FormData>(
    subscribeAction,
    initialSubscribeState,
  );
  const id = useId();

  if (state.status === 'ok') {
    return (
      <p role="status" className="text-[var(--text-sm)] text-[var(--fg)]">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-[var(--space-3)]">
      <input type="hidden" name="site" value={site} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name={TIMESTAMP_FIELD} value={timestamp} />
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="flex flex-wrap gap-[var(--space-3)]">
        <label className="sr-only" htmlFor={`${id}-email`}>
          {labels.email}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={labels.email}
          className="min-w-[16rem] flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-sm)] text-[var(--fg)] outline-none focus:border-[var(--accent)]"
        />
        <Submit labels={labels} />
      </div>
      {state.status === 'error' ? (
        <p role="alert" className="text-[var(--text-xs)] text-[var(--danger)]">
          {state.message}
        </p>
      ) : (
        <p className="text-[var(--text-xs)] text-[var(--fg-muted)]">{labels.note}</p>
      )}
    </form>
  );
}
