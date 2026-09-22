import type { ReactNode } from 'react';

/**
 * A native, initially closed disclosure row for homepage detail the Arrival
 * word budget moves out of the main read. The top rule only draws on the first
 * row of a run, so stacked rows share one line between them and a lone row
 * still reads as a bordered, clickable bar rather than stray accent text.
 */
export function Disclosure({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <details className="group border-b border-[var(--border)] first-of-type:border-t">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-(length:--text-lg) text-[var(--accent)] [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span aria-hidden="true" className="shrink-0 text-(length:--text-xl) leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="space-y-5 pb-6 text-[var(--fg-muted)]">{children}</div>
    </details>
  );
}
