import { z } from 'zod';
import { SITE_KEYS } from '@/sites/registry';

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
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
