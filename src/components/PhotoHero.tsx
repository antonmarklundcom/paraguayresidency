/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/locales';
import { arrivalImage } from '@/lib/imagery';

export function PhotoHero({ image, eyebrow, title, sub, actions, proof, locale = 'en', position = 'left', focus = 'center' }: {
  image: string; eyebrow?: string; title: string; sub: string; actions: ReactNode;
  /** Three short reassurance lines under the buttons, e.g. fixed fee · team · reply time. */
  proof?: string[];
  locale?: Locale;
  position?: 'left' | 'upper-left';
  /** object-position of the photo, so the subject survives the mobile crop. */
  focus?: string;
}) {
  const asset = arrivalImage(image, locale);
  return (
    <section className={`relative isolate flex min-h-[88svh] overflow-hidden bg-black text-white md:min-h-[80vh] items-end ${position === 'upper-left' ? 'md:items-start' : 'md:items-center'}`}>
      <img src={`/images/arrival/${image}-2400.webp`} srcSet={`/images/arrival/${image}-1200.webp 1200w, /images/arrival/${image}-2400.webp 2400w`} sizes="100vw" width={2400} height={1350} alt={asset.alt} loading="eager" fetchPriority="high" style={{ objectPosition: focus }} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      {/* Dark where the text sits, clear elsewhere so the photo carries the page. */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,.88),rgba(0,0,0,.62)_50%,rgba(0,0,0,.3)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.5)_40%,rgba(0,0,0,0)_75%)]" />
      <div className="mx-auto w-full max-w-[var(--container)] px-5 py-16 sm:px-8 md:py-24">
        <div className="max-w-[680px] [text-shadow:0_1px_12px_rgba(0,0,0,.45)]">
          {eyebrow && (
            <p className="mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[.2em]">
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-70" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-[family-name:var(--display-font)] text-[clamp(2.5rem,5.4vw,5.25rem)] leading-[1.02] text-balance">{title}</h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">{sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
          {proof && proof.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-6 text-sm text-white/85">
              {proof.map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-white/70">✓</span>
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
