import { PROOF, type Proof, type Review, type ReviewRoute } from '@content/shared/proof';
import { intlLocaleFor, localeFor, t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';
import { Band, SectionHeader } from './SectionKit';

/** Route → the nav label every locale already has. */
const ROUTE_LABEL: Record<ReviewRoute, string> = {
  temporary: 'nav.temporary',
  permanent: 'nav.permanent',
  cedula: 'nav.cedula',
  investor_pass: 'nav.investorPass',
  mercosur: 'nav.mercosur',
  tax_residency: 'nav.taxResidency',
  family: 'nav.family',
};

/** 'GB' → 🇬🇧 (regional indicator symbols). */
export function flagEmoji(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

interface Shown {
  review: Review;
  quote: string;
  /** Set when the quote is Anton's approved translation, not the original. */
  translatedFrom?: string;
}

/**
 * The reviews a brand can show: those written in its language, plus those
 * with an approved translation into it (marked "Translated from …"). Nothing
 * is translated at runtime, so no text is ever invented. Newest first.
 */
export function reviewsFor(site: SiteKey, proof: Proof = PROOF): Shown[] {
  const locale = localeFor(site);
  const languages = new Intl.DisplayNames([intlLocaleFor(site)], { type: 'language' });
  return proof.reviews
    .filter((review) => review.permission === true)
    .flatMap((review): Shown[] => {
      if (review.locale === locale) return [{ review, quote: review.quote }];
      const translation = review.translations?.[locale];
      return translation ? [{ review, quote: translation, translatedFrom: languages.of(review.locale) }] : [];
    })
    .sort((a, b) => b.review.month.localeCompare(a.review.month));
}

/**
 * Real client reviews, from `content/shared/proof.ts` only (overhaul plan
 * §2). Quote, first name + initial, flag, route, month and where it was
 * written. Renders nothing until a review with permission exists.
 */
export function Testimonials({ site, proof = PROOF, limit = 3, tone = 'default' }: {
  site: SiteKey; proof?: Proof; limit?: number; tone?: 'default' | 'alt';
}) {
  const shown = reviewsFor(site, proof).slice(0, limit);
  if (shown.length === 0) return null;
  const intl = intlLocaleFor(site);
  const months = new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const regions = new Intl.DisplayNames([intl], { type: 'region' });
  const single = shown.length === 1;

  return (
    <Band tone={tone} labelledBy="reviews-title" data-testimonials>
      <SectionHeader id="reviews-title" eyebrow={t(site, 'reviews.eyebrow')} title={t(site, 'reviews.title')} />
      <ul className={`mt-12 grid gap-5 md:mt-16 ${single ? '' : shown.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {shown.map(({ review, quote, translatedFrom }) => {
          const country = regions.of(review.countryCode.toUpperCase()) ?? review.countryCode;
          const month = months.format(new Date(`${review.month}-01T00:00:00Z`));
          return (
            <li key={`${review.name}-${review.month}-${review.route}`} className="min-w-0">
              <figure className={`flex h-full flex-col rounded-[var(--radius-brand)] bg-[var(--surface)] p-7 shadow-[var(--elev-0)] md:p-9 ${single ? 'md:px-16 md:py-14' : ''}`}>
                <span aria-hidden="true" className="font-[family-name:var(--display-font)] text-(length:--step-6) leading-[.6] text-[var(--accent)]">“</span>
                <blockquote
                  lang={translatedFrom ? undefined : review.locale}
                  className={`mt-2 flex-1 font-[family-name:var(--display-font)] leading-snug text-pretty ${single ? 'text-(length:--step-3)' : 'text-(length:--step-1)'}`}
                >
                  <p>{quote}</p>
                </blockquote>
                <figcaption className="mt-8 border-t border-[var(--border)] pt-5 text-(length:--step--1)">
                  <p className="flex items-center gap-2 font-medium text-[var(--fg)]">
                    <span role="img" aria-label={country} title={country} className="text-(length:--step-1) leading-none">{flagEmoji(review.countryCode)}</span>
                    {review.name}
                  </p>
                  <p className="mt-1 text-[var(--fg-muted)]">
                    {t(site, ROUTE_LABEL[review.route])} · <time dateTime={review.month}>{month}</time>
                  </p>
                  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-(length:--step--2) uppercase tracking-[.12em] text-[var(--fg-muted)]">
                    {review.url ? (
                      <a href={review.url} rel="noopener" target="_blank" className="text-[var(--accent)] underline-offset-4 hover:underline">
                        {t(site, `reviews.source.${review.source}`)} · {t(site, 'reviews.original')}
                      </a>
                    ) : (
                      <span>{t(site, `reviews.source.${review.source}`)}</span>
                    )}
                    {translatedFrom && <span>{t(site, 'reviews.translatedFrom', { language: translatedFrom })}</span>}
                  </p>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
