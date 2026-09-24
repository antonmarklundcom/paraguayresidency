import Link from 'next/link';

export interface Step { title: string; body: string }

/** Numbered, horizontal "how it runs" row. Copy only: no durations or figures here. */
export function Steps({ title, intro, steps, link, tone = 'default' }: {
  title: string; intro?: string; steps: Step[]; link?: { href: string; label: string };
  tone?: 'default' | 'alt';
}) {
  return (
    <section className={`py-16 md:py-24 ${tone === 'alt' ? 'bg-[var(--surface-alt)]' : 'bg-[var(--bg)]'}`}>
      <div className="mx-auto max-w-[var(--container)] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 className="max-w-xl font-[family-name:var(--display-font)] text-(length:--text-2xl) leading-[var(--leading-tight)] text-balance sm:text-(length:--text-3xl)">{title}</h2>
          {intro && <p className="max-w-md text-[var(--fg-muted)]">{intro}</p>}
        </div>
        <ol className={`mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 ${steps.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-[var(--accent)] pt-5">
              <span aria-hidden="true" className="font-[family-name:var(--display-font)] text-(length:--text-3xl) leading-none text-[var(--accent)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-(length:--text-lg) font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 text-[var(--fg-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>
        {link && (
          <Link href={link.href} className="mt-10 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline">
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}
