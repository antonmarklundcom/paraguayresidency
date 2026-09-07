import type { Metadata } from 'next';
import {
  Bento,
  Card,
  Container,
  EditorialHero,
  Fact,
  FAQ,
  Heading,
  JsonLd,
  LeadForm,
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
      'Published figures disagree with each other. We quote the current threshold from the resolution text on your call, not from a web page — see the Investment Routes page for what each route needs.',
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
    question: 'Is this the same team as paraguayresidency.com?',
    answer:
      'Yes. Investor Pass is a dedicated brand because it targets a different applicant — investors, family offices, migration agents — with a different ticket size, filed by the same team in Asunción.',
  },
];

export default function Page() {
  const whatsapp = whatsappHref('Hi — I have a question about the Investor Pass.');

  return (
    <>
      <EditorialHero
        eyebrow="Paraguay Investor Pass"
        title="Permanent residency in Paraguay, in one step."
        sub="The Investor Pass lets qualifying investors skip temporary residency entirely. We structure the investment, file the application and stay with you until the permanent card is in your hand."
      />

      <Section>
        <Container width="narrow">
          <ul className="space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              Four qualifying routes — real estate, productive business, financial instruments,
              tourism — we tell you which one fits your capital and your goals.
            </li>
            <li>
              Investment thresholds and program rules are new and still moving; we quote the
              current figures on your call, not from a stale web page.
            </li>
            <li>Nothing is filed until you have seen the full cost, timeline and exit options in writing.</li>
          </ul>
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>What the Investor Pass is</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            The Investor Pass is a route to permanent residency, introduced{' '}
            <Fact k="investorpass.launch_date" site="investorpass" />, for people who bring
            qualifying capital into Paraguay. It removes the standard temporary-residency stage
            for applicants who qualify, and the card it grants is issued for{' '}
            <Fact k="investorpass.validity_years" site="investorpass" />. It starts{' '}
            <Fact k="investorpass.min_investment_usd" site="investorpass" />, confirmed against the
            resolution text on your call before anything is filed.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2}>Four qualifying routes</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)] max-w-[var(--measure)]">
            Each route suits a different kind of capital and a different goal. The{' '}
            <a
              href="/investor-pass/investment-routes"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              full breakdown
            </a>{' '}
            covers what qualifies, in detail.
          </p>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {ROUTES.map((route) => (
                <Card
                  key={route.id}
                  eyebrow={route.eyebrow}
                  title={route.title}
                  href={`/investor-pass/investment-routes#${route.id}`}
                >
                  <Fact k={route.factKey} site="investorpass" />
                </Card>
              ))}
            </Bento>
          </div>
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>Who qualifies</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Anyone bringing qualifying capital into one of the four routes above, regardless of
            nationality. There is no separate points test or language requirement layered on top —
            the investment itself is the qualifying event. See the full{' '}
            <a href="/investor-pass/requirements" className="text-[var(--accent)] underline underline-offset-2">
              requirements
            </a>{' '}
            for documentation and due-diligence detail.
          </p>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Heading level={2}>Timeline</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            A call to confirm your route and structure the investment, filing directly for
            permanent residency, then the cédula once it is approved —{' '}
            <Fact k="cedula.timeline" site="investorpass" />. See the full{' '}
            <a href="/investor-pass/process" className="text-[var(--accent)] underline underline-offset-2">
              step-by-step process
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow">
          <Heading level={2}>Why go direct to permanent</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            The Pass buys time, not a different outcome — the standard route reaches the same
            permanent card without a qualifying investment, just on a longer clock. Whether the
            time is worth the money depends on your capital and your timeline; see the{' '}
            <a
              href="/investor-pass/vs-standard-residency"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              full comparison
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <FAQ title="Frequently asked" items={FAQ_ITEMS} />
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>See if you qualify</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Tell us your capital and your goal. We come back with the route that fits, the full
            cost and the exit options — in writing.
          </p>
          {whatsapp && (
            <p className="mt-[var(--space-4)] text-[var(--text-sm)]">
              <a href={whatsapp} rel="noopener" className="text-[var(--accent)] underline underline-offset-2">
                Or message us on WhatsApp
              </a>
            </p>
          )}
          <div className="mt-[var(--space-8)]">
            <LeadForm site="investorpass" variant="investor_inquiry" pagePath={PATH} />
          </div>
          <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
            Not investing? See{' '}
            <a href={siteOrigin('residency')} className="text-[var(--accent)] underline underline-offset-2">
              standard residency routes
            </a>{' '}
            on paraguayresidency.com instead.
          </p>
        </Container>
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
