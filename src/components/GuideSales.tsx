import { t } from '@/i18n';
import { siteOrigin, type SiteKey } from '@/sites/registry';
import { Band, Eyebrow, SectionHeader } from './SectionKit';

/**
 * The guide's long-form sales page parts (overhaul plan §2, §3): the book
 * itself, the table of contents, sample pages, who it is for, and the
 * "want it done for you?" band. Copy is i18n; the sample passages are short
 * extracts of `content/guide/members/*.mdx` and carry no figures.
 */

/** Cover art from W3. Until the file lands the cover shows the brand colour. */
export const GUIDE_COVER = '/images/arrival/guide-cover-art-river-topography-1200.webp';
/** The same art as AVIF, 600 wide for 1x screens and 1200 for 2x: about a fifth of the WebP on a desktop, under two thirds on a phone. */
const GUIDE_COVER_SET = 'image-set(url(/images/arrival/guide-cover-art-river-topography-600.avif) type("image/avif") 1x, url(/images/arrival/guide-cover-art-river-topography-1200.avif) type("image/avif") 2x)';

/**
 * The product, drawn in CSS: a 3D book with a spine hinge, page edges and a
 * soft floor shadow. The title is real HTML text on the cover, so it stays
 * sharp, translatable and costs no image request of its own.
 */
export function BookMockup({ site, className = '' }: { site: SiteKey; className?: string }) {
  return (
    <figure role="img" aria-label={t(site, 'guideBook.aria')} data-book-mockup className={`relative mx-auto w-full max-w-[17rem] [perspective:1800px] sm:max-w-[19rem] lg:max-w-[21rem] ${className}`}>
      <div className="relative aspect-[5/7] [transform-style:preserve-3d] [transform:rotateY(-26deg)_rotateX(6deg)] transition-transform duration-[var(--dur-4)] ease-[var(--ease-out)] motion-safe:hover:[transform:rotateY(-14deg)_rotateX(3deg)]">
        {/* Back board. */}
        <div className="absolute inset-0 rounded-[3px_8px_8px_3px] bg-[color-mix(in_srgb,var(--accent)_70%,black)] [transform:translateZ(-14px)]" />
        {/* Page block: the fore-edge, seen on the right as the book turns. */}
        <div className="absolute top-[1.5%] bottom-[1.5%] left-[calc(100%-14px)] w-[28px] bg-[repeating-linear-gradient(90deg,#f6f4ee_0_1px,#dcd7cb_1px_2px)] [transform:rotateY(90deg)]" />
        {/* Top edge of the pages. */}
        <div className="absolute top-[calc(1.5%-14px)] right-[2%] left-0 h-[28px] bg-[repeating-linear-gradient(180deg,#f6f4ee_0_1px,#dcd7cb_1px_2px)] [transform:rotateX(90deg)]" />
        {/* Front board. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[3px_8px_8px_3px] bg-[var(--accent)] bg-cover bg-center [transform:translateZ(14px)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
          style={{ backgroundImage: GUIDE_COVER_SET }}
        >
          {/* Legibility over any art, then the hinge and a paper sheen. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_14_12/0.72)_0%,rgb(10_14_12/0.18)_42%,rgb(10_14_12/0.2)_62%,rgb(10_14_12/0.78)_100%)]" />
          <div className="absolute inset-y-0 left-0 w-5 bg-[linear-gradient(90deg,rgb(0_0_0/0.35),rgb(255_255_255/0.12)_45%,rgb(0_0_0/0.15)_60%,transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.08)_50%,transparent_60%)]" />
          <div className="relative flex h-full flex-col px-7 pt-8 pb-6 pl-9 text-[#f7f5ef]">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[.24em] opacity-80">{t(site, 'guideBook.edition')}</p>
            <span aria-hidden="true" className="mt-4 block h-px w-10 bg-[var(--accent-2-on-dark)]" />
            <p className="mt-5 font-[family-name:var(--display-font)] text-[1.85rem] leading-[1.02] tracking-[-.02em] text-balance">{t(site, 'guideBook.title')}</p>
            <p className="mt-4 max-w-[22ch] text-[0.78rem] leading-snug opacity-85">{t(site, 'guideBook.subtitle')}</p>
            <p className="mt-auto border-t border-white/25 pt-3 text-[0.6rem] uppercase tracking-[.18em] opacity-80">{t(site, 'guideBook.footer')}</p>
          </div>
        </div>
      </div>
      {/* Floor shadow. */}
      <div aria-hidden="true" className="absolute -bottom-5 left-[8%] -z-10 h-8 w-[88%] rounded-[50%] bg-[rgb(16_24_40/0.35)] blur-xl" />
    </figure>
  );
}

const CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** The twelve chapters (docs/guide-outline.md), numbered, two columns on wide screens. */
export function TocPreview({ site, id = 'inside', tone = 'default' }: { site: SiteKey; id?: string; tone?: 'default' | 'alt' }) {
  return (
    <Band tone={tone} id={id} labelledBy={`${id}-title`} data-toc-preview>
      <SectionHeader id={`${id}-title`} eyebrow={t(site, 'guideToc.eyebrow')} title={t(site, 'guideToc.title')} intro={t(site, 'guideToc.intro')} />
      <ol className="mt-12 grid gap-x-12 md:mt-16 md:grid-cols-2">
        {CHAPTERS.map((n) => (
          <li key={n} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 border-t border-[var(--border)] py-6">
            <span aria-hidden="true" className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-none text-[var(--accent)] tabular-nums">
              {String(n).padStart(2, '0')}
            </span>
            <div>
              <p className="sr-only">{t(site, 'guideToc.chapter', { n })}</p>
              <h3 className="font-[family-name:var(--display-font)] text-(length:--step-1) leading-snug">{t(site, `guideToc.${n}.title`)}</h3>
              <p className="mt-1.5 text-(length:--step--1) leading-relaxed text-[var(--fg-muted)]">{t(site, `guideToc.${n}.note`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Band>
  );
}

/** Which chapter each sample comes from, and whether it opens with a bold lead-in. */
const SAMPLES = [
  { n: 1, chapter: 1, lead: false },
  { n: 2, chapter: 5, lead: false },
  { n: 3, chapter: 11, lead: true },
] as const;

/** Three short extracts, set like pages from the book. */
export function SamplePages({ site, tone = 'alt' }: { site: SiteKey; tone?: 'default' | 'alt' }) {
  return (
    <Band tone={tone} labelledBy="samples-title" data-sample-pages>
      <SectionHeader id="samples-title" eyebrow={t(site, 'guideSample.eyebrow')} title={t(site, 'guideSample.title')} intro={t(site, 'guideSample.intro')} />
      <ul className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-3 lg:gap-8">
        {SAMPLES.map((sample, index) => (
          <li key={sample.n} className={`min-w-0 ${index === 1 ? 'lg:translate-y-8' : ''}`}>
            <figure className="relative h-full rounded-[4px] bg-[var(--surface)] px-8 pt-9 pb-10 shadow-[var(--elev-0),var(--elev-2)] sm:px-10">
              {/* The gutter shadow of an open book. */}
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-6 rounded-l-[4px] bg-[linear-gradient(90deg,rgb(16_24_40/0.07),transparent)]" />
              <figcaption className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4 text-(length:--step--2) uppercase tracking-[.16em] text-[var(--fg-muted)]">
                <span>{t(site, 'guideToc.chapter', { n: sample.chapter })}</span>
                <span className="truncate normal-case tracking-normal italic">{t(site, `guideToc.${sample.chapter}.title`)}</span>
              </figcaption>
              <blockquote className="mt-6 font-[family-name:var(--display-font)] text-(length:--step-1) leading-[1.55] text-[var(--fg)]">
                <p className={sample.lead ? '' : 'first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:text-[3.4em] first-letter:leading-[.8] first-letter:text-[var(--accent)]'}>
                  {sample.lead && <strong className="font-medium text-[var(--accent)]">{t(site, `guideSample.${sample.n}.lead`)} </strong>}
                  {t(site, `guideSample.${sample.n}.text`)}
                </p>
              </blockquote>
            </figure>
          </li>
        ))}
      </ul>
    </Band>
  );
}

const FOR = [1, 2, 3, 4] as const;

/** Who the guide is for, and who should not buy it. */
export function ForWhom({ site, tone = 'default' }: { site: SiteKey; tone?: 'default' | 'alt' }) {
  return (
    <Band tone={tone} labelledBy="for-whom-title" data-for-whom>
      <h2 id="for-whom-title" className="max-w-3xl font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">{t(site, 'guideFor.title')}</h2>
      <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6">
        <div className="rounded-[var(--radius-brand)] bg-[var(--surface)] p-8 shadow-[var(--elev-0)] sm:p-10">
          <h3 className="font-[family-name:var(--display-font)] text-(length:--step-2)">{t(site, 'guideFor.yesTitle')}</h3>
          <ul className="mt-6 space-y-4">
            {FOR.map((n) => (
              <li key={n} className="flex gap-4 leading-relaxed">
                <span aria-hidden="true" className="mt-[.45em] h-2 w-3.5 shrink-0 -rotate-45 border-b-2 border-l-2 border-[var(--accent)]" />
                <span>{t(site, `guideFor.yes.${n}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-brand)] border border-dashed border-[var(--border)] p-8 sm:p-10">
          <h3 className="font-[family-name:var(--display-font)] text-(length:--step-2)">{t(site, 'guideFor.noTitle')}</h3>
          <ul className="mt-6 space-y-4">
            {FOR.map((n) => (
              <li key={n} className="flex gap-4 leading-relaxed text-[var(--fg-muted)]">
                <span aria-hidden="true" className="mt-[.8em] h-px w-3.5 shrink-0 bg-[var(--fg-muted)]" />
                <span>{t(site, `guideFor.no.${n}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Band>
  );
}

/**
 * "Want it done for you?" (plan §11.3): the service side, on the hub's
 * message page. No booked calls (2026-09-24): the button says "Message us".
 */
export function ServiceUpsell({ site }: { site: SiteKey }) {
  return (
    <section data-service-upsell aria-labelledby="upsell-title" className="bg-[var(--fg)] py-[var(--space-section)] text-[var(--bg)]">
      <div className="mx-auto grid w-full max-w-[var(--container)] gap-8 px-[var(--space-gutter)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
        <div className="max-w-2xl">
          <Eyebrow color="text-[var(--accent-2-on-dark)]">{t(site, 'upsell.eyebrow')}</Eyebrow>
          <h2 id="upsell-title" className="mt-4 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">{t(site, 'thankYou.upsellTitle')}</h2>
          <p className="mt-5 max-w-[58ch] leading-relaxed opacity-80">{t(site, 'thankYou.upsellBody')}</p>
        </div>
        <a
          href={`${siteOrigin('residency')}/book`}
          rel="noopener"
          className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-[var(--radius-brand)] bg-[var(--bg)] px-7 py-3 text-(length:--step--1) font-medium text-[var(--fg)] transition-opacity duration-[var(--dur-2)] hover:opacity-90 md:self-end"
        >
          {t(site, 'thankYou.upsellCta')} <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
