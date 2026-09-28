/* eslint-disable @next/next/no-img-element -- Local team portraits with fixed dimensions. */
import type { ReactNode } from 'react';
import { PROOF, type Proof } from '@content/shared/proof';
import { intlLocaleFor, t } from '@/i18n';
import { TEAM } from '@/content/team';
import type { SiteKey } from '@/sites/registry';

/**
 * The proof strip that sits directly under a hero (overhaul plan §2, §3):
 * the team's faces, residencies filed, the Google rating and years in
 * business. Every item comes from `content/shared/proof.ts` and shows only
 * when its value is real; with nothing filled in, the bar renders nothing.
 */
export function TrustBar({ site, proof = PROOF }: { site: SiteKey; proof?: Proof }) {
  const number = new Intl.NumberFormat(intlLocaleFor(site));
  const rating = new Intl.NumberFormat(intlLocaleFor(site), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const { residenciesFiled, yearsInBusiness, googleRating } = proof.stats;
  const faces = proof.team.filter((member) => member.photo);

  const items: { key: string; node: ReactNode }[] = [];

  if (faces.length) {
    items.push({
      key: 'faces',
      node: (
        <div className="flex items-center gap-4">
          <ul className="flex -space-x-3">
            {faces.map((member) => (
              <li key={member.key}>
                <img
                  src={member.photo!.src}
                  width={member.photo!.width}
                  height={member.photo!.height}
                  alt={t(site, 'team.photoAlt', { name: TEAM[member.key].name })}
                  loading="lazy"
                  decoding="async"
                  className="size-12 rounded-full border-2 border-[var(--surface)] object-cover shadow-[var(--elev-1)]"
                />
              </li>
            ))}
          </ul>
          <p className="max-w-[22ch] text-(length:--step--1) leading-snug text-[var(--fg-muted)]">{t(site, 'team.promise')}</p>
        </div>
      ),
    });
  }

  if (residenciesFiled) {
    items.push({ key: 'filed', node: <Stat template={t(site, 'trust.filed')} value={number.format(residenciesFiled)} /> });
  }

  if (googleRating) {
    const value = rating.format(googleRating.rating);
    const count = number.format(googleRating.count);
    items.push({
      key: 'rating',
      node: (
        <a
          href={googleRating.url}
          rel="noopener"
          target="_blank"
          className="group flex flex-col gap-1 underline-offset-4"
        >
          <span aria-hidden="true" className="flex items-baseline gap-2">
            <span aria-hidden="true" className="text-(length:--step-2) leading-none text-[var(--accent)]">★</span>
            <span className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-none">{value}</span>
          </span>
          <span className="text-(length:--step--1) text-[var(--fg-muted)] group-hover:underline">
            {t(site, 'trust.rating', { rating: value })} · {t(site, 'trust.ratingCount', { count })}
          </span>
        </a>
      ),
    });
  }

  if (yearsInBusiness) {
    items.push({ key: 'years', node: <Stat template={t(site, 'trust.years')} value={number.format(yearsInBusiness)} /> });
  }

  if (items.length === 0) return null;

  return (
    <section data-trust-bar aria-label={t(site, 'trust.label')} className="border-b border-[var(--border)] bg-[var(--surface)]">
      <ul className="mx-auto grid w-full max-w-[var(--container)] grid-cols-2 gap-x-8 gap-y-6 px-[var(--space-gutter)] py-8 md:py-10 lg:flex lg:items-center lg:justify-between">
        {items.map((item, index) => (
          <li key={item.key} className={`min-w-0 ${item.key === 'faces' ? 'col-span-2' : ''} ${index > 0 ? 'lg:border-l lg:border-[var(--border)] lg:pl-10' : ''}`}>
            {item.node}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "{count} residencies filed" with the number set large, in any word order. */
function Stat({ template, value }: { template: string; value: string }) {
  const [before, after = ''] = template.split('{count}');
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-(length:--step--1) text-[var(--fg-muted)]">
      {before.trim() && <span>{before.trim()}</span>}
      <span className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-none text-[var(--fg)]">{value}</span>
      {after.trim() && <span>{after.trim()}</span>}
    </p>
  );
}
