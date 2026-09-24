import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import Home from '@/app/(es)/sites/residenciaes/page';
import Contact from '@/app/(es)/sites/residenciaes/contact/page';
import Temporary from '@/app/(es)/sites/residenciaes/residencia/temporal/page';
import Permanent from '@/app/(es)/sites/residenciaes/residencia/permanente/page';
import Cedula from '@/app/(es)/sites/residenciaes/residencia/cedula/page';
import Family from '@/app/(es)/sites/residenciaes/familia/page';
import TaxResidency from '@/app/(es)/sites/residenciaes/residencia-fiscal/page';
import Routes from '@/app/(en)/sites/frontier/routes/page';
import Tax from '@/app/(en)/sites/frontier/tax/page';
import Why from '@/app/(en)/sites/frontier/why-paraguay/page';
import { sites } from '@/sites/registry';

// Forms use async server actions; isolate those from synchronous page rendering.
vi.mock('@/components/LeadForm', () => ({ LeadForm: () => null }));
// The contact page now renders the shared ContactPage (WhatsApp first, then the form).
vi.mock('@/lib/conversion-pages', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/conversion-pages')>()),
  contactMetadata: () => ({}),
}));
afterEach(() => vi.unstubAllEnvs());

for (const [name, Page] of Object.entries({ Home, Contact, Temporary, Permanent, Cedula, Family, TaxResidency })) {
  it(`${name} renders an encoded Spanish WhatsApp message when configured`, () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '+1 (202) 555-0100');
    const html = renderToStaticMarkup(createElement(Page));
    const href = html.match(/href="(https:\/\/wa\.me\/[^\"]+)"/)?.[1];
    expect(href).toBeDefined();
    const url = new URL(href!);
    expect(url.pathname).toBe('/12025550100');
    expect(url.searchParams.get('text')).toBe('Hola, me gustar\u00eda saber m\u00e1s sobre la residencia en Paraguay.');
  });
  it(`${name} renders cleanly without a WhatsApp number`, () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', undefined);
    const html = renderToStaticMarkup(createElement(Page));
    expect(html).toContain('<h1');
    expect(html).not.toContain('wa.me');
    expect(html).not.toMatch(/href="(?:null|undefined|)"/);
  });
}

for (const [path, Page] of [['/routes', Routes], ['/tax', Tax], ['/why-paraguay', Why]] as const) {
  it(`frontier ${path} emits Service JSON-LD with its canonical URL and provider`, () => {
    const html = renderToStaticMarkup(createElement(Page));
    const data = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const service = data.find(d => d['@type'] === 'Service');
    expect(service).toBeDefined();
    expect(service.url).toBe(`https://paraguayfrontier.com${path}`);
    expect(service.provider.name).toBe('Paraguay Frontier');
  });
}
it('ES and PT footers expose their orphan pages and article indexes', () => {
  for (const [site, paths] of [['residenciaes', ['/mercosur', '/pase-inversor', '/guias']], ['residenciapt', ['/precos', '/investor-pass', '/guias']]] as const) {
    const hrefs = sites[site].footer.columns.flatMap(c => c.items.map(i => i.href));
    for (const path of paths) expect(hrefs).toContain(path);
  }
});
