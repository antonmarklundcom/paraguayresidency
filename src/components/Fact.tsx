import { factKeys, factPublished, facts, localized, type Fact as FactEntry, type FactKey } from '@content/shared/facts';
import { getSite, type SiteKey } from '@/sites/registry';
import { t } from '@/i18n';

/**
 * The ONLY way a legal or financial figure reaches a page (plan §1.10).
 * A fact renders its figure once it is verified or carries a cited source
 * (`sourced`, decided 2026-09-26); otherwise it renders hedged wording. Every
 * state is marked up (`data-verified` = true | sourced | false) so a review
 * can find them.
 *
 * `site` picks the brand's locale (plan §5.4.2). It is optional so the three
 * English brands read unchanged; omitting it on a non-English brand renders
 * the English sentence, which is the deliberate fallback for facts — see
 * `LocalizedText` in `content/shared/facts.ts`.
 */
export function Fact({
  k,
  site,
  className = '',
}: {
  k: FactKey;
  site?: SiteKey;
  className?: string;
}) {
  const fact = facts[k] as FactEntry | undefined;
  if (!fact) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `Unknown fact key "${k}". Known keys: ${factKeys.join(', ')}. Add it to content/shared/facts.ts.`,
      );
    }
    return null;
  }
  const locale = site ? getSite(site).locale : 'en';
  const brand = site ?? 'residency';
  const state = fact.verified ? 'true' : fact.sourced ? 'sourced' : 'false';
  const title = fact.verified
    ? undefined
    : fact.sourced
      ? t(brand, 'fact.sourceTitle', {
          source: localized(fact.sourced.label, locale),
          date: fact.sourced.checkedOn,
        })
      : t(brand, 'common.unverifiedFact');
  return (
    <span data-fact={fact.key} data-verified={state} title={title} className={className}>
      {localized(factPublished(fact) ? fact.display : fact.hedged, locale)}
    </span>
  );
}
