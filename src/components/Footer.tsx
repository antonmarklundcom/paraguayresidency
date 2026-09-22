import Link from 'next/link';
import { t } from '@/i18n';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';

export function Footer({ site }: { site: SiteKey }) {
  const config = getSite(site);
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] py-[var(--space-12)] text-(length:--text-sm)">
      <div className="mx-auto w-full max-w-[var(--container)] px-5 sm:px-8">
        <div className="grid gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-[family-name:var(--display-font)] text-(length:--text-lg)">
              {config.name}
            </p>
            <p className="mt-[var(--space-2)] max-w-[36ch] text-[var(--fg-muted)]">
              {t(site, config.tagline)}
            </p>
          </div>

          {config.footer.columns.map((column) => (
            <div key={column.titleKey}>
              <p className="text-(length:--text-xs) tracking-[0.14em] text-[var(--fg-muted)] uppercase">
                {t(site, column.titleKey)}
              </p>
              <ul className="mt-[var(--space-3)] space-y-1 sm:space-y-[var(--space-2)]">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-[var(--accent)] sm:min-h-0">
                      {t(site, item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Cross-brand links from the site registry. */}
          <div>
            <p className="text-(length:--text-xs) tracking-[0.14em] text-[var(--fg-muted)] uppercase">
              {t(site, 'footer.siblings')}
            </p>
            <ul className="mt-[var(--space-3)] space-y-1 sm:space-y-[var(--space-2)]">
              {config.siblings.map((key) => (
                <li key={key}>
                  <a href={siteOrigin(key)} lang={getSite(key).locale} className="inline-flex min-h-11 items-center hover:text-[var(--accent)] sm:min-h-0">
                    {getSite(key).name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-[var(--space-12)] flex flex-wrap items-center justify-between gap-[var(--space-4)] border-t border-[var(--border)] pt-[var(--space-6)] text-[var(--fg-muted)]">
          <p>
            © {year} {config.name}. {t(site, 'footer.rights')}
          </p>
          <ul className="flex gap-[var(--space-4)]">
            {config.footer.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-[var(--accent)] sm:min-h-0">
                  {t(site, item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-(length:--text-xs) text-[var(--fg-muted)]">
          {t(site, 'footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
