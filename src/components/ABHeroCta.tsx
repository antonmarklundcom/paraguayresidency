'use client';

import { Button } from './Button';
import { useABVariant } from '@/lib/ab-test';

const VARIANTS = ['find_route', 'two_minutes'] as const;

const COPY: Record<(typeof VARIANTS)[number], string> = {
  find_route: 'Find your route',
  two_minutes: 'Find your route in 2 minutes',
};

/**
 * First real use of `useABVariant` (plan follow-up, 2026-09-25): the hub
 * homepage's primary hero CTA, testing whether naming the time cost ("in 2
 * minutes") lifts click-through on the Route Finder over the plain label.
 * `find_route` is the pre-existing copy, so a visitor who lands on the
 * control sees no change from before this test started.
 */
export function ABHeroCta({ href }: { href: string }) {
  const variant = useABVariant('hero_cta_residency', VARIANTS);
  return <Button href={href}>{COPY[variant]}</Button>;
}
