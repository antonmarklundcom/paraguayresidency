import Link from 'next/link';
import { t } from '@/i18n';
import { siteOrigin, type SiteKey } from '@/sites/registry';
import { JsonLd } from './JsonLd';

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ site, items }: { site: SiteKey; items: Crumb[] }) {
  const all: Crumb[] = [{ label: t(site, 'common.breadcrumbHome'), href: '/' }, ...items];
  const origin = siteOrigin(site);
  return (
    <nav aria-label="Breadcrumb" className="text-[var(--text-sm)] text-[var(--fg-muted)]">
      <ol className="flex flex-wrap items-center gap-x-2">
        {all.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === all.length - 1 ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-[var(--accent)]">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: crumb.label,
            item: `${origin}${crumb.href === '/' ? '' : crumb.href}`,
          })),
        }}
      />
    </nav>
  );
}
