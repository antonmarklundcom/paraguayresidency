import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import {
  ArticleCards,
  Button,
  Disclosure,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  heroTrust,
  Reasons,
  Steps,
  TeamStrip,
  Fact,
  FAQ,
  Heading,
  Section,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Residency Services — Temporary, Permanent & Cédula',
    description:
      'Done-for-you Paraguay residency. Fixed fees, nationality-specific checklists, appointments in Asunción. Find your route in 2 minutes.',
    path: '/',
  });
}

const FAQ_ITEMS = [
  {
    question: 'How do I know which route is right for me?',
    answer:
      'Take the Route Finder — six questions, two minutes — or message us and we will tell you directly, including when the standard route is wrong for your case.',
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
      'Tell us in your first message. We would rather point you to the Investor Pass, or tell you to wait, than file something that will not serve your case.',
  },
];

const STEPS = [
  { title: 'A message', body: 'We confirm your route and your fixed fee in writing before you commit to anything.' },
  { title: 'Your documents', body: 'A checklist built for your nationality, with legalisation done in the right order.' },
  { title: 'Asunción', body: 'We file and go to the appointments with you. You show up; we handle the rest.' },
  { title: 'Your cédula', body: 'Once residency is approved we get your cédula and tell you what comes next.' },
];

export default function Page() {
  const latest = getPages('residency').filter((post) => !post.frontmatter.draft).slice(0, 3);

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
      <PhotoHero image="investorpass-hero-asuncion-river-dusk" focus="30% center"
        eyebrow="Paraguay Residency"
        title="Paraguay residency, handled end to end."
        sub="Temporary residency, permanent residency and your cédula, prepared by people who do this every week in Asunción. You show up for the appointments. We do the rest."
        actions={actions}
        trust={heroTrust('residency')}
      />

      <IntentTiles title="Where are you starting?" intro="Pick the closest match. Not sure? The Route Finder tells you in two minutes." tiles={[
        { label: 'Which route fits me?', note: 'Six questions, two minutes', href: '/route-finder', image: 'guide-tile-route-fork' },
        { label: 'Temporary residency', note: 'The usual first step', href: '/residency/temporary-residency', image: 'guide-tile-documents-desk' },
        { label: 'Permanent residency', note: 'The card that stays', href: '/residency/permanent-residency', image: 'frontier-tile-open-door-patio' },
        { label: 'Investor Pass', note: 'Straight to permanent', href: '/investor-pass', image: 'investorpass-tile-real-estate' },
      ]} />

      <Steps
        tone="alt"
        title="How it runs"
        intro="Four steps, in the order they actually happen."
        steps={STEPS}
        link={{ href: '/process', label: 'The full process, step by step' }}
      />

      <Reasons
        title="Why Paraguay"
        intro="No brochure promises: this is what the rules say today, confirmed with you before anything is filed."
        reasons={[
          { title: 'A clear first step', body: <>Temporary residency duration: <Fact k="temporary.duration" site="residency" />.</> },
          { title: 'A card that stays', body: <>Permanent residency comes with a presence rule: <Fact k="permanent.presence_rule" site="residency" />.</> },
          { title: 'Territorial tax', body: <>Foreign-income treatment under the territorial system: <Fact k="tax.foreign_income_treatment" site="residency" />.</> },
        ]}
      />

      <TeamStrip site="residency" />

      {/* Testimonials section stays hidden until real ones exist (plan §7, §6.1). */}

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">The details</Heading>
        <Disclosure title="Frequently asked"><FAQ items={FAQ_ITEMS} /></Disclosure>
      </Section>

      <ArticleCards
        site="residency"
        title="Latest articles"
        articles={latest.map((post) => ({
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          href: contentHref('residency', post.slugPath),
        }))}
        more={{ href: '/guides', label: 'Browse all guides' }}
      />

      <LeadPanel
        site="residency"
        variant="consultation"
        title="Ready to find your route?"
        intro="Tell us about your case in two lines. We come back with the route that fits, the documents you need and the fee, or tell you to wait if that serves you better."
        whatsappMessage="Hi — I have a question about Paraguay residency."
      />
    </>
  );
}
