import type { ReactNode } from 'react';

/**
 * Ported from `antonmarklundcom/flyttatillparaguay` (`components/ui.tsx`,
 * plan §12.4). A small inline callout for a hedge that is not itself a
 * `<Fact>` value (e.g. "this is not tax advice") — used inside article bodies
 * next to Swedish exit-tax mentions (plan §11.8).
 */
export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="not-prose mt-[var(--space-6)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-4)] text-[var(--text-sm)] text-[var(--fg-muted)]">
      {children}
    </p>
  );
}
