'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import type { SiteKey } from '@/sites/registry';
import type { Route } from '@/features/quiz/scoring';

/** Only the resolved route crosses this boundary; no answers or query string. */
export function QuizCompleted({ site, route }: { site: SiteKey; route: Route }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track('quiz_completed', { site, route });
  }, [site, route]);
  return null;
}
