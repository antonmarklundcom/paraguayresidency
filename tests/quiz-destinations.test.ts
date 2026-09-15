import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { QuizResultView } from '@/features/quiz/ResultView';
import { ROUTE_DESTINATIONS } from '@/features/quiz/questions';
import { ROUTES } from '@/features/quiz/scoring';
import { getSite, SITE_KEYS, siteOrigin, type SiteKey } from '@/sites/registry';
import { t } from '@/i18n';

vi.mock('@/components/LeadForm', () => ({ LeadForm: () => null }));

const expected: Record<SiteKey, [SiteKey, string, string]> = {
  residency: ['residency', '/residency/temporary-residency', '/residency/permanent-residency'],
  investorpass: ['residency', '/residency/temporary-residency', '/residency/permanent-residency'],
  guide: ['residency', '/residency/temporary-residency', '/residency/permanent-residency'],
  frontier: ['frontier', '/routes#temporary', '/routes#permanent'],
  residenciaes: ['residenciaes', '/residencia/temporal', '/residencia/permanente'],
  residenciapt: ['residenciapt', '/residencia/temporaria', '/residencia/permanente'],
  flytta: ['flytta', '/uppehallstillstand', '/uppehallstillstand'],
};

for (const site of SITE_KEYS) {
  it(`${site} recommends its owned pages or hub fallback and the Investor Pass brand`, () => {
    for (const route of ROUTES) {
      const [standardOwner, temporary, permanent] = expected[site];
      const owner = route === 'investor-pass' ? 'investorpass' : standardOwner;
      const path = route === 'investor-pass' ? '/investor-pass/requirements'
        : route === 'temporary' ? temporary : permanent;
      expect(ROUTE_DESTINATIONS[site][route]).toMatchObject({ site: owner, path });
      const href = owner === site ? path : `${siteOrigin(owner)}${path}`;
      const html = renderToStaticMarkup(createElement(QuizResultView, {
        site, route, encoded: '', empty: false,
      }));
      const link = html.match(/<a\s[^>]*>/g)?.find(tag => tag.includes(`href="${href}"`));
      expect(link).toBeDefined();
      expect(link!.includes('rel="noopener"')).toBe(owner !== site);
      const sibling = t(site, 'quiz.result.sibling', { brand: getSite(owner).name });
      expect(html.includes(sibling)).toBe(owner !== site);

      const [pathname, fragment] = path.split('#');
      const source = readFileSync(`src/app/(${getSite(owner).locale})/sites/${owner}${pathname}/page.tsx`, 'utf8');
      if (fragment) expect(source).toContain(`id="${fragment}"`);
    }
  });
}
