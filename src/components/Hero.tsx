import type { ReactNode } from 'react';
import { Container, Heading } from './primitives';

/** Hub pattern: split-screen, image/aside on the right (plan §1.8). */
export function SplitHero({
  title,
  sub,
  actions,
  aside,
  eyebrow,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className="bg-[image:var(--hero-pattern)] py-[var(--space-24)]">
      <Container>
        <div className="grid items-center gap-[var(--space-12)] lg:grid-cols-2">
          <div>
            {eyebrow && (
              <p className="mb-[var(--space-4)] text-[var(--text-xs)] tracking-[0.16em] text-[var(--fg-muted)] uppercase">
                {eyebrow}
              </p>
            )}
            <Heading level={1}>{title}</Heading>
            {sub && (
              <p className="mt-[var(--space-6)] max-w-[52ch] text-[var(--text-lg)] text-[var(--fg-muted)]">
                {sub}
              </p>
            )}
            {actions && (
              <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
                {actions}
              </div>
            )}
          </div>
          <div className="min-h-[220px] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-8)]">
            {aside}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Investor Pass pattern: centred big-type editorial, dark-first. */
export function EditorialHero({
  title,
  sub,
  actions,
  eyebrow,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className="bg-[image:var(--hero-pattern)] py-[var(--space-24)] text-center">
      <Container width="narrow">
        {eyebrow && (
          <p className="mb-[var(--space-6)] text-[var(--text-xs)] tracking-[0.22em] text-[var(--accent)] uppercase">
            {eyebrow}
          </p>
        )}
        <Heading level={1}>{title}</Heading>
        {sub && (
          <p className="mx-auto mt-[var(--space-6)] max-w-[48ch] text-[var(--text-lg)] text-[var(--fg-muted)]">
            {sub}
          </p>
        )}
        {actions && (
          <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)]">
            {actions}
          </div>
        )}
      </Container>
    </section>
  );
}
