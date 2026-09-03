import type { ElementType, ReactNode } from 'react';

type Width = 'default' | 'narrow' | 'wide';

const widths: Record<Width, string> = {
  default: 'max-w-[var(--container)]',
  narrow: 'max-w-[var(--container-narrow)]',
  wide: 'max-w-none',
};

export function Container({
  children,
  width = 'default',
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={`mx-auto w-full px-5 sm:px-8 ${widths[width]} ${className}`}>{children}</Tag>
  );
}

export function Section({
  children,
  id,
  tone = 'default',
  className = '',
  width,
}: {
  children: ReactNode;
  id?: string;
  tone?: 'default' | 'alt' | 'accent';
  className?: string;
  width?: Width;
}) {
  const tones = {
    default: 'bg-[var(--bg)]',
    alt: 'bg-[var(--surface-alt)]',
    accent: 'bg-[var(--accent-soft)]',
  } as const;
  return (
    <section id={id} className={`py-[var(--space-16)] ${tones[tone]} ${className}`}>
      <Container width={width}>{children}</Container>
    </section>
  );
}

const headingSizes = {
  1: 'text-[var(--text-4xl)]',
  2: 'text-[var(--text-3xl)]',
  3: 'text-[var(--text-xl)]',
  4: 'text-[var(--text-lg)]',
} as const;

export function Heading({
  level = 2,
  children,
  className = '',
  id,
}: {
  level?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const Tag = `h${level}` as ElementType;
  return (
    <Tag
      id={id}
      className={`font-[family-name:var(--display-font)] leading-[var(--leading-tight)] tracking-[-0.01em] text-balance ${headingSizes[level]} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-[var(--measure)] [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-[var(--space-12)] [&_h2]:mb-[var(--space-4)] [&_h2]:font-[family-name:var(--display-font)] [&_h2]:text-[var(--text-2xl)] [&_h2]:leading-[var(--leading-tight)] [&_h3]:mt-[var(--space-8)] [&_h3]:mb-[var(--space-3)] [&_h3]:text-[var(--text-lg)] [&_li]:my-[var(--space-2)] [&_ol]:my-[var(--space-4)] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-[var(--space-4)] [&_ul]:my-[var(--space-4)] [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
    >
      {children}
    </div>
  );
}
