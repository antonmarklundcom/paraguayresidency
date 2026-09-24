import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { t } from '@/i18n';
import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  Fact,
  FAQ,
  Heading,
  LeadForm,
  Disclosure,
  Section,
  PhotoHero,
  IntentTiles,
  TeamStrip,
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
    body: 'Start here, then permanent.',
    href: '/routes#temporary',
  },
  {
    eyebrow: 'Permanent residency',
    title: 'The long-term card',
    body: 'Understand the presence rules.',
    href: '/routes#permanent',
  },
  {
    eyebrow: 'Investor Pass',
    title: 'Straight to permanent',
    body: 'With a qualifying investment.',
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
  const latest = getPages('frontier').filter((post) => !post.frontmatter.draft).slice(0, 3);
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
      <PhotoHero image="frontier-hero-red-earth-road" position="upper-left"
        title="A second residency you can actually get."
        sub="Permanent residency without a million-dollar investment. We handle the paperwork in Asunción."
        actions={actions}
        proof={[t('frontier', 'proof.fixedFee'), t('frontier', 'proof.asuncion'), t('frontier', 'proof.reply')]}
      />
      <IntentTiles title="Start with your question" tiles={[
        { label: 'Why a plan B', href: '/why-paraguay', image: 'frontier-tile-open-door-patio' },
        { label: 'The three routes', href: '/routes', image: 'frontier-tile-three-roads' },
        { label: 'Tax, plainly', href: '/tax', image: 'frontier-tile-home-office' },
        { label: 'Do I have to move?', href: '/stories/the-presence-rules-nobody-explains', image: 'frontier-tile-airport-window' },
      ]} />
      <Section tone="alt"><Heading level={2}>Three routes, compared honestly</Heading><div className="mt-8"><Bento>{ROUTES.map(route => <Card key={route.href} title={route.eyebrow} href={route.href}>{route.body}</Card>)}</Bento></div></Section>
      <TeamStrip site="frontier" />
      <Section width="narrow"><Heading level={2} className="mb-[var(--space-6)]">The details</Heading><Disclosure title="Plan B, honestly"><p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            You have probably read the &ldquo;Paraguay golden visa&rdquo; posts. Most skip the
            part where a real government office processes real paperwork on its own schedule. We
            are not here to sell you a fantasy — we are here to get you a genuine residency card
            and a tax ID you can hold in reserve, filed correctly the first time, so it is there
            if and when you need it. Some clients move here fully. Most do not, and that is fine —
            the card does not expire because you kept living somewhere else.
          </p></Disclosure>
<Disclosure title="Territorial tax, explained without the hype"><p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Paraguay applies <Fact k="tax.territorial_rate" site="frontier" />. Foreign-income treatment: <Fact k="tax.foreign_income_treatment" site="frontier" />. That is a genuinely
            useful feature if your income is sourced outside Paraguay. It is not the same claim as
            &ldquo;tax-free,&rdquo; and we will never call it that — what it means for your own
            country&apos;s rules is a question for your own accountant. See the full{' '}
            <a href="/tax" className="text-[var(--accent)] underline underline-offset-2">
              tax page
            </a>{' '}
            for the detail.
          </p></Disclosure>
<Disclosure title="The presence rules, stated plainly"><p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Temporary residency duration: <Fact k="temporary.duration" site="frontier" />. Permanent residency comes with a presence rule: <Fact k="permanent.presence_rule" site="frontier" />. Your travel pattern matters when assessing whether this works as a plan B. We would rather explain it correctly now than
            have you find out the hard way after filing.
          </p></Disclosure>
<Disclosure title="Frequently asked"><FAQ items={FAQ_ITEMS} /></Disclosure><a href="/process" className="mt-6 inline-flex min-h-11 items-center text-[var(--accent)] underline">How the process works</a></Section>
      <Section><Heading level={2}>Latest articles</Heading>
        <ul className="mt-8 grid auto-cols-[82%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto p-2 md:auto-cols-[31%]">
          {latest.map(post => <li key={post.slugPath} className="min-w-0 snap-start"><a href={contentHref('frontier', post.slugPath)} className="flex min-h-44 items-end rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-6 font-[family-name:var(--display-font)] text-xl text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2">{post.frontmatter.title.split(/\s+/).slice(0, 8).join(' ')}</a></li>)}
        </ul><a href="/stories" className="mt-6 inline-flex min-h-11 items-center text-[var(--accent)] underline">Browse all stories</a>
      </Section>
      <Section width="narrow" className="text-center">
        <Heading level={2}>Ready to find your route?</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
          Two minutes tells you which route fits, and where the catch is. Not ready to file
          anything yet?{' '}
          <a href="/guide" className="text-[var(--accent)] underline underline-offset-2">
            Read the guide first
          </a>
          .
        </p>
      </Section>

      <Section tone="accent">
        <div className="mt-[var(--space-10)] grid gap-[var(--space-8)] text-left">
          <div>
            <Heading level={2}>{t('frontier', 'process.fullForm')}</Heading>
            <div className="mt-[var(--space-4)]"><LeadForm site="frontier" variant="consultation" pagePath="/" /></div>
          </div>
          <details>
            <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t('frontier', 'form.whatsappAlternative')}</summary>
            {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">{t('frontier', 'form.whatsapp')}</a>}
            <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t('frontier', 'process.whatsappIntro')}</p>
            <LeadForm site="frontier" variant="whatsapp" pagePath="/" />
          </details>
        </div>
        <p className="mt-[var(--space-6)] text-(length:--text-sm) text-[var(--fg-muted)]">
          Investing serious capital instead?{' '}
          <a
            href={siteOrigin('investorpass')}
            className="text-[var(--accent)] underline underline-offset-2"
          >
            See the Investor Pass
          </a>
          .
        </p>
      </Section>
    </>
  );
}
