import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/locales';
import { t } from '@/i18n';
import { arrivalPicture } from '@/lib/arrival-files';
import type { SiteKey } from '@/sites/registry';
import { TEAM } from './TeamStrip';

export interface HeroTrust {
  /** One line from the team, e.g. "We read and answer every message ourselves." */
  title: string;
  lines: string[];
}

/** The standard trust card for a brand: the team promise plus fee, place and reply time. */
export function heroTrust(site: SiteKey): HeroTrust {
  return {
    title: t(site, 'team.promise'),
    lines: [t(site, 'proof.fixedFee'), t(site, 'proof.asuncion'), t(site, 'proof.reply')],
  };
}

export type HeroLayout = 'overlay' | 'split' | 'editorial-dark';

const rise = 'motion-safe:animate-[hero-rise_.9s_var(--ease)_both]';

/**
 * The LCP image. WebP at 1200/2400 as before, plus an AVIF `<source>` as soon
 * as `/images/arrival/<id>-<width>.avif` files exist (read from disk, so a
 * new encode needs no code change).
 */
function HeroPicture({ image, locale, sizes, focus, className }: {
  image: string; locale: Locale; sizes: string; focus: string; className: string;
}) {
  const picture = arrivalPicture(image, locale);
  return (
    <picture>
      {picture.avifSrcSet && <source type="image/avif" srcSet={picture.avifSrcSet} sizes={sizes} />}
      <img
        src={picture.src}
        srcSet={picture.srcSet}
        sizes={sizes}
        width={picture.width}
        height={picture.height}
        alt={picture.alt}
        loading="eager"
        fetchPriority="high"
        style={{ objectPosition: focus }}
        className={className}
      />
    </picture>
  );
}

function TrustCard({ trust, tone }: { trust: HeroTrust; tone: 'glass' | 'paper' }) {
  const glass = tone === 'glass';
  return (
    <aside
      aria-label={trust.title}
      className={
        glass
          ? `rounded-[calc(var(--radius-brand)+6px)] border border-white/20 bg-white/10 p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] backdrop-blur-xl backdrop-saturate-150 ${rise} [animation-delay:360ms]`
          : `rounded-[var(--radius-brand)] bg-[var(--surface)] p-6 shadow-[var(--elev-0)] ${rise} [animation-delay:360ms]`
      }
    >
      <div className="flex items-center gap-4">
        <ul aria-hidden="true" className="flex -space-x-2.5">
          {TEAM.map((name) => (
            <li
              key={name}
              className={`flex size-10 items-center justify-center rounded-full border-2 text-xs font-semibold tracking-wide ${
                glass ? 'border-white/80 bg-white text-black' : 'border-[var(--surface)] bg-[var(--fg)] text-[var(--bg)]'
              }`}
            >
              {name.split(' ').map((part) => part[0]).join('')}
            </li>
          ))}
        </ul>
        <p className={`text-sm leading-snug ${glass ? 'text-white/90' : 'text-[var(--fg)]'}`}>{trust.title}</p>
      </div>
      <ul className={`mt-5 space-y-2.5 border-t pt-5 text-sm ${glass ? 'border-white/15 text-white/90' : 'border-[var(--border)] text-[var(--fg-muted)]'}`}>
        {trust.lines.map((line) => (
          <li key={line} className="flex items-center gap-3">
            <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] ${glass ? 'bg-white/15' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>✓</span>
            {line}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/**
 * The photo hero, in three layouts (overhaul plan §3):
 *  - `overlay` (default, as before): full-bleed photo, white type on a scrim.
 *  - `split`: text on the brand background left, the photo right in the
 *    brand radius, cropped tall (the hub).
 *  - `editorial-dark`: full bleed, bigger type, a gold hairline (Investor Pass).
 */
export function PhotoHero({ image, eyebrow, title, sub, actions, trust, locale = 'en', position = 'left', focus = 'center', layout = 'overlay' }: {
  image: string; eyebrow?: string; title: string; sub: string; actions: ReactNode;
  /** A card with the team and three reassurance lines (bottom right on desktop). */
  trust?: HeroTrust;
  locale?: Locale;
  position?: 'left' | 'upper-left';
  /** object-position of the photo, so the subject survives the mobile crop. */
  focus?: string;
  layout?: HeroLayout;
}) {
  if (layout === 'split') {
    // Phones: text, photo, then the trust card. Wide: text and card on the
    // left, the photo spanning both rows on the right.
    return (
      <section data-hero-layout="split" className="bg-[var(--bg)] text-[var(--fg)]">
        <div className="mx-auto grid w-full max-w-[var(--container)] gap-x-16 gap-y-10 px-[var(--space-gutter)] pt-10 pb-14 md:pt-14 lg:min-h-[min(88vh,56rem)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-rows-[1fr_auto] lg:py-16">
          <div className="max-w-[44rem] lg:self-end">
            {eyebrow && (
              <p className={`mb-6 inline-flex items-center gap-3 text-(length:--step--2) font-medium uppercase tracking-[.22em] text-[var(--accent)] ${rise}`}>
                <span aria-hidden="true" className="h-px w-10 bg-current" />
                {eyebrow}
              </p>
            )}
            <h1 className={`font-[family-name:var(--display-font)] text-[clamp(2.625rem,1.9rem+3.2vw,4.75rem)] leading-[1.02] text-balance ${rise} [animation-delay:80ms]`}>{title}</h1>
            <p className={`mt-7 max-w-xl text-(length:--step-1) leading-relaxed text-[var(--fg-muted)] ${rise} [animation-delay:160ms]`}>{sub}</p>
            <div className={`mt-9 flex flex-wrap gap-3 [&>a]:min-h-12 [&>a]:px-6 ${rise} [animation-delay:240ms]`}>{actions}</div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-brand)] bg-[var(--surface-alt)] shadow-[var(--elev-2)] sm:aspect-[16/10] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:aspect-auto lg:min-h-[34rem]">
            <HeroPicture image={image} locale={locale} focus={focus} sizes="(min-width: 1024px) 44vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          {trust && <div className="max-w-md lg:self-start"><TrustCard trust={trust} tone="paper" /></div>}
        </div>
      </section>
    );
  }

  const dark = layout === 'editorial-dark';
  return (
    <section data-hero-layout={layout} className={`relative isolate flex min-h-[92svh] overflow-hidden bg-black text-white md:min-h-[86vh] items-end ${position === 'upper-left' ? 'lg:items-start' : ''}`}>
      <HeroPicture image={image} locale={locale} focus={focus} sizes="100vw" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      {/* Dark where the text sits, clear elsewhere so the photo carries the page. */}
      <div className={`absolute inset-0 -z-10 ${dark
        ? 'bg-[linear-gradient(to_top,rgba(5,6,8,.94),rgba(5,6,8,.62)_45%,rgba(5,6,8,.25)_100%)] md:bg-[linear-gradient(90deg,rgba(5,6,8,.88),rgba(5,6,8,.55)_45%,rgba(5,6,8,.1)_80%)]'
        : 'bg-[linear-gradient(to_top,rgba(0,0,0,.9),rgba(0,0,0,.6)_50%,rgba(0,0,0,.3)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,.8),rgba(0,0,0,.5)_42%,rgba(0,0,0,.05)_78%)]'}`} />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,.55),transparent)] md:block" />
      <div className={`mx-auto grid w-full max-w-[var(--container)] gap-10 px-[var(--space-gutter)] pt-28 pb-12 md:pb-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end ${position === 'upper-left' ? 'lg:pt-32' : ''} ${dark ? 'md:pb-24' : ''}`}>
        <div className={`${dark ? 'max-w-[860px]' : 'max-w-[720px]'} [text-shadow:0_1px_14px_rgba(0,0,0,.4)]`}>
          {eyebrow && (
            <p className={`mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[.22em] ${dark ? 'text-[var(--accent)]' : 'text-white/85'} ${rise}`}>
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {eyebrow}
            </p>
          )}
          <h1 className={`font-[family-name:var(--display-font)] leading-[.98] text-balance ${dark ? 'text-[clamp(3rem,7.5vw,7rem)]' : 'text-[clamp(2.6rem,6vw,5.75rem)]'} ${rise} [animation-delay:80ms]`}>{title}</h1>
          {dark && <span aria-hidden="true" className={`mt-8 block h-px w-24 bg-[var(--accent)] ${rise} [animation-delay:120ms]`} />}
          <p className={`mt-7 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg ${rise} [animation-delay:160ms]`}>{sub}</p>
          <div className={`mt-9 flex flex-wrap gap-3 [&>a]:min-h-12 [&>a]:px-6 ${rise} [animation-delay:240ms]`}>{actions}</div>
        </div>
        {trust && <TrustCard trust={trust} tone="glass" />}
      </div>
    </section>
  );
}
