import type { Metadata } from 'next';
import { BookMockup, Breadcrumbs, Button, Guarantee, Heading, Section, TeamSection, TrustBar } from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('guide', {
    title: 'About the Paraguay Residency Guide',
    description:
      'Written by the team that files Paraguay residency, cédula and tax cases every week in Asunción.',
    path: PATH,
  });
}

const link = 'text-[var(--accent)] underline underline-offset-2';

export default function Page() {
  return (
    <>
      <Section>
        <Breadcrumbs site="guide" items={[{ label: 'About', href: PATH }]} />
        <div className="mt-[var(--space-8)] grid items-center gap-[var(--space-12)] md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <div>
            <Heading level={1}>The guide we wish existed before we did this ourselves</Heading>
            <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
              We run <a href={siteOrigin('residency')} rel="noopener" className={link}>paraguayresidency.co.uk</a>, filing temporary residency, permanent residency and cédula cases every week in Asunción. Every client asks roughly the same questions in roughly the same order. This guide is those answers, written down once instead of answered fresh every time.
            </p>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t('guide', 'about.teamBody')}</p>
            <div className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]">
              <Button href="/#price">Get the guide</Button>
              <Button href="/blog" variant="secondary">Read the blog</Button>
            </div>
          </div>
          <BookMockup site="guide" />
        </div>
      </Section>

      <TrustBar site="guide" />
      <TeamSection site="guide" tone="alt" />

      <Section>
        <div className="grid gap-[var(--space-12)] md:grid-cols-2">
          <div>
            <Heading level={2}>Why it costs money</Heading>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
              A low price keeps it worth writing properly and worth updating for a year, rather than being a lead magnet nobody maintains. It also means we have no reason to exaggerate how easy the process is: you already paid.
            </p>
          </div>
          <div>
            <Heading level={2}>Why the numbers are hedged</Heading>
            <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
              Every legal or financial figure in the guide follows the same rule as this site: nothing is published as a bare number until it has been checked against the current official source. Where a figure is not yet verified, the guide says so and tells you how to confirm it, rather than guessing.
            </p>
          </div>
        </div>
      </Section>

      <Guarantee site="guide" tone="alt" />

      <Section>
        <Heading level={2}>If you would rather not DIY it</Heading>
        <p className="mt-[var(--space-4)] max-w-3xl text-[var(--fg-muted)]">
          The guide is for people doing some or all of this themselves. If you would rather the team filed it for you, that is the done-for-you service on <a href={siteOrigin('residency')} rel="noopener" className={link}>paraguayresidency.co.uk</a>, or, for a qualifying investment, <a href={siteOrigin('investorpass')} rel="noopener" className={link}>paraguayinvestorpass.com</a>. Wondering about the long game? Read our note on <a href="/blog/paraguayan-citizenship" className={link}>Paraguayan citizenship</a>.
        </p>
      </Section>
    </>
  );
}
