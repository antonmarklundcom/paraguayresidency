/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import type { ReactNode } from 'react';
import imagery from '../../docs/imagery-manifest.json';

export function PhotoHero({ image, eyebrow, title, sub, actions, position = 'left', focus = 'center' }: {
  image: string; eyebrow?: string; title: string; sub: string; actions: ReactNode;
  position?: 'left' | 'upper-left';
  /** object-position of the photo, so the subject survives the mobile crop. */
  focus?: string;
}) {
  const asset = imagery.images.find(asset => asset.id === image);
  if (!asset) throw new Error(`Unknown Arrival image: ${image}`);
  return (
    <section className={`relative isolate flex min-h-[88svh] overflow-hidden bg-black text-white md:min-h-[80vh] items-end ${position === 'upper-left' ? 'md:items-start' : 'md:items-center'}`}>
      <img src={`/images/arrival/${image}-2400.webp`} srcSet={`/images/arrival/${image}-1200.webp 1200w, /images/arrival/${image}-2400.webp 2400w`} sizes="100vw" width={2400} height={1350} alt={asset.alt_en} loading="eager" fetchPriority="high" style={{ objectPosition: focus }} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      {/* Dark where the text sits, clear elsewhere so the photo carries the page. */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,.85),rgba(0,0,0,.55)_45%,rgba(0,0,0,.05)_80%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.5)_40%,rgba(0,0,0,0)_75%)]" />
      <div className="mx-auto w-full max-w-[var(--container)] px-5 py-16 sm:px-8 md:py-24">
        <div className="max-w-[660px] [text-shadow:0_1px_12px_rgba(0,0,0,.45)]">
          {eyebrow && <p className="mb-6 text-xs font-medium uppercase tracking-[.2em]">{eyebrow}</p>}
          <h1 className="font-[family-name:var(--display-font)] text-[clamp(2.5rem,5vw,5rem)] leading-[1.03] tracking-[-.035em] text-balance">{title}</h1>
          <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg">{sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </section>
  );
}
