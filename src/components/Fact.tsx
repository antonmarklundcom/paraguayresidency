import { factKeys, facts, localized, type FactKey } from '@content/shared/facts';
import { getSite, type SiteKey } from '@/sites/registry';
import { t } from '@/i18n';

/**
 * The ONLY way a legal or financial figure reaches a page (plan §1.10).
 * While a fact is unverified it renders hedged wording, marked up so the
 * launch review (F7) can find every one of them.
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
  const fact = facts[k];
  if (!fact) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `Unknown fact key "${k}". Known keys: ${factKeys.join(', ')}. Add it to content/shared/facts.ts.`,
      );
    }
    return null;
  }
  const locale = site ? getSite(site).locale : 'en';
  return (
    <span
      data-fact={fact.key}
      data-verified={fact.verified ? 'true' : 'false'}
      title={fact.verified ? undefined : t(site ?? 'residency', 'common.unverifiedFact')}
      className={className}
    >
      {localized(fact.verified ? fact.display : fact.hedged, locale)}
    </span>
  );
}
