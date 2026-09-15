import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  Container,
  Fact,
  FAQ,
  Heading,
  Section,
  SplitHero,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Residency Services — Temporary, Permanent & Cédula',
    description:
      'Done-for-you Paraguay residency. Fixed fees, nationality-specific checklists, appointments in Asunción. Find your route in 2 minutes.',
    path: '/',
  });
}

const ROUTES = [
  {
    eyebrow: 'Temporary residency',
    title: 'The standard first step',
    body: 'Two years, then permanent.',
    href: '/residency/temporary-residency',
  },
  {
    eyebrow: 'Permanent residency',
    title: 'Ten-year card',
    body: 'Presence rules apply — ask us.',
    href: '/residency/permanent-residency',
  },
  {
    eyebrow: 'Investor Pass',
    title: 'Straight to permanent',
    body: 'With a qualifying investment. Separate brand, same team.',
    href: '/investor-pass',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I know which route is right for me?',
    answer:
      'Take the Route Finder — six questions, two minutes — or book a call and we will tell you directly, including when the standard route is wrong for your case.',
  },
  {
    question: 'How much does this cost?',
    answer:
      'One fixed fee per route, quoted before you commit, based on your nationality and situation. See the pricing page for what each route covers.',
  },
  {
    question: 'Do I need to move to Paraguay to get residency?',
    answer:
      'No. You need to attend the appointments in person, which we schedule together, but full relocation is your decision, not a requirement of the residency itself.',
  },
  {
    question: 'What if my case is unusual?',
    answer:
      'Tell us on the first call. We would rather point you to the Investor Pass, or tell you to wait, than file something that will not serve your case.',
  },
];

export default function Page() {
  const whatsapp = whatsappHref('Hi — I have a question about Paraguay residency.');

  const actions = (
    <>
      <Button href="/route-finder">Find your route</Button>
      <Button href="/book" variant="secondary">
        Book a call
      </Button>
    </>
  );

  return (
    <>
      <SplitHero
        eyebrow="Paraguay Residency"
        title="Paraguay residency, handled end to end."
        sub="Temporary residency, permanent residency and your cédula, prepared by people who do this every week in Asunción. You show up for the appointments. We do the rest."
        actions={actions}
        aside={
          <ul className="space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>One fixed fee per route, quoted before you commit.</li>
            <li>Document checklist tailored to your nationality, not a generic PDF.</li>
            <li>
              We tell you when the standard route is wrong for you and point you to the Investor
              Pass or to waiting.
            </li>
          </ul>
        }
      />

      <Section>
        <Container width="narrow">
          <Heading level={2}>Who this is for</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            People relocating for work, retirement or family; digital workers who want a legal
            base and a tax ID they can actually use; and investors who would rather skip straight
            to permanent status. If you are not sure which of those describes you, the{' '}
            <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
              Route Finder
            </a>{' '}
            tells you in two minutes.
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <Heading level={2}>Three routes, one team</Heading>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {ROUTES.map((route) => (
                <Card key={route.href} eyebrow={route.eyebrow} title={route.title} href={route.href}>
                  {route.body}
                </Card>
              ))}
            </Bento>
          </div>
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

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>Why Paraguay</Heading>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              Temporary residency runs <Fact k="temporary.duration" site="residency" />, one of the
              more accessible standard routes available anywhere.
            </li>
            <li>
              Permanent residency carries <Fact k="permanent.presence_rule" site="residency" /> —
              we explain exactly what that means for your travel pattern.
            </li>
            <li>
              A territorial tax system means <Fact k="tax.foreign_income_treatment" site="residency" />.
            </li>
          </ul>
        </Container>
      </Section>

      {/* Testimonials section stays hidden until real ones exist (plan §7, §6.1). */}

      <Section>
        <Container width="narrow">
          <FAQ title="Frequently asked" items={FAQ_ITEMS} />
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow" className="text-center">
          <Heading level={2}>Ready to find your route?</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Two minutes tells you which route fits. Or skip straight to a call.
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
    </>
  );
}
