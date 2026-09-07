'use client';

import { useId, useState } from 'react';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/form-guard';
import type { SiteKey } from '@/sites/registry';

export interface MagicLinkLabels {
  email: string;
  submit: string;
  sending: string;
  sentTitle: string;
  sentBody: string;
}

/**
 * Requests a sign-in link. It posts to `/api/auth/magic`, which always answers
 * 200 — so this component shows the same "check your inbox" state whether or
 * not the address has an account. That is the point (plan §5.4.5).
 */
export function MagicLinkFormFields({
  site,
  timestamp,
  labels,
}: {
  site: SiteKey;
  timestamp: string;
  labels: MagicLinkLabels;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const id = useId();

  if (status === 'sent') {
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
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setStatus('sending');
        try {
          await fetch('/api/auth/magic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: String(form.get('email') ?? ''),
              site,
              [TIMESTAMP_FIELD]: String(form.get(TIMESTAMP_FIELD) ?? ''),
              [HONEYPOT_FIELD]: String(form.get(HONEYPOT_FIELD) ?? ''),
            }),
          });
        } catch {
          // A network failure must not tell the visitor anything either; the
          // link is either in their inbox or it is not.
        }
        setStatus('sent');
      }}
    >
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
        disabled={status === 'sending'}
        className="justify-self-start rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === 'sending' ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
