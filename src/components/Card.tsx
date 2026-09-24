import Link from 'next/link';
import type { ReactNode } from 'react';

export function Card({
  title,
  eyebrow,
  href,
  children,
  className = '',
  headingLevel = 3,
}: {
  headingLevel?: 2 | 3 | 4;
  title?: string;
  eyebrow?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Title = `h${headingLevel}` as const;
  const body = (
    <>
      {eyebrow && (
        <p className="mb-[var(--space-2)] text-(length:--text-xs) tracking-[0.14em] text-[var(--fg-muted)] uppercase">
          {eyebrow}
        </p>
      )}
      {title && <Title className="font-[family-name:var(--display-font)] leading-[var(--leading-tight)] text-balance [overflow-wrap:anywhere] text-(length:--text-xl)">{title}</Title>}
      {children && <div className="mt-[var(--space-3)] text-[var(--fg-muted)]">{children}</div>}
    </>
  );

  const cls = `block h-full rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)] shadow-[var(--shadow-sm)] ${
    href ? 'transition-colors duration-[var(--duration)] hover:border-[var(--accent)]' : ''
  } ${className}`;

  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Asymmetric grid used for the hub's "routes" section (plan §1.8). */
export function Bento({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid gap-[var(--space-4)] auto-rows-fr sm:grid-cols-2 lg:grid-cols-3 [&:has(>:nth-child(4):last-child)]:lg:grid-cols-2 ${className}`}
    >
      {children}
    </div>
  );
}
