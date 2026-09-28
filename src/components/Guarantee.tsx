import Link from 'next/link';
import { PROOF, type Proof } from '@content/shared/proof';
import { localeFor, t } from '@/i18n';
import { siteSellsProducts, type SiteKey } from '@/sites/registry';
import { Eyebrow } from './SectionKit';

/**
 * The guarantee band (overhaul plan §2).
 *
 * Service brands: the wording in `proof.guarantee`, which is Anton's decision;
 * with no wording there, nothing renders. The guide (the brand that sells):
 * the already-approved "14-day refund, no questions" (plan §11.3), the same
 * promise as its /refunds page.
 */
export function Guarantee({ site, proof = PROOF, tone = 'default' }: { site: SiteKey; proof?: Proof; tone?: 'default' | 'alt' }) {
  const isGuide = siteSellsProducts(site);
  const service = proof.guarantee?.[localeFor(site)];
  if (!isGuide && !service) return null;

  return (
    <section data-guarantee aria-labelledby="guarantee-title" className={`py-[var(--space-section)] ${tone === 'alt' ? 'bg-[var(--surface-alt)]' : 'bg-[var(--bg)]'}`}>
      <div className="mx-auto w-full max-w-[var(--container-narrow)] px-[var(--space-gutter)]">
        <div className="relative rounded-[var(--radius-brand)] bg-[var(--surface)] px-7 py-10 text-center shadow-[var(--elev-0)] sm:px-12 sm:py-14">
          <span aria-hidden="true" className="absolute inset-x-12 top-0 h-[2px] bg-[var(--accent)]" />
          <Seal />
          <Eyebrow className="mt-6 justify-center">{t(site, 'guarantee.eyebrow')}</Eyebrow>
          {isGuide ? (
            <>
              <h2 id="guarantee-title" className="mt-4 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
                {t(site, 'guideOffer.refundTitle')}
              </h2>
              <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-[var(--fg-muted)]">{t(site, 'guideOffer.refundBody')}</p>
              <Link href="/refunds" className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                {t(site, 'guideOffer.refundLink')} <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <p id="guarantee-title" className="mx-auto mt-4 max-w-[40ch] font-[family-name:var(--display-font)] text-(length:--step-3) leading-snug text-balance">
              {service}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** A quiet line-drawn seal: two hairline rings and a check, in the accent. */
function Seal() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="mx-auto size-12 text-[var(--accent)]" fill="none" stroke="currentColor">
      <circle cx="24" cy="24" r="22" strokeWidth="1" />
      <circle cx="24" cy="24" r="17.5" strokeWidth="1" strokeDasharray="1.5 2.5" />
      <path d="M16.5 24.5l5 5 10-11" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
