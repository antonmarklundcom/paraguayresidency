import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Fact, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/pricing';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency Pricing for a Plan B — Fixed Fees',
    description:
      'What a plan-B Paraguay residency costs. Fixed fees, quoted before you commit — real figures confirmed on your call until published here.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="frontier" items={[{ label: 'Pricing', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">A fixed service fee, with separate costs explained before you commit</Heading>
        <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">Your quote starts with a call about your nationality, documents, route and travel plans. We agree the work and fixed service fee before you commit. There is no self-service calculator: the document checklist and the people applying determine the scope.</p>
        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="temporary">
          <Heading level={2} id="temporary"><a href="/routes#temporary" className="text-[var(--accent)] underline">Temporary residency</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Service fee: <Fact k="pricing.temporary" site="frontier" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">What the fixed fee covers</dt><dd>We prepare your nationality-specific document checklist, coordinate appointments in Asunción and file your temporary-residency application. Document sequencing is part of that work.</dd></div>
            <div><dt className="font-semibold">What it never covers</dt><dd>Government fees, apostilles and required translations are never included in our service fee. We identify which document costs apply to this application before you decide.</dd></div>
            <div><dt className="font-semibold">How we quote this route</dt><dd>On the call we review your passport nationality and the documents you already have before quoting the filing work.</dd></div>
            <div><dt className="font-semibold">What you pay the state and what you pay us</dt><dd>You pay the applicable official application fees directly to the Paraguayan state. You pay us for the preparation and coordination described here. Apostilles and translations are paid separately to their providers, not treated as our service fee.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="permanent">
          <Heading level={2} id="permanent"><a href="/routes#permanent" className="text-[var(--accent)] underline">Permanent residency</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Service fee: <Fact k="pricing.permanent" site="frontier" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">What the fixed fee covers</dt><dd>We file your permanent-residency application once you qualify, explain the presence rule for your travel plans and coordinate the timing with your cédula renewal.</dd></div>
            <div><dt className="font-semibold">What it never covers</dt><dd>Government fees, apostilles and required translations are never included in our service fee. We identify which document costs apply to this application before you decide.</dd></div>
            <div><dt className="font-semibold">How we quote this route</dt><dd>On the call we check your current status and eligibility, then quote the permanent application separately from any earlier temporary filing.</dd></div>
            <div><dt className="font-semibold">What you pay the state and what you pay us</dt><dd>You pay the applicable official application fees directly to the Paraguayan state. You pay us for the preparation and coordination described here. Apostilles and translations are paid separately to their providers, not treated as our service fee.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="tax_residency">
          <Heading level={2} id="tax_residency"><a href="/tax" className="text-[var(--accent)] underline">Tax residency and RUC</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Service fee: <Fact k="pricing.tax_residency" site="frontier" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">What the fixed fee covers</dt><dd>We register your RUC and explain the territorial system in general terms, coordinating the administrative work with your residency filing.</dd></div>
            <div><dt className="font-semibold">What it never covers</dt><dd>The fee does not cover your own accountant’s advice or payments due to the state. Any required apostilles and translations remain separate document costs; we confirm whether they apply.</dd></div>
            <div><dt className="font-semibold">How we quote this route</dt><dd>On the call we discuss your planned activity and the RUC work you need. Your own accountant handles advice about obligations in your home country.</dd></div>
            <div><dt className="font-semibold">What you pay the state and what you pay us</dt><dd>You pay us for the agreed RUC registration and guidance. Any applicable official charges are paid directly to the Paraguayan state; we identify them on the call without assuming a registration charge applies.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="family">
          <Heading level={2} id="family"><a href="/routes" className="text-[var(--accent)] underline">Family filing</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Service fee: <Fact k="pricing.family" site="frontier" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">What the fixed fee covers</dt><dd>We coordinate the document checklist for each relative, clarify who can apply as a dependent and schedule family appointments together where the office permits. Each person still needs their own file.</dd></div>
            <div><dt className="font-semibold">What it never covers</dt><dd>Government fees, apostilles and required translations are never included in our service fee. We identify which document costs apply to this application before you decide.</dd></div>
            <div><dt className="font-semibold">How we quote this route</dt><dd>On the call we review each family member and their documents. We quote the additional-person service alongside the primary applicant and identify exactly who is covered.</dd></div>
            <div><dt className="font-semibold">What you pay the state and what you pay us</dt><dd>You pay the applicable official application fees directly to the Paraguayan state. You pay us for the preparation and coordination described here. Apostilles and translations are paid separately to their providers, not treated as our service fee.</dd></div>
          </dl>
        </section>

        <p className="mt-[var(--space-8)]"><a href="/routes#investor-pass" className="text-[var(--accent)] underline">Investor Pass work has its own scope and quote through our sibling brand. See the Investor Pass route.</a></p>
        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Get your written quote</Heading>
          <p className="mt-[var(--space-4)]">Tell us your nationality, route and timeline. On your call we confirm the service scope, then set out the fixed fee and separate costs in writing before you decide.</p>
          <div className="mt-[var(--space-6)]"><Button href="/contact">Book a call</Button></div>
          <div className="mt-[var(--space-8)]"><LeadForm site="frontier" variant="consultation" pagePath={PATH} /></div>
        </div>
      </Container>
    </Section>
  );
}
