import About0 from '@/app/(en)/sites/residency/about/page';
import About1 from '@/app/(en)/sites/investorpass/about/page';
import About2 from '@/app/(en)/sites/frontier/about/page';
import About3 from '@/app/(en)/sites/guide/about/page';
import About4 from '@/app/(es)/sites/residenciaes/nosotros/page';
import About5 from '@/app/(pt)/sites/residenciapt/sobre/page';
import About6 from '@/app/(sv)/sites/flytta/var-historia/page';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { t, localeFor } from '@/i18n';
import { facts, factText, type Fact, type FactKey } from '@content/shared/facts';
import Page0 from '@/app/(en)/sites/residency/residency/temporary-residency/page';
import Page1 from '@/app/(en)/sites/residency/residency/permanent-residency/page';
import Page2 from '@/app/(en)/sites/residency/residency/cedula/page';
import Page3 from '@/app/(en)/sites/residency/residency/tax-residency/page';
import Page4 from '@/app/(en)/sites/residency/residency/family/page';
import Page5 from '@/app/(en)/sites/residency/investor-pass/page';
import Page6 from '@/app/(en)/sites/residency/process/page';
import Page7 from '@/app/(es)/sites/residenciaes/residencia/temporal/page';
import Page8 from '@/app/(es)/sites/residenciaes/residencia/permanente/page';
import Page9 from '@/app/(es)/sites/residenciaes/residencia/cedula/page';
import Page10 from '@/app/(es)/sites/residenciaes/residencia-fiscal/page';
import Page11 from '@/app/(es)/sites/residenciaes/familia/page';
import Page12 from '@/app/(es)/sites/residenciaes/mercosur/page';
import Page13 from '@/app/(es)/sites/residenciaes/pase-inversor/page';
import Page14 from '@/app/(es)/sites/residenciaes/proceso/page';
import Page15 from '@/app/(pt)/sites/residenciapt/residencia/temporaria/page';
import Page16 from '@/app/(pt)/sites/residenciapt/residencia/permanente/page';
import Page17 from '@/app/(pt)/sites/residenciapt/residencia/cedula/page';
import Page18 from '@/app/(pt)/sites/residenciapt/residencia-fiscal/page';
import Page19 from '@/app/(pt)/sites/residenciapt/familia/page';
import Page20 from '@/app/(pt)/sites/residenciapt/mercosul/page';
import Page21 from '@/app/(pt)/sites/residenciapt/investor-pass/page';
import Page22 from '@/app/(pt)/sites/residenciapt/processo/page';
import Page23 from '@/app/(sv)/sites/flytta/uppehallstillstand/page';
import Page24 from '@/app/(sv)/sites/flytta/skatt/page';
import Page25 from '@/app/(sv)/sites/flytta/familj/page';
import Page26 from '@/app/(sv)/sites/flytta/process/page';
import Page27 from '@/app/(en)/sites/frontier/routes/page';
import Page28 from '@/app/(en)/sites/frontier/tax/page';
import Page29 from '@/app/(en)/sites/frontier/process/page';
import Page30 from '@/app/(en)/sites/investorpass/page';
import Page31 from '@/app/(en)/sites/investorpass/investor-pass/process/page';
import Page32 from '@/app/(en)/sites/investorpass/investor-pass/requirements/page';
import Page33 from '@/app/(en)/sites/investorpass/investor-pass/investment-routes/page';
import Page34 from '@/app/(en)/sites/investorpass/investor-pass/for-agents/page';
import Page35 from '@/app/(en)/sites/investorpass/investor-pass/vs-standard-residency/page';
import Page36 from '@/app/(es)/sites/residenciaes/page';
import Page37 from '@/app/(es)/sites/residenciaes/contact/page';
import Page38 from '@/app/(pt)/sites/residenciapt/page';
import Page39 from '@/app/(pt)/sites/residenciapt/contact/page';
import Page40 from '@/app/(en)/sites/frontier/page';
import Page41 from '@/app/(en)/sites/frontier/contact/page';
import Page42 from '@/app/(sv)/sites/flytta/page';
import Page43 from '@/app/(sv)/sites/flytta/contact/page';

// Render real LeadForm and LeadFormFields. Only replace request/action boundaries;
// no submission, database, timestamp signing, or request context is needed here.
vi.mock('@/components/ProgressiveForm', () => ({ ProgressiveForm: ({ base }: { base: ReactNode }) => base }));
vi.mock('@/lib/form-guard', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/form-guard')>(), issueFormTimestamp: () => 'test-timestamp',
}));
vi.mock('@/app/actions/lead', () => ({ submitLeadFormAction: async () => {} }));

const services = [{ site: 'residency', path: '/residency/temporary-residency', route: 'temporary', Page: Page0 },
{ site: 'residency', path: '/residency/permanent-residency', route: 'permanent', Page: Page1 },
{ site: 'residency', path: '/residency/cedula', route: 'cedula', Page: Page2 },
{ site: 'residency', path: '/residency/tax-residency', route: 'tax', Page: Page3 },
{ site: 'residency', path: '/residency/family', route: 'family', Page: Page4 },
{ site: 'residency', path: '/investor-pass', route: 'investor', Page: Page5 },
{ site: 'residency', path: '/process', route: 'standard', Page: Page6 },
{ site: 'residenciaes', path: '/residencia/temporal', route: 'temporary', Page: Page7 },
{ site: 'residenciaes', path: '/residencia/permanente', route: 'permanent', Page: Page8 },
{ site: 'residenciaes', path: '/residencia/cedula', route: 'cedula', Page: Page9 },
{ site: 'residenciaes', path: '/residencia-fiscal', route: 'tax', Page: Page10 },
{ site: 'residenciaes', path: '/familia', route: 'family', Page: Page11 },
{ site: 'residenciaes', path: '/mercosur', route: 'standard', Page: Page12 },
{ site: 'residenciaes', path: '/pase-inversor', route: 'investor', Page: Page13 },
{ site: 'residenciaes', path: '/proceso', route: 'standard', Page: Page14 },
{ site: 'residenciapt', path: '/residencia/temporaria', route: 'temporary', Page: Page15 },
{ site: 'residenciapt', path: '/residencia/permanente', route: 'permanent', Page: Page16 },
{ site: 'residenciapt', path: '/residencia/cedula', route: 'cedula', Page: Page17 },
{ site: 'residenciapt', path: '/residencia-fiscal', route: 'tax', Page: Page18 },
{ site: 'residenciapt', path: '/familia', route: 'family', Page: Page19 },
{ site: 'residenciapt', path: '/mercosul', route: 'standard', Page: Page20 },
{ site: 'residenciapt', path: '/investor-pass', route: 'investor', Page: Page21 },
{ site: 'residenciapt', path: '/processo', route: 'standard', Page: Page22 },
{ site: 'flytta', path: '/uppehallstillstand', route: 'standard', Page: Page23 },
{ site: 'flytta', path: '/skatt', route: 'tax', Page: Page24 },
{ site: 'flytta', path: '/familj', route: 'family', Page: Page25 },
{ site: 'flytta', path: '/process', route: 'standard', Page: Page26 },
{ site: 'frontier', path: '/routes', route: 'standard', Page: Page27 },
{ site: 'frontier', path: '/tax', route: 'tax', Page: Page28 },
{ site: 'frontier', path: '/process', route: 'standard', Page: Page29 },
{ site: 'investorpass', path: '/', route: 'investor', Page: Page30 },
{ site: 'investorpass', path: '/investor-pass/process', route: 'investor', Page: Page31 },
{ site: 'investorpass', path: '/investor-pass/requirements', route: 'investor', Page: Page32 },
{ site: 'investorpass', path: '/investor-pass/investment-routes', route: 'investor', Page: Page33 },
{ site: 'investorpass', path: '/investor-pass/for-agents', route: 'investor', Page: Page34 },
{ site: 'investorpass', path: '/investor-pass/vs-standard-residency', route: 'investor', Page: Page35 }] as const;
const forms = [{ site: 'residenciaes', path: '/', Page: Page36 },
{ site: 'residenciaes', path: '/contact', Page: Page37 },
{ site: 'residenciapt', path: '/', Page: Page38 },
{ site: 'residenciapt', path: '/contact', Page: Page39 },
{ site: 'frontier', path: '/', Page: Page40 },
{ site: 'frontier', path: '/contact', Page: Page41 },
{ site: 'flytta', path: '/', Page: Page42 },
{ site: 'flytta', path: '/contact', Page: Page43 }] as const;

for (const { site, path, route, Page } of services) {
  it(site + path + ' renders the timeline and existing team framing', () => {
    const html = renderToStaticMarkup(createElement(Page));
    const timeline = html.match(/<section aria-label="[^"]+" class="not-prose[\s\S]*?<\/section>/g);
    expect(timeline).toHaveLength(1);
    const block = timeline![0];
    expect(block).toContain(t(site, 'process.trustBody'));
    expect(block).toContain('<ol');
    expect(block).toContain(t(site, 'process.fileBody'));
    const key = route === 'tax' ? 'tax.timeline' : route === 'investor' ? 'investorpass.timeline' : route === 'cedula' ? 'cedula.timeline' : 'residency.timeline';
    expect(block).toContain('data-fact="' + key + '" data-verified="false"');
    expect(block).toContain(factText(key, localeFor(site)));
    if (route === 'tax') expect(block).not.toContain('data-fact="cedula.timeline"');
    if (['temporary', 'permanent', 'standard'].includes(route)) expect(block).toContain('data-fact="temporary.duration"');
    else expect(block).not.toContain('data-fact="temporary.duration"');
    expect(block).not.toMatch(/<blockquote|testimonial|reviewRating|aggregateRating/i);
  });
}

for (const { site, path, Page } of forms) {
  it(site + path + ' shows one lead submit outside a closed WhatsApp disclosure', () => {
    const html = renderToStaticMarkup(createElement(Page));
    const rendered = html.match(/<form\b[\s\S]*?<\/form>/g)!;
    const short = rendered.filter(form => form.includes('name="kind" value="whatsapp"'));
    const full = rendered.filter(form => /name="kind" value="(?:contact|consultation)"/.test(form));
    expect(short).toHaveLength(1);
    expect(full).toHaveLength(1);
    expect(full[0]).toContain('name="email"');
    expect(full[0]).toContain('<textarea');
    expect(short[0]).not.toMatch(/name="(?:email|phone|country|nationality)"|<textarea|<select/);
    for (const field of ['name', 'whatsapp', 'message']) expect(short[0]).toContain('name="' + field + '"');
    for (const form of [full[0], short[0]]) {
      expect(form).toContain('name="site" value="' + site + '"');
      expect(form).toContain('name="pagePath" value="' + path + '"');
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain(t(site, 'process.whatsappIntro'));
    const disclosures = html.match(/<details\b[\s\S]*?<\/details>/g)!.filter(block => block.includes(t(site, 'form.whatsappAlternative')));
    expect(disclosures).toHaveLength(1);
    expect(disclosures[0]).not.toMatch(/<details[^>]*\bopen/);
    expect(disclosures[0]).toContain(short[0]);
    expect(disclosures[0]).toContain(t(site, 'form.whatsappAlternative'));
    expect(disclosures[0]).toContain('min-h-[44px]');
    const outside = html.replace(/<details\b[\s\S]*?<\/details>/g, '');
    const outsideLeads = outside.match(/<form\b[\s\S]*?<\/form>/g)!.filter(form => form.includes('name="kind"'));
    expect(outsideLeads).toHaveLength(1);
    expect(outsideLeads[0].match(/<button[^>]*type="submit"/g)).toHaveLength(1);
  });
}

for (const key of ['cedula.timeline', 'temporary.duration', 'residency.timeline', 'tax.timeline', 'investorpass.timeline'] as const) {
  it(key + ' uses hedged text in every locale and picks up verified updates', () => {
    for (const site of ['residency', 'residenciaes', 'residenciapt', 'flytta'] as const) {
      const fact = facts[key] as Fact;
      expect(fact.verified).toBe(false);
      expect(fact.hedged).toHaveProperty(localeFor(site));
      const route = key === 'tax.timeline' ? 'tax' : key === 'investorpass.timeline' ? 'investor' : 'temporary';
      const original = { verified: fact.verified, display: fact.display };
      try {
        fact.verified = true;
        fact.display = { en: 'EN verified window', es: 'ES plazo verificado', pt: 'PT prazo verificado', sv: 'SV verifierad tidsram' };
        const html = renderToStaticMarkup(createElement(ProcessTimeline, { site, route }));
        expect(html).toContain('data-fact="' + key + '" data-verified="true"');
        expect(html).toContain(factText(key as FactKey, localeFor(site)));
      } finally { Object.assign(fact, original); }
    }
  });
}

for (const { site, Page } of [{ site: 'residency', Page: About0 }, { site: 'investorpass', Page: About1 }, { site: 'frontier', Page: About2 }, { site: 'guide', Page: About3 }, { site: 'residenciaes', Page: About4 }, { site: 'residenciapt', Page: About5 }, { site: 'flytta', Page: About6 }] as const) {
  it(site + ' introduces the named team', () => {
    const html = renderToStaticMarkup(createElement(Page));
    expect(html).toContain(t(site, 'about.teamTitle'));
    expect(html).toContain(t(site, 'about.teamBody'));
    for (const name of ['Anton Marklund', 'Yanina Alvarez', 'Diana Davalos']) {
      expect(html).toContain('<li>' + name + '</li>');
      expect(t(site, 'process.trustBody')).toContain(name);
    }
  });
}
for (const { site, path, Page } of forms) {
  // WhatsApp-first since 2026-09-24 (no booked calls): the direct chat link is
  // offered openly next to the form, and the disclosure still pairs it with
  // the short leave-your-number form.
  it(site + path + ' offers the direct chat link openly and inside the disclosure', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '595981123456');
    try {
      const html = renderToStaticMarkup(createElement(Page));
      const disclosure = html.match(/<details\b[\s\S]*?<\/details>/g)!.find(block => block.includes(t(site, 'form.whatsappAlternative')))!;
      expect(disclosure).toContain('https://wa.me/595981123456');
      expect(disclosure.indexOf('https://wa.me/')).toBeLessThan(disclosure.indexOf('<form'));
      expect(html.replace(disclosure, '')).toContain('https://wa.me/595981123456');
    } finally { vi.unstubAllEnvs(); }
  });
}
