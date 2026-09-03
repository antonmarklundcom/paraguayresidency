import Link from 'next/link';
import type { ReactNode } from 'react';
import { Heading } from './primitives';

export function Card({
  title,
  eyebrow,
  href,
  children,
  className = '',
}: {
  title?: string;
  eyebrow?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      {eyebrow && (
        <p className="mb-[var(--space-2)] text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
          {eyebrow}
        </p>
      )}
      {title && <Heading level={3}>{title}</Heading>}
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
      className={`grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3 [&>*:first-child]:lg:col-span-2 [&>*:first-child]:lg:row-span-2 ${className}`}
    >
      {children}
    </div>
  );
}
