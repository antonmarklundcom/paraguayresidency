import type { Metadata } from 'next';
import { Breadcrumbs, Button, Card, Container, Fact, FAQ, Heading, JsonLd, Prose, Section } from '@/components';
import { siteMetadata, serviceJsonLd } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/investor-pass/vs-standard-residency';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Investor Pass vs Standard Paraguay Residency',
    description:
      'The Investor Pass buys time, not a different outcome. When the qualifying investment is worth it compared with the standard temporary-to-permanent route.',
    path: PATH,
  });
}

const FAQ_ITEMS = [
  {
    question: 'Does the standard route reach the same permanent card?',
    answer:
      'Yes — the destination is the same permanent residency and cédula either way. The difference is the path: a qualifying investment filed directly, or the standard temporary stage first.',
  },
  {
    question: 'Is the Investor Pass "better" than standard residency?',
    answer:
      'Not inherently — it is faster to permanent status for people who have the capital and want to deploy it. If you do not have qualifying capital to invest, or would rather not tie it up, the standard route reaches the same card without it.',
  },
  {
    question: 'Can I start on the standard route and switch to the Investor Pass later?',
    answer:
      'Generally the two are separate filings rather than an upgrade path. Tell us on the call if you are unsure which to start with — we would rather advise the right one first than have you refile.',
  },
];

const HUB = siteOrigin('residency');

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="investorpass" items={[{ label: 'Vs. standard residency', href: PATH }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>The Pass buys time, not a different outcome</Heading>
          <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
            Both paths end at the same permanent residency card. Here is when the qualifying
            investment is worth the money — and when it is not.
          </p>
        </header>

        <Prose className="mt-[var(--space-12)]">
          <h2>What actually differs</h2>
          <p>
            The standard route runs temporary residency first —{' '}
            <Fact k="temporary.duration" site="investorpass" /> — then permanent. The Investor Pass
            skips straight to permanent for a qualifying investment. Both carry the same permanent
            presence rule once you have the card — <Fact k="permanent.presence_rule" site="investorpass" /> —
            and both lead to the same cédula.
          </p>
          <h2>When the investment is worth it</h2>
          <p>
            If you already plan to deploy capital in Paraguay — property, a business, a financial
            instrument — structuring it to also qualify for the Investor Pass turns a cost you were
            going to bear anyway into a faster path to permanent status. If the capital would
            otherwise sit unused, that is a real cost against the time saved.
          </p>
          <h2>When the standard route is the better buy</h2>
          <p>
            If you are not planning to invest at that scale, or would rather keep capital liquid
            and uncommitted, the standard route reaches the identical card without tying anything
            up — it simply takes longer. We say this on the call rather than steer everyone toward
            the higher-ticket option.
          </p>
        </Prose>

        <div className="mt-[var(--space-16)]">
          <Heading level={2}>The standard routes, on our hub site</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)] max-w-[var(--measure)]">
            Full detail on each standard route lives on paraguayresidency.com, filed by the same
            team.
          </p>
          <div className="mt-[var(--space-6)] grid gap-[var(--space-4)] sm:grid-cols-2">
            <Card
              eyebrow="Standard route"
              title="Temporary residency"
              href={`${HUB}/residency/temporary-residency`}
            >
              The first step on the standard path — two years, then permanent.
            </Card>
            <Card
              eyebrow="Standard route"
              title="Permanent residency"
              href={`${HUB}/residency/permanent-residency`}
            >
              The ten-year card, reached without a qualifying investment.
            </Card>
            <Card eyebrow="Standard route" title="Cédula" href={`${HUB}/residency/cedula`}>
              The identity card process once residency is approved — same for both paths.
            </Card>
            <Card
              eyebrow="Standard route"
              title="Tax residency"
              href={`${HUB}/residency/tax-residency`}
            >
              RUC and territorial tax, independent of which residency path you took.
            </Card>
          </div>
        </div>

        <div className="mt-[var(--space-16)]">
          <FAQ title="Frequently asked" items={FAQ_ITEMS} />
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/route-finder">Find your route</Button>
          <Button href="/contact" variant="secondary">
            Talk to us about your capital
          </Button>
        </div>

        <JsonLd
          data={serviceJsonLd('investorpass', {
            name: 'Investor Pass vs Standard Residency',
            description:
              'Comparison of the Paraguay Investor Pass with the standard temporary-to-permanent residency route.',
            path: PATH,
          })}
        />
      </Container>
    </Section>
  );
}
