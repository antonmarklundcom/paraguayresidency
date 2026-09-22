/* eslint-disable @next/next/no-img-element -- Responsive local Arrival images. */
import imagery from '../../docs/imagery-manifest.json';

export interface IntentTile { label: string; href: string; image: string }

export function IntentTiles({ title, tiles }: { title: string; tiles: IntentTile[] }) {
  return (
    <section data-intent-tiles aria-label={title} className="min-w-0 py-16 md:py-24">
      <div className="mx-auto max-w-[var(--container)] px-5 sm:px-8">
        <h2 className="mb-8 font-[family-name:var(--display-font)] text-3xl tracking-tight">{title}</h2>
        <div className={`-mx-2 grid auto-cols-[82%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain p-2 md:auto-cols-auto md:grid-flow-row md:overflow-visible ${tiles.length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
          {tiles.map(tile => {
            const asset = imagery.images.find(asset => asset.id === tile.image);
            if (!asset) throw new Error(`Unknown Arrival image: ${tile.image}`);
            return (
              <a key={tile.href} href={tile.href} className="group relative isolate flex aspect-[4/5] min-h-11 min-w-0 snap-start items-end overflow-hidden rounded-[var(--radius-brand)] bg-black p-5 text-white focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
                <img src={`/images/arrival/${tile.image}-800.webp`} srcSet={`/images/arrival/${tile.image}-480.webp 480w, /images/arrival/${tile.image}-800.webp 800w`} sizes={tiles.length === 5 ? '(min-width: 768px) 20vw, 82vw' : '(min-width: 768px) 25vw, 82vw'} width={800} height={1000} alt={asset.alt_en} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,.95),rgba(0,0,0,.72)_35%,transparent_75%)]" />
                <span className="flex w-full items-end justify-between gap-3 text-xl font-medium leading-tight"><span>{tile.label}</span><span aria-hidden="true">↗</span></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
