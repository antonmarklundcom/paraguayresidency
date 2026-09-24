import Link from 'next/link';
import { t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';

export interface ArticleCard { title: string; description?: string; href: string; eyebrow?: string }

export function ArticleCards({ site, title, articles, more, tone = 'default' }: {
  site: SiteKey; title: string; articles: ArticleCard[]; more?: { href: string; label: string };
  tone?: 'default' | 'alt';
}) {
  if (articles.length === 0) return null;
  return (
    <section className={`py-16 md:py-24 ${tone === 'alt' ? 'bg-[var(--surface-alt)]' : 'bg-[var(--bg)]'}`}>
      <div className="mx-auto max-w-[var(--container)] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--display-font)] text-(length:--text-2xl) leading-[var(--leading-tight)] sm:text-(length:--text-3xl)">{title}</h2>
          {more && (
            <Link href={more.href} className="inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline">
              {more.label} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.href} className="min-w-0">
              <Link href={article.href} className="group flex h-full flex-col rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-[border-color,box-shadow] duration-[var(--duration)] hover:border-[var(--accent)] hover:shadow-[var(--shadow)]">
                {article.eyebrow && <span className="mb-3 text-(length:--text-xs) font-medium uppercase tracking-[.16em] text-[var(--accent)]">{article.eyebrow}</span>}
                <span className="font-[family-name:var(--display-font)] text-(length:--text-xl) leading-[var(--leading-tight)] text-balance">{article.title}</span>
                {article.description && <span className="mt-3 line-clamp-3 text-(length:--text-sm) text-[var(--fg-muted)]">{article.description}</span>}
                <span className="mt-auto flex items-center gap-2 pt-6 text-(length:--text-sm) font-medium text-[var(--accent)]">
                  {t(site, 'articles.read')} <span aria-hidden="true" className="transition-transform duration-[var(--duration)] group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
