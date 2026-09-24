/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/locales';
import { t } from '@/i18n';
import { arrivalImage } from '@/lib/imagery';
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

const rise = 'motion-safe:animate-[hero-rise_.9s_var(--ease)_both]';

export function PhotoHero({ image, eyebrow, title, sub, actions, trust, locale = 'en', position = 'left', focus = 'center' }: {
  image: string; eyebrow?: string; title: string; sub: string; actions: ReactNode;
  /** A glass card with the team and three reassurance lines (bottom right on desktop). */
  trust?: HeroTrust;
  locale?: Locale;
  position?: 'left' | 'upper-left';
  /** object-position of the photo, so the subject survives the mobile crop. */
  focus?: string;
}) {
  const asset = arrivalImage(image, locale);
  return (
    <section className={`relative isolate flex min-h-[92svh] overflow-hidden bg-black text-white md:min-h-[86vh] items-end ${position === 'upper-left' ? 'lg:items-start' : ''}`}>
      <img src={`/images/arrival/${image}-2400.webp`} srcSet={`/images/arrival/${image}-1200.webp 1200w, /images/arrival/${image}-2400.webp 2400w`} sizes="100vw" width={2400} height={1350} alt={asset.alt} loading="eager" fetchPriority="high" style={{ objectPosition: focus }} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      {/* Dark where the text sits, clear elsewhere so the photo carries the page. */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,.9),rgba(0,0,0,.6)_50%,rgba(0,0,0,.3)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,.8),rgba(0,0,0,.5)_42%,rgba(0,0,0,.05)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,.55),transparent)] md:block" />
      <div className={`mx-auto grid w-full max-w-[var(--container)] gap-10 px-5 pt-28 pb-12 sm:px-8 md:pb-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end ${position === 'upper-left' ? 'lg:pt-32' : ''}`}>
        <div className="max-w-[720px] [text-shadow:0_1px_14px_rgba(0,0,0,.4)]">
          {eyebrow && (
            <p className={`mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[.22em] text-white/85 ${rise}`}>
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {eyebrow}
            </p>
          )}
          <h1 className={`font-[family-name:var(--display-font)] text-[clamp(2.6rem,6vw,5.75rem)] leading-[.98] text-balance ${rise} [animation-delay:80ms]`}>{title}</h1>
          <p className={`mt-7 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg ${rise} [animation-delay:160ms]`}>{sub}</p>
          <div className={`mt-9 flex flex-wrap gap-3 [&>a]:min-h-12 [&>a]:px-6 ${rise} [animation-delay:240ms]`}>{actions}</div>
        </div>
        {trust && (
          <aside aria-label={trust.title} className={`rounded-[calc(var(--radius-brand)+6px)] border border-white/20 bg-white/10 p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] backdrop-blur-xl backdrop-saturate-150 ${rise} [animation-delay:360ms]`}>
            <div className="flex items-center gap-4">
              <ul aria-hidden="true" className="flex -space-x-2.5">
                {TEAM.map((name) => (
                  <li key={name} className="flex size-10 items-center justify-center rounded-full border-2 border-white/80 bg-white text-xs font-semibold tracking-wide text-black">
                    {name.split(' ').map((part) => part[0]).join('')}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-snug text-white/90">{trust.title}</p>
            </div>
            <ul className="mt-5 space-y-2.5 border-t border-white/15 pt-5 text-sm text-white/90">
              {trust.lines.map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px]">✓</span>
                  {line}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}
