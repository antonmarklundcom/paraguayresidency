import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import { ABHeroCta } from '@/components/ABHeroCta';
import {
  HeroContact,
  AfterYouMessage,
  ArticleCards,
  Disclosure,
  Guarantee,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  PriceTable,
  heroTrust,
  Reasons,
  TeamSection,
  TrustBar,
  Fact,
  FAQ,
  Heading,
  Section,
  Testimonials,
  CaseSnapshots,
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

/** The UK-specific reading list (W6): ACRO, FCDO apostille, HMRC, pensions, Brexit. */
const UK_SLUGS = [
  'documents/uk-police-certificate-acro-for-paraguay',
  'documents/apostille-uk-documents-for-paraguay',
  'taxes/uk-tax-when-moving-to-paraguay',
];

const MORE_UK = [
  { href: '/guides/living-in-paraguay/moving-to-paraguay-from-the-uk', label: 'Moving to Paraguay from the UK' },
  { href: '/guides/living-in-paraguay/uk-state-pension-in-paraguay', label: 'The UK State Pension in Paraguay' },
  { href: '/guides/taxes/uk-pensions-isas-and-property-after-moving-to-paraguay', label: 'UK pensions, ISAs and property' },
  { href: '/guides/comparisons/paraguay-vs-portugal-for-british-citizens', label: 'Paraguay vs Portugal for Britons' },
];

export default function Page() {
  const pages = getPages('residency').filter((post) => !post.frontmatter.draft);
  const uk = UK_SLUGS.map((slug) => pages.find((post) => post.slugPath === slug)).filter((post) => post !== undefined);

  const actions = (
    <>
      <HeroContact site="residency" message="Hi — I have a question about Paraguay residency." fallbackHref="#contact" />
      <ABHeroCta href="/route-finder" />
    </>
  );

  return (
    <>
      <PhotoHero
        layout="split"
        image="residency-hero-asuncion-colonnade"
        video={{ id: 'residency-hero-asuncion-colonnade', loop: false }}
        focus="50% center"
        eyebrow="Paraguay Residency"
        title="Paraguay residency, handled end to end."
        sub="Temporary residency, permanent residency and your cédula, prepared by people who do this every week in Asunción. You show up for the appointments. We do the rest."
        actions={actions}
        trust={heroTrust('residency')}
      />

      <TrustBar site="residency" />

      <PriceTable
        site="residency"
        title="One fixed fee per route"
        intro="Quoted in writing before you commit. Government fees, apostilles and translations are separate, and we list them for your case up front."
      />

      <IntentTiles
        title="Where are you starting?"
        intro="Pick the closest match. Not sure? The Route Finder tells you in two minutes."
        tiles={[
          { label: 'Which route fits me?', note: 'Six questions, two minutes', href: '/route-finder', image: 'residency-tile-route-finder-map' },
          { label: 'Temporary residency', note: 'The usual first step', href: '/residency/temporary-residency', image: 'residency-tile-temporary-documents' },
          { label: 'Permanent residency', note: 'The card that stays', href: '/residency/permanent-residency', image: 'residency-tile-permanent-colonial-door' },
          { label: 'Investor Pass', note: 'Straight to permanent', href: '/investor-pass', image: 'residency-tile-investor-tower' },
        ]}
      />

      <AfterYouMessage site="residency" tone="alt" message="Hi — I have a question about Paraguay residency." />

      <TeamSection site="residency" />
      <Testimonials site="residency" tone="alt" />
      <CaseSnapshots site="residency" />

      <Guarantee site="residency" tone="alt" />

      <ArticleCards
        site="residency"
        title="Coming from the UK?"
        articles={uk.map((post) => ({
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          href: contentHref('residency', post.slugPath),
          hub: post.hub,
        }))}
        more={{ href: '/guides/living-in-paraguay/moving-to-paraguay-from-the-uk', label: 'Moving from the UK' }}
      />
      <Section width="narrow" spacing="tight">
        <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {MORE_UK.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="inline-flex min-h-11 items-center gap-2 text-[var(--accent)] underline underline-offset-4">
                {link.label} <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Reasons
        title="Why Paraguay"
        intro="No brochure promises: this is what the rules say today, confirmed with you before anything is filed."
        reasons={[
          { title: 'A clear first step', body: <>Temporary residency duration: <Fact k="temporary.duration" site="residency" />.</> },
          { title: 'A card that stays', body: <>Permanent residency comes with a presence rule: <Fact k="permanent.presence_rule" site="residency" />.</> },
          { title: 'Territorial tax', body: <>Foreign-income treatment under the territorial system: <Fact k="tax.foreign_income_treatment" site="residency" />.</> },
        ]}
        footer={
          <p>
            Thinking beyond residency? <a href="/residency/citizenship" className="text-[var(--accent)] underline underline-offset-2">Paraguay citizenship</a>{' '}
            starts with permanent residency, and we plan the residency years around the date you can apply.
          </p>
        }
      />

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">The details</Heading>
        <Disclosure title="Frequently asked"><FAQ items={FAQ_ITEMS} /></Disclosure>
        <p className="mt-[var(--space-6)] text-[var(--fg-muted)]">
          Comparing residency agents, lawyers and consultants? Read{' '}
          <a href="/guides/documents/choosing-a-paraguay-residency-agent" className="text-[var(--accent)] underline underline-offset-2">
            how to choose a Paraguay residency agent
          </a>
          : the questions to ask anyone, including us. Or <a href="/guides" className="text-[var(--accent)] underline underline-offset-2">browse all guides</a>.
        </p>
      </Section>

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
