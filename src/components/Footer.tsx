import Link from 'next/link';
import { t } from '@/i18n';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';

export function Footer({ site }: { site: SiteKey }) {
  const config = getSite(site);
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] py-[var(--space-12)] text-[var(--text-sm)]">
      <div className="mx-auto w-full max-w-[var(--container)] px-5 sm:px-8">
        <div className="grid gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
              {config.name}
            </p>
            <p className="mt-[var(--space-2)] max-w-[36ch] text-[var(--fg-muted)]">
              {t(site, config.tagline)}
            </p>
          </div>

          {config.footer.columns.map((column) => (
            <div key={column.titleKey}>
              <p className="text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
                {t(site, column.titleKey)}
              </p>
              <ul className="mt-[var(--space-3)] space-y-[var(--space-2)]">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-[var(--accent)]">
                      {t(site, item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Cross-brand links — the funnel only works if every brand points
              at the other two (plan §1.2). */}
          <div>
            <p className="text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
              {t(site, 'footer.siblings')}
            </p>
            <ul className="mt-[var(--space-3)] space-y-[var(--space-2)]">
              {config.siblings.map((key) => (
                <li key={key}>
                  <a href={siteOrigin(key)} rel="noopener" className="hover:text-[var(--accent)]">
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
                <Link href={item.href} className="hover:text-[var(--accent)]">
                  {t(site, item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-[var(--text-xs)] text-[var(--fg-muted)]">
          {t(site, 'footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
