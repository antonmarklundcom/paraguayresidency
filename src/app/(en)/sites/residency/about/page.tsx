import type { Metadata } from 'next';
import {
  AfterYouMessage,
  Breadcrumbs,
  Button,
  Guarantee,
  Heading,
  HeroContact,
  OfficeStrip,
  Section,
  TeamSection,
  TrustBar,
  Testimonials,
  CaseSnapshots,
} from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'About Paraguay Residency — Who Files Your Case',
    description:
      'A team based in Asunción, filing Paraguay residency, cédula and tax residency every week. Who we are and how we work.',
    path: PATH,
  });
}

const link = 'text-[var(--accent)] underline underline-offset-2';

export default function Page() {
  return (
    <>
      <Section spacing="tight">
        <Breadcrumbs site="residency" items={[{ label: 'About', href: PATH }]} />
        <div className="mt-[var(--space-8)] max-w-3xl">
          <Heading level={1}>A team in Asunción, doing this every week</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            Paraguay residency is not complicated in principle. It is complicated in the details: which apostille chain a specific country needs, which document expires before which appointment, what a bank actually wants to see before it opens an account. We handle the details because we handle them constantly, not because they are secret.
          </p>
          <div className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-3)]">
            <HeroContact site="residency" message="Hi — I have a question about Paraguay residency." />
            <Button href="/pricing" variant="secondary">See the fixed fees</Button>
          </div>
        </div>
      </Section>

      <TrustBar site="residency" />
      <TeamSection site="residency" tone="alt" />

      <Section>
        <div className="grid gap-[var(--space-12)] md:grid-cols-2">
          <div>
            <Heading level={2}>How we work</Heading>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
              One fixed fee per route, quoted before you commit. A document checklist built for your nationality, not a generic PDF. And when the standard route is wrong for your case, we tell you in your first message, and point you to the Investor Pass, or to waiting, rather than filing something that will not serve you.
            </p>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t('residency', 'about.teamBody')}</p>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
              Comparing us with other providers? Our guide to{' '}
              <a href="/guides/documents/choosing-a-paraguay-residency-agent" className={link}>choosing a Paraguay residency agent</a>{' '}
              sets out the questions to ask all of us.
            </p>
          </div>
          <div>
            <Heading level={2}>What we do not do</Heading>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
              We do not quote figures we cannot stand behind: every legal or financial number on this site is either confirmed or clearly marked as an estimate we will confirm in writing for your case. We do not advise on your home country&apos;s own tax rules. That is a question for your own accountant, and we say so rather than guessing.
            </p>
          </div>
        </div>
      </Section>

      <Testimonials site="residency" tone="alt" />
      <CaseSnapshots site="residency" />
      <Guarantee site="residency" tone="alt" />
      <OfficeStrip site="residency" />
      <AfterYouMessage site="residency" tone="alt" />

      <Section>
        <Heading level={2}>The rest of what we run</Heading>
        <p className="mt-[var(--space-4)] max-w-3xl text-[var(--fg-muted)]">
          This site handles the done-for-you residency services. The <a href="/investor-pass" className={link}>Investor Pass</a> is our dedicated brand for direct permanent residency by investment, and the <a href="/guide" className={link}>residency guide</a> is a written-down, kept-current reference if you would rather read the whole process yourself first. Thinking further ahead? See <a href="/residency/citizenship" className={link}>Paraguay citizenship</a>.
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/contact">Message us</Button>
          <Button href="/route-finder" variant="secondary">Find your route</Button>
        </div>
      </Section>
    </>
  );
}
