'use client';

import { useState } from 'react';

export interface CheckoutLabels {
  buy: string;
  starting: string;
  unavailable: string;
  error: string;
  /** TEMPORARY — only shown while FREE_ACCESS_MODE asks the checkout route for an email. */
  emailPlaceholder?: string;
  emailSubmit?: string;
}

/**
 * Starts checkout through our own `/api/checkout` — the Stripe secret key
 * never reaches the browser. With Stripe unconfigured the button renders as
 * "coming soon" instead of failing (plan §4.5).
 *
 * TEMPORARY: while the server has `FREE_ACCESS_MODE=true` (plan §7 — no
 * Stripe keys yet), `/api/checkout` answers `email-required` because there is
 * no hosted Stripe page to collect one; this component then asks for an
 * email inline and resubmits. Remove this branch together with the server
 * flag once Stripe live keys land.
 */
export function CheckoutButtonClient({
  enabled,
  product,
  timestamp,
  labels,
}: {
  enabled: boolean;
  product: string;
  timestamp: string;
  labels: CheckoutLabels;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState('');

  if (!enabled) {
    return (
      <span className="inline-flex items-center rounded-[var(--radius-brand)] border border-[var(--border)] px-5 py-3 text-[var(--text-sm)] text-[var(--fg-muted)]">
        {labels.unavailable}
      </span>
    );
  }

  async function start(withEmail?: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          ts: timestamp,
          utm: window.location.search.replace(/^\?/, ''),
          ...(withEmail ? { email: withEmail } : {}),
        }),
      });
      const body = (await response.json()) as { ok?: boolean; url?: string | null; error?: string };
      if (body.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      if (body.error === 'email-required') {
        setNeedsEmail(true);
        return;
      }
      setError(labels.error);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  if (needsEmail) {
    return (
      <form
        className="inline-flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim()) void start(email.trim());
        }}
      >
        <span className="inline-flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={labels.emailPlaceholder ?? 'you@example.com'}
            className="rounded-[var(--radius-brand)] border border-[var(--border)] px-4 py-3 text-[var(--text-sm)]"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-6 py-3.5 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? labels.starting : (labels.emailSubmit ?? labels.buy)}
          </button>
        </span>
        {error ? (
          <span role="alert" className="text-[var(--text-xs)] text-[var(--danger)]">
            {error}
          </span>
        ) : null}
      </form>
    );
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={() => start()}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-6 py-3.5 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? labels.starting : labels.buy}
      </button>
      {error ? (
        <span role="alert" className="text-[var(--text-xs)] text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </span>
  );
}
