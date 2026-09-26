import { z } from 'zod';
import { SITE_KEYS } from '@/sites/registry';
import { TEAM_KEYS } from './team';

/** Typed frontmatter for every MDX file under `content/<site>/…` (plan §3). */
export const frontmatterSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(200),
  site: z.enum(SITE_KEYS as unknown as [string, ...string[]]),
  hub: z.string().min(1),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  draft: z.boolean().optional().default(false),
  faq: z
    .array(z.object({ question: z.string().min(5), answer: z.string().min(5) }))
    .optional()
    .default([]),
  related: z.array(z.string()).optional().default([]),
  /**
   * The direct answer, 40–90 words, rendered in a box above the body. This is
   * the paragraph an answer engine lifts, so it states the answer first and
   * may use `<Fact>`-free plain wording only (figures belong in the body).
   */
  summary: z.string().min(40).max(700).optional(),
  /** 3–6 one-line bullets rendered as "Key takeaways" after the body. */
  takeaways: z.array(z.string().min(10).max(240)).max(8).optional().default([]),
  /** Team member keys from `src/content/team.ts`. */
  author: z.enum(TEAM_KEYS).optional().default('anton'),
  reviewedBy: z.enum(TEAM_KEYS).optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
