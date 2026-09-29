import { getPage } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { ArticleCard } from '@/components';
import type { SiteKey } from '@/sites/registry';

/**
 * Hand-picked article cards for a homepage block: the slug paths are looked up
 * in the brand's content, so a renamed or drafted page is skipped (never a
 * dead card). `eyebrow` labels a card with its topic.
 */
export function curatedArticles(site: SiteKey, picks: { slugPath: string; eyebrow?: string; image?: string }[]): ArticleCard[] {
  return picks.flatMap(({ slugPath, eyebrow, image }) => {
    const post = getPage(site, slugPath);
    if (!post || post.frontmatter.draft) return [];
    return [{
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      href: contentHref(site, post.slugPath),
      hub: post.hub,
      eyebrow,
      image,
    }];
  });
}
