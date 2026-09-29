import type { Metadata } from 'next';
import {
  AfterYouMessage,
  Breadcrumbs,
  Button,
  Container,
  Fact,
  Guarantee,
  Heading,
  HeroContact,
  LeadForm,
  PriceTable,
  Section,
  StickyCta,
  TrustBar,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/pricing';
const QUOTE_MESSAGE = 'Hi — I would like a written quote for Paraguay residency.';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Residency Pricing — Fixed Fees, Quoted Upfront',
    description:
      'What our Paraguay residency packages cost. Fixed fees, quoted before you commit — real figures confirmed in writing for your case until published here.',
    path: PATH,
  });
}

const ALSO = [
  {
    id: 'tax_residency',
    href: '/residency/tax-residency',
    label: 'Tax residency and RUC',
    fee: 'pricing.tax_residency',
    body: 'We register your RUC and explain the territorial system in general terms, coordinating the administrative work with your residency filing. Your own accountant handles advice about obligations in your home country.',
  },
  {
    id: 'family',
    href: '/residency/family',
    label: 'Family filing',
    fee: 'pricing.family',
    body: 'We coordinate the document checklist for each relative and schedule family appointments together where the office permits. Each person still needs their own file, and we quote the additional people alongside the main applicant.',
  },
] as const;

export default function Page() {
  return (
    <>
      <Section spacing="tight">
        <Container>
          <Breadcrumbs site="residency" items={[{ label: 'Pricing', href: PATH }]} />
          <div className="mt-[var(--space-8)] max-w-3xl">
            <Heading level={1}>A fixed service fee, with separate costs explained before you commit</Heading>
            <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
              Your quote starts with a message about your nationality, documents, route and travel plans. We agree the work and the fixed service fee before you commit. There is no self-service calculator: the checklist and the people applying decide the scope.
            </p>
            <div data-service-cta className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-3)]">
              <HeroContact site="residency" message={QUOTE_MESSAGE} fallbackHref="#inquiry" />
              <Button href="/route-finder" variant="secondary">Find your route</Button>
            </div>
          </div>
        </Container>
      </Section>

      <TrustBar site="residency" />

      <PriceTable
        site="residency"
        title="What each route costs, and what it covers"
        intro="Our fee is one line per route. The state's fee is a separate line, so you can see who is paid what."
      />

      <Section tone="alt" width="narrow">
        <div data-fee-terms>
          <Heading level={2}>What every fee covers</Heading>
          <p className="mt-[var(--space-4)]">The agreed preparation, coordination and guidance for your route, as described above.</p>
          <dl className="mt-[var(--space-4)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">What it never covers</dt><dd>Government fees, apostilles and required translations are never included in our service fee. We identify which document costs apply to this application before you decide.</dd></div>
            <div><dt className="font-semibold">What you pay the state and what you pay us</dt><dd>You pay the applicable official application fees directly to the Paraguayan state. You pay us for the preparation and coordination described here. Apostilles and translations are paid separately to their providers.</dd></div>
          </dl>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Your own accountant&apos;s advice is separate. For RUC, we confirm whether any official registration charge applies in writing for your case.
          </p>
        </div>
      </Section>

      <Section>
        <Heading level={2}>Also quoted separately</Heading>
        <ul className="mt-[var(--space-6)] grid gap-[var(--space-6)] md:grid-cols-2">
          {ALSO.map((item) => (
            <li key={item.id} id={item.id} className="rounded-[var(--radius-brand)] bg-[var(--surface)] p-[var(--space-6)] shadow-[var(--elev-0)]">
              <Heading level={3}><a href={item.href} className="text-[var(--accent)] underline underline-offset-4">{item.label}</a></Heading>
              <p className="mt-[var(--space-3)] font-medium">Service fee: <Fact k={item.fee} site="residency" /></p>
              <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-[var(--space-8)]">
          <a href="/investor-pass" className="text-[var(--accent)] underline underline-offset-2">Investor Pass work has its own scope and quote. See the Investor Pass route.</a>
        </p>
        <p className="mt-[var(--space-4)] max-w-3xl text-[var(--fg-muted)]">
          Comparing quotes from several providers? Our guide to{' '}
          <a href="/guides/documents/choosing-a-paraguay-residency-agent" className="text-[var(--accent)] underline underline-offset-2">choosing a Paraguay residency agent</a>{' '}
          lists what to check in any quote, ours included. Applying from the UK? Start with the{' '}
          <a href="/guides/documents/uk-police-certificate-acro-for-paraguay" className="text-[var(--accent)] underline underline-offset-2">ACRO police certificate</a>.
        </p>
      </Section>

      <AfterYouMessage site="residency" tone="alt" message={QUOTE_MESSAGE} />
      <Guarantee site="residency" />

      <Section tone="alt" width="narrow" className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
        <div id="inquiry" className="scroll-mt-6">
          <Heading level={2}>Get your written quote</Heading>
          <p className="mt-[var(--space-4)]">Tell us your nationality, route and timeline, on WhatsApp or the form. We confirm the scope, then set out the fixed fee and separate costs in writing before you decide.</p>
          <div className="mt-[var(--space-8)]"><LeadForm site="residency" variant="consultation" pagePath={PATH} /></div>
        </div>
        <StickyCta formId="inquiry" label="Talk to us" />
      </Section>
    </>
  );
}
