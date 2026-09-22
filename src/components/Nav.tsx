import Link from 'next/link';
import { t } from '@/i18n';
import { getSite, type SiteKey } from '@/sites/registry';

export function Nav({ site }: { site: SiteKey }) {
  const config = getSite(site);
  const links = config.nav.map((item) => (
    <li key={item.href}>
      {item.external ? (
        <a href={item.href} rel="noopener" className="inline-flex min-h-11 items-center hover:text-[var(--accent)] sm:min-h-0">
          {t(site, item.labelKey)}
        </a>
      ) : (
        <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-[var(--accent)] sm:min-h-0">
          {t(site, item.labelKey)}
        </Link>
      )}
    </li>
  ));
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="relative mx-auto flex w-full max-w-[var(--container)] items-center justify-between gap-3 px-5 py-3 sm:px-8 md:gap-[var(--space-6)] md:py-[var(--space-4)]">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-0 items-center font-[family-name:var(--display-font)] text-(length:--text-lg) leading-none sm:min-h-0"
        >
          {config.name}
        </Link>
        <nav aria-label="Main">
          {/* Native summary exposes its expanded state and supports Enter/Space without JavaScript. */}
          <details className="group md:hidden">
            <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded px-2 text-(length:--text-sm) focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
              {t(site, 'nav.menu')}
              <span aria-hidden="true" className="group-open:rotate-180">⌄</span>
            </summary>
            <ul className="absolute inset-x-0 top-full z-50 flex flex-col border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-(length:--text-sm) shadow-[var(--shadow-sm)] sm:gap-3 sm:px-8">
              {links}
            </ul>
          </details>
          <ul className="hidden flex-wrap items-center gap-x-[var(--space-6)] gap-y-[var(--space-2)] text-(length:--text-sm) md:flex">
            {links}
          </ul>
        </nav>
      </div>
    </header>
  );
}
