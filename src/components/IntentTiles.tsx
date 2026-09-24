/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import type { Locale } from '@/i18n/locales';
import { arrivalImage } from '@/lib/imagery';

export interface IntentTile { label: string; href: string; image: string; /** One short line under the label. */ note?: string }

/**
 * Editorial bento on desktop (a feature tile two rows tall, the rest around
 * it), a swipeable snap row on mobile.
 */
function span(index: number, count: number): string {
  if (index === 0) return 'md:col-span-2 md:row-span-2';
  if (count === 3) return 'md:col-span-2';
  if (count === 4 && index === 1) return 'md:col-span-2';
  return '';
}

export function IntentTiles({ title, intro, tiles, locale = 'en' }: { title: string; intro?: string; tiles: IntentTile[]; locale?: Locale }) {
  return (
    <section data-intent-tiles aria-label={title} className="min-w-0 py-16 md:py-28">
      <div className="mx-auto max-w-[var(--container)] px-5 sm:px-8">
        <div className="mb-10 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:items-end">
          <h2 className="max-w-2xl font-[family-name:var(--display-font)] text-(length:--text-3xl) leading-[1.05] text-balance sm:text-(length:--text-4xl)">{title}</h2>
          {intro && <p className="text-[var(--fg-muted)] md:justify-self-end">{intro}</p>}
        </div>
        <div className="-mx-2 grid auto-cols-[82%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain p-2 md:h-[min(80vh,700px)] md:auto-cols-auto md:grid-flow-row md:grid-cols-4 md:grid-rows-2 md:overflow-visible">
          {tiles.map((tile, index) => {
            const asset = arrivalImage(tile.image, locale);
            const feature = index === 0;
            return (
              <a key={tile.href} href={tile.href} className={`group relative isolate flex aspect-[4/5] min-h-11 min-w-0 snap-start flex-col justify-between overflow-hidden rounded-[calc(var(--radius-brand)+4px)] bg-black p-5 text-white shadow-[var(--shadow)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] md:aspect-auto md:p-7 ${span(index, tiles.length)}`}>
                <img src={`/images/arrival/${tile.image}-800.webp`} srcSet={`/images/arrival/${tile.image}-480.webp 480w, /images/arrival/${tile.image}-800.webp 800w`} sizes={feature ? '(min-width: 768px) 50vw, 82vw' : '(min-width: 768px) 25vw, 82vw'} width={800} height={1000} alt={asset.alt} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease)] motion-safe:group-hover:scale-[1.06]" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,.9),rgba(0,0,0,.45)_40%,rgba(0,0,0,.05)_70%,rgba(0,0,0,.25))] transition-opacity duration-500 group-hover:opacity-90" />
                <span aria-hidden="true" className="self-start rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium tracking-[.2em] text-white/90 backdrop-blur-sm">{String(index + 1).padStart(2, '0')}</span>
                <span className="flex w-full items-end justify-between gap-4">
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className={`font-[family-name:var(--display-font)] leading-[1.05] text-balance ${feature ? 'text-2xl md:text-4xl' : 'text-2xl'}`}>{tile.label}</span>
                    {tile.note && <span className="text-sm leading-snug text-white/75">{tile.note}</span>}
                  </span>
                  <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 text-lg backdrop-blur-sm transition-[background-color,color,border-color,transform] duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black motion-safe:group-hover:-rotate-45">→</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
