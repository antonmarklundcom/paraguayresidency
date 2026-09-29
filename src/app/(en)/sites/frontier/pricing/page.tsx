import type { Metadata } from 'next';
import { AfterYouMessage, Band, Breadcrumbs, Button, Eyebrow, Fact, Guarantee, LeadPanel, PriceTable, SectionHeader } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/pricing';
const MESSAGE = 'Hi — I would like a quote for a second residency in Paraguay.';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency Pricing for a Plan B — Fixed Fees',
    description:
      'What a plan-B residency in Paraguay costs: fixed fees, quoted in writing for your case before you commit, with exact figures confirmed on your call.',
    path: PATH,
  });
}

const EXTRAS = [
  {
    id: 'tax_residency',
    title: 'Tax residency and RUC',
    href: '/tax',
    fee: 'pricing.tax_residency' as const,
    covers: 'We register your RUC and explain the territorial system in general terms, coordinating the administrative work with your residency filing.',
    quote: 'Tell us your planned activity and the RUC work you need; we quote it in writing. Your own accountant handles advice about obligations in your home country.',
  },
  {
    id: 'family',
    title: 'Family filing',
    href: '/routes',
    fee: 'pricing.family' as const,
    covers: 'We coordinate the document checklist for each relative, clarify who can apply as a dependent and schedule family appointments together where the office permits. Each person still needs their own file.',
    quote: 'Tell us about each family member and their documents; we quote the additional-person service in writing alongside the primary applicant and identify exactly who is covered.',
  },
];

export default function Page() {
  return (
    <>
      <Band labelledBy="pricing-heading">
        <Breadcrumbs site="frontier" items={[{ label: 'Pricing', href: PATH }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h1 id="pricing-heading" className="mt-5 font-[family-name:var(--display-font)] text-(length:--step-5) leading-[1.02] text-balance">
              Know the service fee before building your Paraguay plan B
            </h1>
          </div>
          <div>
            <p className="text-(length:--step-0) leading-relaxed text-[var(--fg-muted)]">
              For Americans and expats keeping Paraguay as an option, the quote starts with your nationality, documents, route and travel plans.
              We agree the work and fixed service fee before you commit. Your checklist and who is applying set the scope, so a self-service
              calculator cannot replace that conversation.
            </p>
            <div data-service-cta className="mt-6 flex flex-wrap gap-3">
              <Button href="#inquiry">Get your written quote</Button>
              <Button href="/route-finder" variant="secondary">Find your route</Button>
            </div>
          </div>
        </div>
      </Band>

      <PriceTable site="frontier" tone="alt" />

      <Band labelledBy="extras-title">
        <SectionHeader id="extras-title" eyebrow="Also quoted" title="Tax ID and family filing" intro="These sit beside a residency filing and are quoted the same way: in writing, before you commit." />
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {EXTRAS.map((extra) => (
            <li key={extra.id} id={extra.id} className="scroll-mt-24 border-t-2 border-[var(--fg)] bg-[var(--surface)] p-6 sm:p-8">
              <h3 className="font-[family-name:var(--display-font)] text-(length:--step-2) leading-tight">
                <a href={extra.href} className="hover:text-[var(--accent)]">{extra.title}</a>
              </h3>
              <p className="mt-4 font-medium">Service fee: <Fact k={extra.fee} site="frontier" /></p>
              <dl className="mt-4 space-y-4 leading-relaxed">
                <div><dt className="font-semibold">What the fixed fee covers</dt><dd className="mt-1 text-[var(--fg-muted)]">{extra.covers}</dd></div>
                <div><dt className="font-semibold">How we quote it</dt><dd className="mt-1 text-[var(--fg-muted)]">{extra.quote}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <a href="/routes#investor-pass" className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4">
            Investor Pass work has its own scope and quote through our sibling brand. See the Investor Pass route.
          </a>
        </p>
      </Band>

      <Band tone="alt" labelledBy="terms-title" data-fee-terms>
        <SectionHeader id="terms-title" eyebrow="The small print, in plain words" title="What every fee covers, and what it never does" />
        <dl className="mt-12 grid gap-x-16 gap-y-8 md:grid-cols-3">
          <div>
            <dt className="font-[family-name:var(--display-font)] text-(length:--step-1)">What it covers</dt>
            <dd className="mt-2 leading-relaxed text-[var(--fg-muted)]">The agreed preparation, coordination and guidance for your route, as described above.</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--display-font)] text-(length:--step-1)">What it never covers</dt>
            <dd className="mt-2 leading-relaxed text-[var(--fg-muted)]">Government fees, apostilles and required translations are never included in our service fee. We identify which document costs apply to this application before you decide.</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--display-font)] text-(length:--step-1)">Who you pay</dt>
            <dd className="mt-2 leading-relaxed text-[var(--fg-muted)]">You pay the official application fees directly to the Paraguayan state, and apostilles and translations to their providers. You pay us for the preparation and coordination. Your own accountant&rsquo;s advice is separate; for RUC, we confirm in writing whether any official registration charge applies.</dd>
          </div>
        </dl>
      </Band>

      <AfterYouMessage site="frontier" message={MESSAGE} />
      <Guarantee site="frontier" tone="alt" />

      <LeadPanel
        site="frontier"
        variant="consultation"
        id="inquiry"
        pagePath={PATH}
        title="Get your written quote"
        intro="Tell us your nationality, route and timeline — on WhatsApp or the form. We confirm the service scope, then set out the fixed fee and separate costs in writing before you decide."
        whatsappMessage={MESSAGE}
      />
    </>
  );
}
