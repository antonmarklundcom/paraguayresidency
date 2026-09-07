'use client';

import { useState } from 'react';

export interface CheckoutLabels {
  buy: string;
  starting: string;
  unavailable: string;
  error: string;
}

/**
 * Starts checkout through our own `/api/checkout` — the Stripe secret key
 * never reaches the browser. With Stripe unconfigured the button renders as
 * "coming soon" instead of failing (plan §4.5).
 */
export function CheckoutButtonClient({
  enabled,
  timestamp,
  labels,
}: {
  enabled: boolean;
  timestamp: string;
  labels: CheckoutLabels;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) {
    return (
      <span className="inline-flex items-center rounded-[var(--radius-brand)] border border-[var(--border)] px-5 py-3 text-[var(--text-sm)] text-[var(--fg-muted)]">
        {labels.unavailable}
      </span>
    );
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ts: timestamp, utm: window.location.search.replace(/^\?/, '') }),
      });
      const body = (await response.json()) as { ok?: boolean; url?: string | null };
      if (body.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      setError(labels.error);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={start}
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
