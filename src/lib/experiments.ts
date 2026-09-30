import type { SiteKey } from '@/sites/registry';

/**
 * A/B experiments (O24, item 10). Pure and dependency-free: the proxy, the
 * server actions and the client component all read this one table.
 *
 * How a test runs:
 *  1. ASSIGNMENT is server-side. `src/proxy.ts` sets `ab_<id>` (random,
 *     90 days) on the first page view of a brand the experiment runs on, so a
 *     visitor keeps one variant across visits and the server can read it.
 *  2. EXPOSURE is recorded by the page that renders the variant: the
 *     component shows the assigned variant and writes `abx_<id>`. Pages are
 *     ISR-cached HTML shared by every visitor, so the server cannot render a
 *     per-visitor variant without making the page dynamic; the component
 *     swaps after mount (the flash trade-off `useABVariant` documents).
 *  3. Leads and WhatsApp clicks store only EXPOSED variants (`abx_*`). A
 *     visitor who was assigned but never saw the test — never reached the
 *     page, or had JavaScript off and so saw the control — is not in it.
 */

export interface Experiment {
  id: string;
  /** Brands whose page views get an assignment. */
  sites: readonly SiteKey[];
  variants: readonly [string, ...string[]];
}

export const EXPERIMENTS: readonly Experiment[] = [
  // Hub homepage hero CTA: does naming the time cost lift Route Finder clicks?
  { id: 'hero_cta', sites: ['residency'], variants: ['find_route', 'two_minutes'] },
];

export const ASSIGNMENT_MAX_AGE_S = 90 * 86_400;

export const assignmentCookie = (id: string) => `ab_${id}`;
export const exposureCookie = (id: string) => `abx_${id}`;

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS.find((experiment) => experiment.id === id);
}

export function isVariant(experiment: Experiment, value: string | null | undefined): value is string {
  return typeof value === 'string' && experiment.variants.includes(value);
}

/**
 * Experiments this brand runs that the visitor has no valid assignment for
 * yet, each with a freshly drawn variant. `random` is injectable for tests.
 */
export function newAssignments(
  site: SiteKey,
  readCookie: (name: string) => string | undefined,
  random: () => number = Math.random,
): { id: string; cookie: string; variant: string }[] {
  const out: { id: string; cookie: string; variant: string }[] = [];
  for (const experiment of EXPERIMENTS) {
    if (!experiment.sites.includes(site)) continue;
    const cookie = assignmentCookie(experiment.id);
    if (isVariant(experiment, readCookie(cookie))) continue;
    const index = Math.min(Math.floor(random() * experiment.variants.length), experiment.variants.length - 1);
    out.push({ id: experiment.id, cookie, variant: experiment.variants[index] });
  }
  return out;
}

/** `{ experimentId: variant }` for every experiment the visitor was exposed to. */
export function readExposures(readCookie: (name: string) => string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const experiment of EXPERIMENTS) {
    const value = readCookie(exposureCookie(experiment.id));
    if (isVariant(experiment, value)) out[experiment.id] = value;
  }
  return out;
}

/** `{hero_cta: 'two_minutes'}` → `hero_cta:two_minutes` (the `site_events.variant` form). */
export function exposureLabel(exposures: Record<string, string>): string | null {
  const pairs = Object.entries(exposures);
  return pairs.length ? pairs.map(([id, variant]) => `${id}:${variant}`).join(',') : null;
}
