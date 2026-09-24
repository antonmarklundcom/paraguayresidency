import type { ReactNode } from 'react';

export interface Reason { title: string; body: ReactNode }

/**
 * "Why Paraguay" as a card grid. Legal and money specifics go in `body` through
 * `<Fact>`, never as literals (CLAUDE.md).
 */
export function Reasons({ title, intro, reasons, footer }: { title: string; intro?: string; reasons: Reason[]; footer?: ReactNode }) {
  return (
    <section className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--container)] px-5 sm:px-8">
        <h2 className="max-w-xl font-[family-name:var(--display-font)] text-(length:--text-2xl) leading-[var(--leading-tight)] text-balance sm:text-(length:--text-3xl)">{title}</h2>
        {intro && <p className="mt-4 max-w-xl text-[var(--fg-muted)]">{intro}</p>}
        <ul className={`mt-10 grid gap-4 sm:grid-cols-2 ${reasons.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {reasons.map((reason) => (
            <li key={reason.title} className="flex flex-col rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
              <span aria-hidden="true" className="mb-5 flex size-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">✦</span>
              <h3 className="font-[family-name:var(--display-font)] text-(length:--text-xl) leading-[var(--leading-tight)]">{reason.title}</h3>
              <div className="mt-3 text-(length:--text-sm) leading-relaxed text-[var(--fg-muted)]">{reason.body}</div>
            </li>
          ))}
        </ul>
        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </section>
  );
}
