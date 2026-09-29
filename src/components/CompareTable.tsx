import type { ReactNode } from 'react';
import { t } from '@/i18n';
import type { OfferRoute } from '@/lib/service-routes';
import type { SiteKey } from '@/sites/registry';
import { Fact } from './Fact';
import { FromPrice } from './FromPrice';
import { Band, SectionHeader } from './SectionKit';

const COLUMNS = ['alone', 'cheap', 'full'] as const;
type Column = (typeof COLUMNS)[number];

interface Row {
  id: string;
  /** One text per column, or one node across all three. */
  cells: Record<Column, ReactNode> | { shared: ReactNode };
}

/**
 * Doing it alone, a cheaper agent, or the full service, side by side (overhaul
 * plan §2). Every figure is a `<Fact>`: the government fee and the official
 * processing window are the same in all three columns, so they are one shared
 * row each; our own fee is the `pricing.*` fact for `route`, or the plain
 * "one fixed fee per route" line on a page that covers several routes. What a
 * cheaper agent does is stated as a question to ask, never as a claim.
 * Below `md` each row stacks and each cell carries its column name.
 */
export function CompareTable({ site, route, tone = 'default', id = 'compare' }: {
  site: SiteKey;
  route?: OfferRoute;
  tone?: 'default' | 'alt';
  id?: string;
}) {
  const rows: Row[] = [
    {
      id: 'fee',
      cells: {
        alone: t(site, 'compare.alone.fee'),
        cheap: t(site, 'compare.cheap.fee'),
        full: route ? <FromPrice site={site} route={route} /> : t(site, 'price.title'),
      },
    },
    {
      id: 'included',
      cells: { alone: t(site, 'compare.alone.included'), cheap: t(site, 'compare.cheap.included'), full: t(site, 'compare.full.included') },
    },
    {
      id: 'gov',
      cells: { shared: <>{t(site, 'compare.govShared')} <Fact k="fees.temporary_residency" site={site} /></> },
    },
    {
      id: 'time',
      cells: { shared: <>{t(site, 'compare.timeShared')} <Fact k="residency.timeline" site={site} /></> },
    },
    {
      id: 'risk',
      cells: { alone: t(site, 'compare.alone.risk'), cheap: t(site, 'compare.cheap.risk'), full: t(site, 'compare.full.risk') },
    },
  ];

  return (
    <Band tone={tone} id={id} labelledBy={`${id}-title`} data-compare-table>
      <SectionHeader id={`${id}-title`} eyebrow={t(site, 'compare.eyebrow')} title={t(site, 'compare.title')} intro={t(site, 'compare.intro')} />
      <table className="mt-12 w-full border-collapse text-left max-md:block md:mt-16">
        <thead className="max-md:sr-only">
          <tr>
            <td className="w-[18%]" />
            {COLUMNS.map((col) => (
              <th
                key={col}
                scope="col"
                className={`px-5 pb-4 align-bottom font-[family-name:var(--display-font)] text-(length:--step-1) font-normal leading-snug ${col === 'full' ? 'rounded-t-[var(--radius-brand)] bg-[var(--surface)] text-[var(--accent)]' : ''}`}
              >
                {t(site, `compare.col.${col}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-md:block">
          {rows.map((row) => (
            <tr key={row.id} data-row={row.id} className="border-t border-[var(--border)] max-md:mb-8 max-md:block">
              <th scope="row" className="px-0 py-5 align-top text-(length:--step--2) font-medium uppercase tracking-[.14em] text-[var(--fg-muted)] max-md:block max-md:pb-2 md:px-0 md:pr-5">
                {t(site, `compare.row.${row.id}`)}
              </th>
              {'shared' in row.cells ? (
                <td colSpan={3} className="py-5 align-top leading-relaxed max-md:block max-md:pt-0 md:px-5">
                  {row.cells.shared}
                </td>
              ) : (
                COLUMNS.map((col) => (
                  <td
                    key={col}
                    className={`px-0 py-3 align-top leading-relaxed max-md:block max-md:py-2 md:px-5 md:py-5 ${col === 'full' ? 'bg-[var(--surface)] font-medium max-md:rounded-[var(--radius-brand)] max-md:px-4' : 'text-[var(--fg-muted)]'}`}
                  >
                    <span className="mb-1 block text-(length:--step--2) uppercase tracking-[.12em] text-[var(--fg-muted)] md:hidden">{t(site, `compare.col.${col}`)}</span>
                    {(row.cells as Record<Column, ReactNode>)[col]}
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Band>
  );
}
