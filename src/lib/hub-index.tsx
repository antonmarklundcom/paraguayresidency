import { ArticleCards, Breadcrumbs, Container, Heading, JsonLd } from '@/components';
import { getHub } from '@/content';
import { arrivalPicture } from '@/lib/arrival-files';
import { articleOwnImage } from '@/lib/article-images';
import { hubImage } from '@/lib/hub-images';
import { collectionPageJsonLd } from '@/lib/metadata';
import { contentHref } from '@/lib/site-pages';
import { getSite, type SiteKey } from '@/sites/registry';

/**
 * A hub index (`/guider`, `/stader`, ...): the hub's photo and H1 on top, then
 * every article as an image card (its own photo, else the hub's, never the
 * same one twice in a row). One shared page so a brand adds a hub with a few
 * lines; copy comes from the caller, in the brand's language.
 */
export function HubIndexPage({ site, hub, path, title, description, listTitle, eyebrow }: {
  site: SiteKey;
  hub: string;
  path: string;
  title: string;
  description: string;
  /** Heading over the card grid, e.g. "Alla guider". */
  listTitle: string;
  eyebrow?: string;
}) {
  const posts = getHub(site, hub)
    .filter((post) => !post.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.updatedAt ?? a.frontmatter.publishedAt) < (b.frontmatter.updatedAt ?? b.frontmatter.publishedAt) ? 1 : -1);
  const picture = arrivalPicture(hubImage(site, hub), getSite(site).locale, { maxWidth: 1200 });
  const sizes = '(min-width: 1024px) 50vw, 100vw';

  return (
    <>
      <section data-hub-index className="bg-[var(--bg)] pt-[var(--space-8)] pb-[var(--space-section)]">
        <Container>
          <Breadcrumbs site={site} items={[{ label: title, href: path }]} />
          <div className="mt-[var(--space-8)] grid items-center gap-[var(--space-8)] lg:grid-cols-2 lg:gap-16">
            <div>
              {eyebrow && <p className="mb-3 text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--accent)]">{eyebrow}</p>}
              <Heading level={1}>{title}</Heading>
              <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-(length:--text-lg) text-[var(--fg-muted)]">{description}</p>
            </div>
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
                className="aspect-[3/2] w-full rounded-[var(--radius-brand)] object-cover shadow-[var(--elev-0)]"
              />
            </picture>
          </div>
        </Container>
      </section>
      <JsonLd
        data={collectionPageJsonLd(site, {
          name: title,
          description,
          path,
          items: posts.map((post) => ({ name: post.frontmatter.title, path: contentHref(site, post.slugPath) })),
        })}
      />
      <ArticleCards
        site={site}
        tone="alt"
        title={listTitle}
        articles={posts.map((post) => ({
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          href: contentHref(site, post.slugPath),
          hub: post.hub,
          image: articleOwnImage(site, post.slugPath),
        }))}
      />
    </>
  );
}
