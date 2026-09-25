'use client';

import { useEffect, useState } from 'react';
import { track } from './analytics';

/**
 * Minimal client-side A/B test assignment — no middleware, no cookies, no
 * schema (plan §4.7 keeps all three off-limits to Sonnet work). A visitor is
 * assigned a variant once, persisted in `localStorage`, and the assignment
 * is reported as a Plausible custom event (`ab_view`) with `test` and
 * `variant` props, so results are readable from the existing Plausible
 * dashboard without a new analytics system.
 *
 * Trade-off, accepted deliberately: the first paint always renders
 * `variants[0]` (both for SSR and for the first client render, so hydration
 * never mismatches), then swaps to the assigned variant after mount. A
 * returning visitor with a stored assignment sees a one-frame flash back to
 * their real variant; a new visitor has a roughly 50% chance the first paint
 * already matches. This is the correct trade-off for a lightweight test —
 * a flash of copy is cheap, a hydration mismatch or a new cookie/middleware
 * dependency is not.
 */
export function useABVariant<T extends string>(testId: string, variants: readonly [T, ...T[]]): T {
  const [variant, setVariant] = useState<T>(variants[0]);

  useEffect(() => {
    const key = `ab:${testId}`;
    let assigned: string | null = null;
    try {
      assigned = localStorage.getItem(key);
    } catch {
      // Private browsing or storage disabled — fall back to a fresh assignment every visit.
    }
    if (!assigned || !(variants as readonly string[]).includes(assigned)) {
      assigned = variants[Math.floor(Math.random() * variants.length)];
      try {
        localStorage.setItem(key, assigned);
      } catch {
        // Assignment still works for this page view even if it can't persist.
      }
    }
    // Syncing from an external system (localStorage) read after mount, exactly to avoid a
    // hydration mismatch (`variants[0]` must be what both server and first client render show).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVariant(assigned as T);
    track('ab_view', { test: testId, variant: assigned });
    // Only ever runs once per mount per testId — a variant, once assigned, never changes mid-visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  return variant;
}
