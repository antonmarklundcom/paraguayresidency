import 'server-only';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { frontmatterSchema, type Frontmatter } from '@/content/schema';

/**
 * The free Spanish guide on residenciaenparaguay.es, the brand's lead magnet.
 * Its chapters live in the reserved `members` hub, so `getPages()` never lists
 * them, the sitemap never carries them and no `/guias/…` URL can reach them.
 * They are read here, by file, for `/guia-gratis/leer` only.
 */
const DIR = join(process.cwd(), 'content', 'residenciaes', 'members', 'guia-gratis');

export const FREE_GUIDE_PATH = '/guia-gratis';
export const FREE_GUIDE_READ_PATH = '/guia-gratis/leer';

export interface FreeGuideChapter {
  /** `paraguay-es-para-ti`: the file name without its order prefix, used as the anchor. */
  id: string;
  frontmatter: Frontmatter;
  body: string;
}

export function freeGuideChapters(): FreeGuideChapter[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((file) => file.endsWith('.mdx'))
    .sort()
    .map((file) => {
      const { data, content } = matter(readFileSync(join(DIR, file), 'utf8'));
      const parsed = frontmatterSchema.safeParse(data);
      if (!parsed.success || parsed.data.site !== 'residenciaes' || parsed.data.hub !== 'members') {
        throw new Error(`Invalid frontmatter in content/residenciaes/members/guia-gratis/${file}`);
      }
      return { id: file.replace(/^\d+-/, '').replace(/\.mdx$/, ''), frontmatter: parsed.data, body: content };
    });
}
