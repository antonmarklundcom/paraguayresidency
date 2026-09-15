'use server';

import { revalidatePath } from 'next/cache';
import { currentMember } from '@/lib/member-auth';
import { entitlementFor } from '@/lib/entitlements';
import { lessonView, markLessonComplete } from '@/lib/member-content';

/**
 * Marks the current member's progress on one lesson (plan §6.9 — the
 * "O9 server action" the plan assumed existed; nothing under §5.4 built one,
 * so this is the small addition, recorded in the S14 build log). Everything
 * is re-derived from the signed-in session rather than trusted from the
 * client: a request for a lesson the member cannot see writes nothing.
 */
export async function completeLessonAction(formData: FormData): Promise<void> {
  const moduleSlug = String(formData.get('moduleSlug') ?? '');
  const lessonSlug = String(formData.get('lessonSlug') ?? '');
  if (!moduleSlug || !lessonSlug) return;

  const user = await currentMember();
  if (!user) return;

  const entitlement = await entitlementFor(user);
  const view = await lessonView({
    site: 'guide',
    moduleSlug,
    lessonSlug,
    userId: user.id,
    tier: entitlement.tier,
    firstEntitledAt: entitlement.firstEntitledAt,
  });
  if (!view || !view.unlocked) return;

  await markLessonComplete(user.id, view.lesson.id);
  revalidatePath(`/members/${moduleSlug}/${lessonSlug}`);
  revalidatePath('/members');
}
