import { ProcessTimeline } from '@/components/ProcessTimeline';
import type { Metadata } from 'next';
import {
  HeroContact,
  Button,
  PhotoHero,
  heroTrust,
  IntentTiles,
  TeamStrip,
  Fact,
  FAQ,
  Heading,
  JsonLd,
  LeadForm,
  Disclosure,
  Section,
} from '@/components';
import { siteMetadata, serviceOfferJsonLd } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import { siteOrigin } from '@/sites/registry';

const PATH = '/';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Paraguay Investor Pass — Permanent Residency by Investment',
    description:
      'The Paraguay Investor Pass grants permanent residency to qualifying investors, skipping temporary residency. Routes, requirements and timeline.',
    path: PATH,
  });
}

const ROUTES = [
  {
    id: 'real_estate',
    eyebrow: 'Real estate',
    title: 'Property that qualifies',
    factKey: 'investorpass.route_real_estate_usd' as const,
  },
  {
    id: 'productive_business',
    eyebrow: 'Productive business',
    title: 'An operating business',
    factKey: 'investorpass.route_business_usd' as const,
  },
  {
    id: 'financial_instruments',
    eyebrow: 'Financial instruments',
    title: 'Qualifying instruments',
    factKey: 'investorpass.route_financial_usd' as const,
  },
  {
    id: 'tourism',
    eyebrow: 'Tourism',
    title: 'A tourism project',
    factKey: 'investorpass.route_tourism_usd' as const,
  },
];

const FAQ_ITEMS = [
  {
    question: 'Is the minimum investment fixed?',
    answer:
      'Do not assume the routes share a single minimum. We review the eligibility of your proposed investment and give you a written breakdown of the capital and documents your chosen route requires.',
  },
  {
    question: 'Does the Investor Pass really skip temporary residency?',
    answer:
      'Yes — that is its point. A qualifying investment lets you apply directly for permanent residency instead of serving the standard temporary stage first.',
  },
  {
    question: 'What if I am not sure which route fits?',
    answer:
      'Take the Route Finder, or send an inquiry with your rough capital and timeline. We tell you which of the four routes fits, or tell you honestly that the standard residency route is the better deal for your case.',
  },
  {
    question: 'Is this the same team as paraguayresidency.co.uk?',
    answer:
      'Yes. Investor Pass is a dedicated brand because it targets a different applicant — investors, family offices, migration agents — with a different ticket size, filed by the same team in Asunción.',
  },
];

export default function Page() {
  const whatsapp = whatsappHref('Hi — I have a question about the Investor Pass.');

  return (
    <>
      <PhotoHero image="investorpass-hero-asuncion-river-dusk"
        title="Permanent residency in Paraguay, in one step."
        sub="Qualifying investors skip temporary residency. We structure, file and stay until your card arrives."
        actions={<><Button href="#inquiry">See if you qualify</Button><HeroContact site="investorpass" message="Hi — I have a question about the Paraguay Investor Pass." fallbackHref="#inquiry" /></>}
        trust={heroTrust('investorpass')}
      />
      <IntentTiles title="Four ways to qualify" tiles={[
        { label: 'Invest in real estate', href: '/investor-pass/investment-routes#real_estate', image: 'investorpass-tile-real-estate' },
        { label: 'Build a productive business', href: '/investor-pass/investment-routes#productive_business', image: 'investorpass-tile-productive-business' },
        { label: 'Explore financial instruments', href: '/investor-pass/investment-routes#financial_instruments', image: 'investorpass-tile-financial-instruments' },
        { label: 'Back a tourism project', href: '/investor-pass/investment-routes#tourism', image: 'investorpass-tile-tourism-lodge' },
      ]} />
      {/* At a glance, open on the page: the four thresholds are the first thing an
          investor (and an answer engine) looks for, so they are not behind a toggle. */}
      <Section width="narrow" spacing="tight">
        <Heading level={2}>Investor Pass at a glance</Heading>
        <div className="mt-[var(--space-6)] overflow-x-auto rounded-[var(--radius-brand)] border border-[var(--border)]">
          <table className="w-full border-collapse text-left text-(length:--text-sm)">
            <caption className="sr-only">Investor Pass qualifying routes and programme rules</caption>
            <tbody>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)]">
                <th scope="row" className="w-1/3 px-4 py-3 align-top font-semibold text-[var(--fg)]">Qualifying investment</th>
                <td className="px-4 py-3 align-top text-[var(--fg)]"><Fact k="investorpass.min_investment_usd" site="investorpass" /></td>
              </tr>
              {ROUTES.map((route) => (
                <tr key={route.id} className="border-b border-[var(--border)]">
                  <th scope="row" className="w-1/3 px-4 py-3 align-top font-semibold text-[var(--fg)]">{route.eyebrow}</th>
                  <td className="px-4 py-3 align-top text-[var(--fg-muted)]"><Fact k={route.factKey} site="investorpass" /></td>
                </tr>
              ))}
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="px-4 py-3 align-top font-semibold text-[var(--fg)]">Legal basis</th>
                <td className="px-4 py-3 align-top text-[var(--fg-muted)]"><Fact k="investorpass.legal_instrument" site="investorpass" /></td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="px-4 py-3 align-top font-semibold text-[var(--fg)]">Launched</th>
                <td className="px-4 py-3 align-top text-[var(--fg-muted)]"><Fact k="investorpass.launch_date" site="investorpass" /></td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="px-4 py-3 align-top font-semibold text-[var(--fg)]">What you get</th>
                <td className="px-4 py-3 align-top text-[var(--fg-muted)]"><Fact k="investorpass.validity_years" site="investorpass" /></td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 align-top font-semibold text-[var(--fg)]">Cédula</th>
                <td className="px-4 py-3 align-top text-[var(--fg-muted)]"><Fact k="cedula.timeline" site="investorpass" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <a className="mt-[var(--space-4)] inline-flex min-h-11 items-center text-[var(--accent)] underline" href="/investor-pass/requirements">Full requirements</a>
      </Section>
      <Section tone="alt"><Heading level={2}>From first message to card</Heading><ol className="my-10 grid gap-8 sm:grid-cols-3">{['Confirm your route and investment', 'File for permanent residency', 'Collect your cédula after approval'].map((step, index) => <li key={step} className="flex items-center gap-4"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-2xl text-[var(--accent)]">{['◇', '↗', '✓'][index]}</span><h3>{step}</h3></li>)}</ol><Button href="/investor-pass/process" variant="secondary">See the process</Button></Section>
      <TeamStrip site="investorpass" />
      <Section width="narrow" spacing="tight"><Disclosure title="Frequently asked"><FAQ items={FAQ_ITEMS} /></Disclosure></Section>
      <Section id="inquiry" tone="accent" width="narrow">
        <Heading level={2}>See if you qualify</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
          Tell us your capital and goal. We send the route, cost and exit options in writing.
        </p>
        {whatsapp && (
          <p className="mt-[var(--space-4)] text-(length:--text-sm)">
            <a href={whatsapp} rel="noopener" className="text-[var(--accent)] underline underline-offset-2">
              Or message us on WhatsApp
            </a>
          </p>
        )}
        <div className="mt-[var(--space-8)]">
          <LeadForm site="investorpass" variant="investor_inquiry" pagePath={PATH} />
        </div>
        <p className="mt-[var(--space-8)] text-(length:--text-sm) text-[var(--fg-muted)]">
          Not investing? See{' '}
          <a href={siteOrigin('residency')} className="text-[var(--accent)] underline underline-offset-2">
            standard residency routes
          </a>{' '}
          on paraguayresidency.co.uk instead.
        </p>
        <Disclosure title="The full process"><ProcessTimeline site="investorpass" route="investor" /></Disclosure>
      </Section>

      <JsonLd
        data={serviceOfferJsonLd('investorpass', {
          name: 'Paraguay Investor Pass',
          description:
            'Direct permanent residency in Paraguay for qualifying investors, filed end to end.',
          path: PATH,
        })}
      />
    </>
  );
}
