import Link from 'next/link';
import { t } from '@/i18n';
import { getSite, type NavItem, type SiteKey } from '@/sites/registry';

const linkCls = 'inline-flex min-h-11 items-center transition-colors duration-[var(--duration)] hover:text-[var(--accent)] md:min-h-0';

function NavLink({ site, item, className = linkCls }: { site: SiteKey; item: NavItem; className?: string }) {
  return item.external ? (
    <a href={item.href} rel="noopener" className={className}>
      {t(site, item.labelKey)}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {t(site, item.labelKey)}
    </Link>
  );
}

export function Nav({ site }: { site: SiteKey }) {
  const config = getSite(site);
  // The header button already carries the CTA, so its twin in the link list goes.
  const items = config.nav.filter((item) => item.href !== config.cta.href);
  const links = items.map((item) => (
    <li key={item.href}>
      <NavLink site={site} item={item} />
    </li>
  ));
  const ctaCls =
    'min-h-11 items-center justify-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-4 text-(length:--text-sm) font-medium text-[var(--accent-fg)] transition-opacity duration-[var(--duration)] hover:opacity-90 md:min-h-10';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] backdrop-blur-md backdrop-saturate-150">
      <div className="relative mx-auto flex w-full max-w-[var(--container)] items-center justify-between gap-3 px-5 py-2 sm:px-8 md:gap-[var(--space-6)] md:py-3">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-0 items-center gap-2.5 font-[family-name:var(--display-font)] text-(length:--text-lg) leading-none md:min-h-0"
        >
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span className="truncate">{config.name}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-[var(--space-6)]">
          <ul className="hidden items-center gap-x-[var(--space-6)] text-(length:--text-sm) text-[var(--fg-muted)] lg:flex">
            {links}
          </ul>
          <NavLink site={site} item={config.cta} className={`${ctaCls} hidden sm:inline-flex`} />
          {/* Native summary exposes its expanded state and supports Enter/Space without JavaScript. */}
          <details className="group lg:hidden">
            <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded px-2 text-(length:--text-sm) focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
              {t(site, 'nav.menu')}
              <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="absolute inset-x-0 top-full z-50 border-b border-[var(--border)] bg-[var(--surface)] px-5 pt-2 pb-5 shadow-[var(--shadow)] sm:px-8">
              <ul className="flex flex-col divide-y divide-[var(--border)] text-(length:--text-base)">{links}</ul>
              <NavLink site={site} item={config.cta} className={`${ctaCls} mt-4 flex w-full sm:hidden`} />
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
