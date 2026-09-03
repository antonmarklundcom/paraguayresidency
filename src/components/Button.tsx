import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-brand)] px-5 py-3 text-[var(--text-sm)] font-medium transition-[background-color,color,border-color] duration-[var(--duration)] ease-[var(--ease)]';

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90',
  secondary:
    'border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)]',
  ghost: 'text-[var(--fg)] underline underline-offset-4 hover:text-[var(--accent)]',
};

export function Button({
  children,
  href,
  variant = 'primary',
  external,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  external?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (!href) {
    return (
      <button type={type} className={cls}>
        {children}
      </button>
    );
  }
  if (external) {
    return (
      <a href={href} className={cls} rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
