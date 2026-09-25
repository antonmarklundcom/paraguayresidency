import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { ABHeroCta } from '@/components/ABHeroCta';

/**
 * `useABVariant` only assigns a variant in a `useEffect`, which never runs
 * during static/SSR rendering — the same pattern `ProgressiveForm` relies on
 * (`tests/progressive-query.test.ts`). So the server output (and the very
 * first client render, before hydration effects fire) must always be
 * `variants[0]`: that is what makes this test additive rather than a
 * regression risk on first paint for every visitor, JS or no JS.
 */
it('renders the pre-existing control copy on first render, with no JS required to see or use the CTA', () => {
  const html = renderToStaticMarkup(createElement(ABHeroCta, { href: '/route-finder' }));
  expect(html).toContain('Find your route');
  expect(html).toContain('href="/route-finder"');
});
