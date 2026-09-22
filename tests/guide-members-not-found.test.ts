import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import GuideLayout from '@/app/(en)/sites/guide/layout';
import NotFound from '@/app/(en)/sites/guide/members/not-found';
import { t } from '@/i18n';

it('renders the member lesson 404 in the guide shell with a return to members', () => {
  const html = renderToStaticMarkup(GuideLayout({
    children: createElement(NotFound),
  }));
  expect(html).toContain('data-site="guide"');
  expect(html).toContain('data-theme="guide"');
  expect(html.match(/<nav\b/g)).toHaveLength(1);
  expect(html.match(/<footer\b/g)).toHaveLength(1);
  expect(html).toContain(t('guide', 'notFound.title'));
  expect(html).toContain(t('guide', 'notFound.body'));
  expect(html).toMatch(/<a[^>]*href="\/members"[^>]*>Back to your modules<\/a>/);
});
