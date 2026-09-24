/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import type { Locale } from '@/i18n/locales';
import { arrivalImage } from '@/lib/imagery';

export interface IntentTile { label: string; href: string; image: string; /** One short line under the label. */ note?: string }

export function IntentTiles({ title, intro, tiles, locale = 'en' }: { title: string; intro?: string; tiles: IntentTile[]; locale?: Locale }) {
  return (
    <section data-intent-tiles aria-label={title} className="min-w-0 py-16 md:py-24">
      <div className="mx-auto max-w-[var(--container)] px-5 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 className="font-[family-name:var(--display-font)] text-(length:--text-2xl) leading-[var(--leading-tight)] sm:text-(length:--text-3xl)">{title}</h2>
          {intro && <p className="max-w-md text-[var(--fg-muted)]">{intro}</p>}
        </div>
        <div className={`-mx-2 grid auto-cols-[82%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain p-2 md:auto-cols-auto md:grid-flow-row md:overflow-visible ${tiles.length === 5 ? 'md:grid-cols-5' : tiles.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
          {tiles.map(tile => {
            const asset = arrivalImage(tile.image, locale);
            return (
              <a key={tile.href} href={tile.href} className="group relative isolate flex aspect-[4/5] min-h-11 min-w-0 snap-start items-end overflow-hidden rounded-[var(--radius-brand)] bg-black p-5 text-white shadow-[var(--shadow)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
                <img src={`/images/arrival/${tile.image}-800.webp`} srcSet={`/images/arrival/${tile.image}-480.webp 480w, /images/arrival/${tile.image}-800.webp 800w`} sizes={tiles.length === 5 ? '(min-width: 768px) 20vw, 82vw' : tiles.length === 3 ? '(min-width: 768px) 33vw, 82vw' : '(min-width: 768px) 25vw, 82vw'} width={800} height={1000} alt={asset.alt} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease)] motion-safe:group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,.95),rgba(0,0,0,.72)_35%,transparent_75%)]" />
                <span className="flex w-full flex-col gap-1">
                  <span className="flex w-full items-end justify-between gap-3 text-xl font-medium leading-tight">
                    <span>{tile.label}</span>
                    <span aria-hidden="true" className="transition-transform duration-[var(--duration)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5">↗</span>
                  </span>
                  {tile.note && <span className="text-sm leading-snug text-white/80">{tile.note}</span>}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
