import { PROOF, type CaseSnapshot, type Proof, type ReviewRoute } from '@content/shared/proof';
import { intlLocaleFor, localeFor, t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';
import { Band, SectionHeader } from './SectionKit';
import { flagEmoji } from './Testimonials';

const ROUTE_LABEL: Record<ReviewRoute, string> = {
  temporary: 'nav.temporary',
  permanent: 'nav.permanent',
  cedula: 'nav.cedula',
  investor_pass: 'nav.investorPass',
  mercosur: 'nav.mercosur',
  tax_residency: 'nav.taxResidency',
  family: 'nav.family',
};

/** Cases a brand can show: only those with an outcome sentence in its own language, newest first. */
export function casesFor(site: SiteKey, proof: Proof = PROOF): { item: CaseSnapshot; outcome: string }[] {
  const locale = localeFor(site);
  return (proof.cases ?? [])
    .filter((item) => item.permission === true && Number.isFinite(item.weeks) && item.weeks > 0)
    .flatMap((item) => {
      const outcome = item.outcome[locale]?.trim();
      return outcome ? [{ item, outcome }] : [];
    })
    .sort((a, b) => b.item.month.localeCompare(a.item.month));
}

/**
 * Anonymous case snapshots from `proof.cases` (nationality, route, weeks,
 * outcome). Renders nothing until a case with permission and an outcome in the
 * brand's language exists, so it can sit on any page without leaving a gap.
 */
export function CaseSnapshots({ site, proof = PROOF, limit = 3, tone = 'default' }: {
  site: SiteKey; proof?: Proof; limit?: number; tone?: 'default' | 'alt';
}) {
  const shown = casesFor(site, proof).slice(0, limit);
  if (shown.length === 0) return null;
  const intl = intlLocaleFor(site);
  const regions = new Intl.DisplayNames([intl], { type: 'region' });
  const weeks = new Intl.NumberFormat(intl, { style: 'unit', unit: 'week', unitDisplay: 'long' });

  return (
    <Band tone={tone} labelledBy="cases-title" data-case-snapshots>
      <SectionHeader id="cases-title" eyebrow={t(site, 'cases.eyebrow')} title={t(site, 'cases.title')} />
      <ul className={`mt-12 grid gap-5 md:mt-16 ${shown.length === 1 ? '' : shown.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {shown.map(({ item, outcome }) => {
          const country = regions.of(item.countryCode.toUpperCase()) ?? item.countryCode;
          return (
            <li key={`${item.countryCode}-${item.route}-${item.month}`} className="min-w-0 rounded-[var(--radius-brand)] bg-[var(--surface)] p-7 shadow-[var(--elev-0)] md:p-9">
              <p className="flex items-center gap-2 font-medium text-[var(--fg)]">
                <span role="img" aria-label={country} title={country} className="text-(length:--step-1) leading-none">{flagEmoji(item.countryCode)}</span>
                {t(site, 'cases.from', { country })}
              </p>
              <p className="mt-1 text-(length:--step--1) text-[var(--fg-muted)]">{t(site, ROUTE_LABEL[item.route])}</p>
              <p className="mt-6 font-[family-name:var(--display-font)] text-(length:--step-3) leading-none text-[var(--accent)]">
                {t(site, 'cases.duration', { duration: weeks.format(item.weeks) })}
              </p>
              <p className="mt-6 border-t border-[var(--border)] pt-4 text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]">{t(site, 'cases.outcome')}</p>
              <p className="mt-1.5 leading-relaxed text-pretty">{outcome}</p>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
