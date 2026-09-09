import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  Container,
  Fact,
  FAQ,
  Heading,
  LeadForm,
  Section,
  SplitHero,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import { siteOrigin } from '@/sites/registry';

const PATH = '/';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency for Americans & Expats — Plan B, Handled',
    description:
      'Second residency in Paraguay: low thresholds, territorial tax, a permanent card. Routes compared, presence rules stated plainly, filing in Asunción.',
    path: PATH,
  });
}

const ROUTES = [
  {
    eyebrow: 'Temporary residency',
    title: 'The standard first step',
    body: 'Two years, then permanent. The route almost everyone starts on.',
    href: '/routes#temporary',
  },
  {
    eyebrow: 'Permanent residency',
    title: 'The long-term card',
    body: 'Presence rules apply — we tell you exactly what they mean for a plan B, not a full move.',
    href: '/routes#permanent',
  },
  {
    eyebrow: 'Investor Pass',
    title: 'Straight to permanent',
    body: 'With a qualifying investment. A separate brand, same team, for a different kind of capital.',
    href: '/routes#investor-pass',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Do I have to actually move to Paraguay?',
    answer:
      'No. You need to show up for the appointments in person — we schedule them together — but keeping the rest of your life where it is now is exactly what "plan B" means here. See the presence rules on the Routes page for what minimum contact each status actually requires.',
  },
  {
    question: 'Is Paraguay really "tax-free"?',
    answer:
      'No, and we will not tell you it is. Paraguay taxes territorially, which changes how foreign-source income is treated — see the Tax page for what that does and does not cover, and confirm your own case with an accountant.',
  },
  {
    question: 'What is the catch?',
    answer:
      'Paraguay is a real country with real bureaucracy, not a loophole. Documents take longer than a blog post suggests, some offices move slowly, and the presence rules matter more than people admit online. We tell you this upfront because a client who knows what to expect is easier to serve well than one who was sold a fantasy.',
  },
  {
    question: 'How is this different from paraguayresidency.co.uk?',
    answer:
      'Same team, same filing, different framing. This site is built for people weighing optionality — a reserve residency and tax ID, maybe land, maybe a business, full relocation maybe never. If you are already committed to Paraguay as a primary base, the hub site speaks more directly to that.',
  },
];

export default function Page() {
  const whatsapp = whatsappHref('Hi — I have a question about a second residency in Paraguay.');

  const actions = (
    <>
      <Button href="/route-finder">Find your route</Button>
      <Button href="/contact" variant="secondary">
        Talk to us
      </Button>
    </>
  );

  return (
    <>
      <SplitHero
        eyebrow="Paraguay Frontier"
        title="A second residency you can actually get."
        sub="Paraguay grants permanent residency without a million-dollar investment, a points test or a decade of waiting. We handle the paperwork in Asunción. You decide how much of your life to move here."
        actions={actions}
        aside={
          <ul className="space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              Plan B first: a residency card and a tax ID you can hold in reserve, with the
              presence rules explained honestly.
            </li>
            <li>
              Territorial tax means foreign income is generally outside Paraguay&apos;s reach — we
              say exactly what that does and does not cover.
            </li>
            <li>
              Land, a business, or nothing at all: the routes compared for people who may never
              live here full-time.
            </li>
          </ul>
        }
      />

      <Section>
        <Container width="narrow">
          <Heading level={2}>Plan B, honestly</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            You have probably read the &ldquo;Paraguay golden visa&rdquo; posts. Most skip the
            part where a real government office processes real paperwork on its own schedule. We
            are not here to sell you a fantasy — we are here to get you a genuine residency card
            and a tax ID you can hold in reserve, filed correctly the first time, so it is there
            if and when you need it. Some clients move here fully. Most do not, and that is fine —
            the card does not expire because you kept living somewhere else.
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <Heading level={2}>Three routes, compared honestly</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)] max-w-[var(--measure)]">
            None of these require you to give up your life elsewhere. See the{' '}
            <a href="/routes" className="text-[var(--accent)] underline underline-offset-2">
              full comparison
            </a>{' '}
            for what each one actually asks of you.
          </p>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {ROUTES.map((route) => (
                <Card
                  key={route.href}
                  eyebrow={route.eyebrow}
                  title={route.title}
                  href={route.href}
                >
                  {route.body}
                </Card>
              ))}
            </Bento>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Heading level={2}>Territorial tax, explained without the hype</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Paraguay applies <Fact k="tax.territorial_rate" site="frontier" />, under a system
            where <Fact k="tax.foreign_income_treatment" site="frontier" />. That is a genuinely
            useful feature if your income is sourced outside Paraguay. It is not the same claim as
            &ldquo;tax-free,&rdquo; and we will never call it that — what it means for your own
            country&apos;s rules is a question for your own accountant. See the full{' '}
            <a href="/tax" className="text-[var(--accent)] underline underline-offset-2">
              tax page
            </a>{' '}
            for the detail.
          </p>
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>The presence rules, stated plainly</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Temporary residency runs <Fact k="temporary.duration" site="frontier" />. Permanent
            residency carries <Fact k="permanent.presence_rule" site="frontier" /> — the single
            most-misquoted figure in this whole niche, and the one that decides whether a plan B
            actually works for your travel pattern. We would rather explain it correctly now than
            have you find out the hard way after filing.
          </p>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Heading level={2}>How it runs</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            A call to confirm your route and fee, a document checklist built for your nationality,
            legalisation handled in the right order, filing and appointments in Asunción, then the
            cédula once residency is approved. See the{' '}
            <a href="/process" className="text-[var(--accent)] underline underline-offset-2">
              full process, step by step
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow">
          <FAQ title="Frequently asked" items={FAQ_ITEMS} />
        </Container>
      </Section>

      <Section>
        <Container width="narrow" className="text-center">
          <Heading level={2}>Ready to find your route?</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Two minutes tells you which route fits, and where the catch is. Not ready to file
            anything yet?{' '}
            <a href="/guide" className="text-[var(--accent)] underline underline-offset-2">
              Read the guide first
            </a>
            .
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)]">
            {actions}
          </div>
          {whatsapp && (
            <p className="mt-[var(--space-6)] text-[var(--text-sm)]">
              <a href={whatsapp} rel="noopener" className="text-[var(--accent)] underline underline-offset-2">
                Or message us on WhatsApp
              </a>
            </p>
          )}
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <LeadForm site="frontier" variant="consultation" pagePath={PATH} />
          <p className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
            Investing serious capital instead?{' '}
            <a
              href={siteOrigin('investorpass')}
              className="text-[var(--accent)] underline underline-offset-2"
            >
              See the Investor Pass
            </a>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
