import { facts, type Fact } from '@content/shared/facts';
import { intlLocaleFor } from '@/i18n';
import type { SiteKey } from '@/sites/registry';

/**
 * The latest `sourced.checkedOn` across every `investorpass.*` fact, formatted
 * in the brand's locale. Computed when the page is built, so the date on the
 * memo strip moves only when someone re-checks a rule in content/shared/facts.ts.
 * Null when no fact carries a source date (the strip then says so in words).
 */
export function rulesLastReviewed(site: SiteKey): string | null {
  let latest = '';
  for (const fact of Object.values(facts) as Fact[]) {
    if (!fact.key.startsWith('investorpass.')) continue;
    const checked = fact.sourced?.checkedOn;
    if (checked && checked > latest) latest = checked;
  }
  if (!latest) return null;
  const date = new Date(`${latest}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(intlLocaleFor(site), { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}
