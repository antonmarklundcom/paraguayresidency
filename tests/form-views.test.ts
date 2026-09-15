import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { LeadFormFields, type LeadFormLabels } from '@/components/LeadFormFields';
import { NewsletterFormFields } from '@/components/NewsletterFormFields';
import { MagicLinkFormFields } from '@/components/MagicLinkFormFields';

const labels: LeadFormLabels = {
  name: 'Name', email: 'Email', phone: 'Phone', whatsapp: 'WhatsApp', country: 'Country', nationality: 'Nationality',
  message: 'Message', investmentRange: 'Range', investmentRoute: 'Route', submit: 'Send', sending: 'Sending',
  successTitle: 'Got it', successBody: 'We will reply.', optional: 'Optional', choose: 'Choose',
  investmentRanges: { under_50k: 'Under', band_50k_150k: 'Middle', over_150k: 'Over', undecided: 'Undecided' }, investmentRoutes: [],
};
const action = async () => {};
const common = { site: 'frontier' as const, timestamp: 'fixture', pagePath: '/contact', id: 'form-test', labels, action, countryOptions: createElement('option', { value: 'PY' }, 'Paraguay') };
it('server renders just name, WhatsApp and one text line for the short variant', () => {
  const html = renderToStaticMarkup(createElement(LeadFormFields, { ...common, variant: 'whatsapp' }));
  expect(html).toContain('name="kind" value="whatsapp"');
  expect(html).toContain('name="name"');
  expect(html).toContain('name="whatsapp"');
  expect(html).toContain('name="message"');
  expect(html).not.toMatch(/name="(?:email|phone|country|nationality)"|<textarea|<select/);
  expect(html.match(/<form/g)).toHaveLength(1);
});
it('consultation renders the server-provided options in both country selects', () => {
  const html = renderToStaticMarkup(createElement(LeadFormFields, { ...common, variant: 'consultation' }));
  expect(html.match(/<option value="PY">Paraguay<\/option>/g)).toHaveLength(2);
});
it('the enhanced view retains field errors and pending-state button behavior', () => {
  const html = renderToStaticMarkup(createElement(LeadFormFields, { ...common, variant: 'contact', pending: true, state: { status: 'error', errors: { email: 'Invalid email' } } }));
  expect(html).toContain('aria-invalid="true"');
  expect(html).toContain('Invalid email');
  expect(html).toContain('disabled=""');
  expect(html).toContain('Sending');
});
it('all success views replace their form rather than duplicate it', () => {
  const views = [
    createElement(LeadFormFields, { ...common, variant: 'contact', state: { status: 'ok' } }),
    createElement(NewsletterFormFields, { site: 'guide', timestamp: 'fixture', id: 'newsletter', source: 'inline', action, labels: { email: 'Email', submit: 'Subscribe', sending: 'Sending', note: 'Confirm' }, state: { status: 'ok', message: 'Check your inbox' } }),
    createElement(MagicLinkFormFields, { site: 'guide', timestamp: 'fixture', id: 'magic', action, labels: { email: 'Email', submit: 'Send', sending: 'Sending', sentTitle: 'Check your inbox', sentBody: 'Use the link' }, state: { status: 'ok' } }),
  ];
  for (const view of views) {
    const html = renderToStaticMarkup(view);
    expect(html).toContain('role="status"');
    expect(html).not.toContain('<form');
  }
});
