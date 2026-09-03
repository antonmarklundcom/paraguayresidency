import Link from 'next/link';
import { t } from '@/i18n';
import { getSite, type SiteKey } from '@/sites/registry';

export function Nav({ site }: { site: SiteKey }) {
  const config = getSite(site);
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-[var(--container)] items-center justify-between gap-[var(--space-6)] px-5 py-[var(--space-4)] sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--display-font)] text-[var(--text-lg)] leading-none"
        >
          {config.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-[var(--space-6)] gap-y-[var(--space-2)] text-[var(--text-sm)]">
            {config.nav.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href} rel="noopener" className="hover:text-[var(--accent)]">
                    {t(site, item.labelKey)}
                  </a>
                ) : (
                  <Link href={item.href} className="hover:text-[var(--accent)]">
                    {t(site, item.labelKey)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
