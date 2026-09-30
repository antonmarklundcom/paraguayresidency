'use client';

import { useEffect, useState } from 'react';
import { track } from './analytics';
import { ASSIGNMENT_MAX_AGE_S, assignmentCookie, exposureCookie, getExperiment, isVariant } from './experiments';

/**
 * The client half of an A/B test (O24, item 10; `src/lib/experiments.ts` has
 * the whole design). The variant is ASSIGNED on the server — `src/proxy.ts`
 * sets `ab_<id>` on the first page view — so every visit, every form and the
 * admin readout agree on it. This hook only reads that cookie, renders the
 * variant, and records the EXPOSURE (`abx_<id>`), which is what leads and
 * WhatsApp clicks are attributed to.
 *
 * Trade-off, accepted deliberately: pages are ISR-cached HTML shared by every
 * visitor, so the first paint is always `variants[0]` (server and first client
 * render agree, so hydration never mismatches), then swaps after mount. A
 * visitor with JavaScript off sees the control and is recorded as no exposure,
 * which is correct: they were never shown the test. A visitor with no
 * assignment cookie (the proxy did not run, cookies blocked) sees the control
 * and is not counted either.
 */
export function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function useABVariant<T extends string>(experimentId: string, variants: readonly [T, ...T[]]): T {
  const [variant, setVariant] = useState<T>(variants[0]);

  useEffect(() => {
    const experiment = getExperiment(experimentId);
    const assigned = readCookie(assignmentCookie(experimentId));
    if (!experiment || !isVariant(experiment, assigned) || !(variants as readonly string[]).includes(assigned)) return;
    try {
      document.cookie = `${exposureCookie(experimentId)}=${encodeURIComponent(assigned)}; path=/; max-age=${ASSIGNMENT_MAX_AGE_S}; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
    } catch {
      // Cookies disabled: the visitor still sees the variant, it is just not attributed.
    }
    // Syncing from an external system (the cookie) after mount, exactly to avoid a
    // hydration mismatch (`variants[0]` must be what both server and first client render show).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVariant(assigned as T);
    track('ab_view', { test: experimentId, variant: assigned });
    // Only ever runs once per mount per experiment — a variant, once assigned, never changes mid-visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  return variant;
}
