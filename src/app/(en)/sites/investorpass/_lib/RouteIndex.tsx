import type { FactKey } from '@content/shared/facts';
import { Fact } from '@/components';
import { arrivalPicture } from '@/lib/arrival-files';

export interface IndexRoute {
  id: string;
  title: string;
  body: string;
  image: string;
  factKey: FactKey;
}

const NUMERALS = ['I', 'II', 'III', 'IV'];

/**
 * The four Investor Pass routes as a numbered index (I to IV): a roman
 * numeral, a photo, the route and its threshold from `<Fact>`, divided by
 * gold hairlines. Server-rendered, no client JS.
 */
export function RouteIndex({ routes }: { routes: IndexRoute[] }) {
  return (
    <ol className="mt-12 border-b border-[var(--accent)]/40 md:mt-16">
      {routes.map((route, index) => {
        const picture = arrivalPicture(route.image, 'en', { maxWidth: 800 });
        const sizes = '(min-width: 1024px) 420px, (min-width: 640px) 45vw, 100vw';
        return (
          <li key={route.id} className="border-t border-[var(--accent)]/40">
            <a
              href={`/investor-pass/investment-routes#${route.id}`}
              className="group grid gap-x-10 gap-y-6 py-8 focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] md:py-12 lg:grid-cols-[5rem_minmax(0,5fr)_minmax(0,6fr)] lg:items-center"
            >
              <span aria-hidden="true" className="hidden font-[family-name:var(--display-font)] text-(length:--step-5) leading-none text-[var(--accent)] lg:block">
                {NUMERALS[index]}
              </span>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-brand)] bg-[var(--surface-alt)] sm:col-start-1 sm:row-start-1 lg:col-start-2">
                <picture>
                  {picture.avifSrcSet && <source type="image/avif" srcSet={picture.avifSrcSet} sizes={sizes} />}
                  <img
                    src={picture.src}
                    srcSet={picture.srcSet}
                    sizes={sizes}
                    width={picture.width}
                    height={picture.height}
                    alt={picture.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-4)] ease-[var(--ease-out)] motion-safe:group-hover:scale-[1.04]"
                  />
                </picture>
              </div>
              <div className="sm:col-start-2 sm:row-start-1 lg:col-start-3">
                <p className="font-[family-name:var(--font-mono)] text-(length:--step--2) uppercase tracking-[.18em] text-[var(--accent)]">
                  Route {NUMERALS[index]}
                </p>
                <h3 className="mt-3 font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight text-balance">{route.title}</h3>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-[var(--fg-muted)]">{route.body}</p>
                <p className="mt-5 border-t border-[var(--border)] pt-4 text-(length:--step--1) text-[var(--fg)]">
                  <Fact k={route.factKey} site="investorpass" />
                </p>
                <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)]">
                  Read the route <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
