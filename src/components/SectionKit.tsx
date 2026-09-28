import type { ReactNode } from 'react';

/**
 * The shared frame of the overhaul sections (TrustBar, PriceTable, …): one
 * vertical rhythm (`--space-section`), one gutter (`--space-gutter`), one
 * header pattern. Presentation only; every string arrives translated.
 */
export type BandTone = 'default' | 'alt' | 'surface';

const tones: Record<BandTone, string> = {
  default: 'bg-[var(--bg)]',
  alt: 'bg-[var(--surface-alt)]',
  surface: 'bg-[var(--surface)]',
};

export function Band({ children, tone = 'default', id, labelledBy, label, className = '', ...data }: {
  children: ReactNode;
  tone?: BandTone;
  id?: string;
  labelledBy?: string;
  label?: string;
  className?: string;
} & { [key: `data-${string}`]: string | boolean | undefined }) {
  return (
    <section id={id} aria-labelledby={labelledBy} aria-label={label} className={`scroll-mt-20 py-[var(--space-section)] ${tones[tone]} ${className}`} {...data}>
      <div className="mx-auto w-full max-w-[var(--container)] px-[var(--space-gutter)]">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className = '', color = 'text-[var(--accent)]' }: {
  children: ReactNode;
  className?: string;
  /** A text-colour utility; the accent unless the band needs another. */
  color?: string;
}) {
  return (
    <p className={`flex items-center gap-3 text-(length:--step--2) font-medium uppercase tracking-[.18em] ${color} ${className}`}>
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current" />
      {children}
    </p>
  );
}

export function SectionHeader({ id, eyebrow, title, intro, aside, className = '' }: {
  /** Put on the heading so the section can be `aria-labelledby` it. */
  id: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  /** Right-hand slot on wide screens (a link, a note). */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={id} className="mt-4 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
          {title}
        </h2>
        {intro && <p className="mt-5 max-w-[60ch] text-(length:--step-0) leading-relaxed text-[var(--fg-muted)] md:text-(length:--step-1)">{intro}</p>}
      </div>
      {aside && <div className="md:justify-self-end">{aside}</div>}
    </div>
  );
}
