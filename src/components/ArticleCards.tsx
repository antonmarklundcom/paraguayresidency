import Link from 'next/link';
import { localeFor, t } from '@/i18n';
import { arrivalExists, arrivalPicture } from '@/lib/arrival-files';
import { cardImages } from '@/lib/hub-images';
import type { SiteKey } from '@/sites/registry';

export interface ArticleCard {
  title: string;
  description?: string;
  href: string;
  eyebrow?: string;
  /** An Arrival image id for this article. Without one, the hub's image. */
  image?: string;
  /** The article's hub (`post.hub`), which picks the fallback image. */
  hub?: string;
}

/**
 * Image-led article cards (overhaul plan §2, v2). Every card has a photo:
 * its own, else its hub's (`src/lib/hub-images.ts`), else the brand's, and
 * never the same photo twice in a row, so there is never an empty grey box. Images are lazy, sized and captioned
 * with the localized alt text from the imagery manifest.
 */
export function ArticleCards({ site, title, articles, more, tone = 'default' }: {
  site: SiteKey; title: string; articles: ArticleCard[]; more?: { href: string; label: string };
  tone?: 'default' | 'alt';
}) {
  if (articles.length === 0) return null;
  const locale = localeFor(site);
  const images = cardImages(site, articles, arrivalExists);
  return (
    <section data-article-cards className={`py-[var(--space-section)] ${tone === 'alt' ? 'bg-[var(--surface-alt)]' : 'bg-[var(--bg)]'}`}>
      <div className="mx-auto max-w-[var(--container)] px-[var(--space-gutter)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">{title}</h2>
          {more && (
            <Link href={more.href} className="inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline">
              {more.label} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <ul className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3 lg:gap-8">
          {articles.map((article, index) => {
            const picture = arrivalPicture(images[index], locale, { maxWidth: 1200 });
            const sizes = '(min-width: 1216px) 380px, (min-width: 768px) 31vw, 100vw';
            return (
              <li key={article.href} className="min-w-0">
                <Link
                  href={article.href}
                  className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-brand)] bg-[var(--surface)] shadow-[var(--elev-0)] transition-shadow duration-[var(--dur-3)] ease-[var(--ease-out)] hover:shadow-[var(--elev-0),var(--elev-2)] focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-[var(--surface-alt)]">
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
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    {article.eyebrow && <span className="mb-3 text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--accent)]">{article.eyebrow}</span>}
                    <span className="font-[family-name:var(--display-font)] text-(length:--step-2) leading-[1.15] text-balance">{article.title}</span>
                    {article.description && <span className="mt-3 line-clamp-3 text-(length:--step--1) leading-relaxed text-[var(--fg-muted)]">{article.description}</span>}
                    <span className="mt-auto flex items-center gap-2 pt-6 text-(length:--step--1) font-medium text-[var(--accent)]">
                      {t(site, 'articles.read')}
                      <span aria-hidden="true" className="transition-transform duration-[var(--dur-2)] group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
