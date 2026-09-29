import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  HeroContact,
  Button,
  PhotoHero,
  heroTrust,
  TrustBar,
  IntentTiles,
  PriceTable,
  AfterYouMessage,
  ArticleCards,
  TeamStrip,
  Guarantee,
  Testimonials,
  Fact,
  FAQ,
  Heading,
  LeadPanel,
  Band,
  Eyebrow,
  SectionHeader,
  Section,
  WhatsAppButton,
  CaseSnapshots,
} from '@/components';
import { getPages } from '@/content';
import { contentHref } from '@/lib/content-href';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/';
const MESSAGE = 'Hi — I have a question about a second residency in Paraguay.';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'Paraguay Residency for Americans & Expats — Plan B, Handled',
    description:
      'Second residency in Paraguay: low thresholds, territorial tax, a permanent card. Routes compared, presence rules stated plainly, filing in Asunción.',
    path: PATH,
  });
}

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

/** "The catch", a call-out: a red-earth rule, a mono label, plain words. */
function Catch({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <aside className="border-l-4 border-[var(--accent)] bg-[var(--surface)] px-6 py-6 sm:px-8">
      <p className="font-[family-name:var(--font-mono)] text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--accent)]">{label}</p>
      <h3 className="mt-2 font-[family-name:var(--display-font)] text-(length:--step-2) leading-tight text-balance">{title}</h3>
      <div className="mt-3 leading-relaxed text-[var(--fg-muted)]">{children}</div>
    </aside>
  );
}

/** The document path by passport: which story to read first for each. */
const PASSPORTS: { code: string; name: string; slugs: string[] }[] = [
  { code: 'US', name: 'American passport', slugs: ['us-document-chain-before-paraguay', 'us-taxes-while-holding-paraguay-residency'] },
  { code: 'CA', name: 'Canadian passport', slugs: ['canadian-document-chain-for-paraguay', 'paraguay-residency-for-canadians'] },
  { code: 'AU', name: 'Australian passport', slugs: ['moving-to-paraguay-from-australia'] },
];

const MORE_STORIES = [
  'the-presence-rules-nobody-explains',
  'the-real-cost-of-holding-a-paraguay-plan-b',
  'paraguay-residency-reddit-questions-answered',
  'retiring-in-paraguay-on-social-security',
  'paraguay-citizenship-and-a-second-passport',
  'paraguay-vs-costa-rica-and-ecuador-for-a-plan-b',
];

export default function Page() {
  const pages = getPages('frontier').filter((page) => !page.frontmatter.draft);
  const bySlug = (slug: string) => pages.find((page) => page.slugPath.endsWith(`/${slug}`));
  const stories = MORE_STORIES.flatMap((slug) => {
    const post = bySlug(slug);
    return post ? [{ title: post.frontmatter.title, description: post.frontmatter.description, href: contentHref('frontier', post.slugPath), hub: 'stories' }] : [];
  });

  return (
    <>
      <PhotoHero
        image="frontier-hero-red-earth-ranch-gate"
        video={{ id: 'frontier-hero-red-earth-ranch-gate' }}
        position="upper-left"
        eyebrow="Plan B, handled"
        title="A second residency you can actually get."
        sub="Permanent residency without a million-dollar investment. We handle the paperwork in Asunción."
        actions={
          <>
            <Button href="/route-finder">Find your route</Button>
            <HeroContact site="frontier" message={MESSAGE} />
          </>
        }
        trust={heroTrust('frontier')}
      />
      <TrustBar site="frontier" />

      {/* The read-first column with a narrow sidebar: the catch, said up front. */}
      <Band labelledBy="catch-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20">
          <div className="max-w-[46rem]">
            <Eyebrow>Read this first</Eyebrow>
            <h2 id="catch-title" className="mt-5 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
              Plan B, honestly: what you get and where the catch is
            </h2>
            <p className="mt-6 text-(length:--step-0) leading-relaxed text-[var(--fg-muted)]">
              You have probably read the &ldquo;Paraguay golden visa&rdquo; posts. Most skip the part where a real government office
              processes real paperwork on its own schedule. We are here to get you a genuine residency card and a tax ID you can hold
              in reserve, filed correctly the first time, so it is there if and when you need it. Some clients move here fully. Most do
              not, and that is fine.
            </p>
            <div className="mt-10 space-y-6">
              <Catch label="The catch" title="Paperwork sets the pace, not us">
                <p>Documents take longer than a blog post suggests and some offices move slowly. We give you the order to gather them in and tell you what takes time.</p>
              </Catch>
              <Catch label="The catch" title="The presence rule is real">
                <p>Temporary residency duration: <Fact k="temporary.duration" site="frontier" />. Permanent residency: <Fact k="permanent.presence_rule" site="frontier" />. Your travel pattern decides whether this works as a plan B.</p>
                <p className="mt-3"><a className="font-medium text-[var(--accent)] underline underline-offset-4" href="/stories/the-presence-rules-nobody-explains">The presence rules, stated plainly</a></p>
              </Catch>
              <Catch label="The catch" title="Territorial is not tax-free">
                <p>Paraguay applies <Fact k="tax.territorial_rate" site="frontier" />. Foreign-income treatment: <Fact k="tax.foreign_income_treatment" site="frontier" />. What it means for your own country&apos;s rules is a question for your own accountant.</p>
                <p className="mt-3"><a className="font-medium text-[var(--accent)] underline underline-offset-4" href="/tax">Territorial tax, without the hype</a></p>
              </Catch>
            </div>
            <blockquote className="mt-12 border-t-2 border-[var(--accent)] pt-6">
              <p className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-snug text-[var(--accent)] text-balance">
                A client who knows what to expect is easier to serve well than one who was sold a fantasy.
              </p>
              <footer className="mt-3 font-[family-name:var(--font-mono)] text-(length:--step--2) uppercase tracking-[.14em] text-[var(--fg-muted)]">Our rule</footer>
            </blockquote>
          </div>
          <aside aria-label="Start here" className="self-start lg:sticky lg:top-24">
            <div className="border-t-2 border-[var(--fg)] bg-[var(--surface)] p-6">
              <p className="font-[family-name:var(--font-mono)] text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]">Start here</p>
              <ul className="mt-4 divide-y divide-[var(--border)]">
                {[
                  ['Why a plan B', '/why-paraguay'],
                  ['The three routes compared', '/routes'],
                  ['Tax, plainly', '/tax'],
                  ['How the process works', '/process'],
                  ['What it costs', '/pricing'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-11 items-center justify-between gap-3 py-2 font-medium hover:text-[var(--accent)]">
                      {label} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 [&>a]:w-full">
                <Button href="/route-finder">Find your route</Button>
                <WhatsAppButton site="frontier" message={MESSAGE} variant="secondary" placement="sidebar" />
              </div>
            </div>
          </aside>
        </div>
      </Band>

      <IntentTiles
        title="Start with your question"
        tiles={[
          { label: 'Do I have to move?', href: '/stories/the-presence-rules-nobody-explains', image: 'frontier-tile-airport-bench-bag' },
          { label: 'Land and farms as a foreigner', href: '/stories/land-and-farms-as-a-foreigner', image: 'frontier-tile-fence-pasture-cattle' },
          { label: 'What life costs', href: '/stories/cost-of-living-reality-check', image: 'frontier-tile-small-town-veranda-street' },
          { label: 'Tax and remote income', href: '/tax', image: 'frontier-tile-laptop-veranda-terere' },
        ]}
      />

      {/* The US / CA / AU document path. */}
      <Band tone="alt" labelledBy="path-title">
        <SectionHeader
          id="path-title"
          eyebrow="Document path"
          title="Your passport decides the paperwork"
          intro="Apostilled records, police certificates and translations differ by country. Start with the guide for your passport, then get the full checklist."
          aside={<Button href="/documents/checklist" variant="secondary">Document checklist</Button>}
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {PASSPORTS.map((passport) => (
            <li key={passport.code} className="flex flex-col border-t-2 border-[var(--fg)] bg-[var(--surface)] p-6">
              <p className="font-[family-name:var(--font-mono)] text-(length:--step-3) leading-none text-[var(--accent)]">{passport.code}</p>
              <p className="mt-2 text-(length:--step--1) font-medium uppercase tracking-[.14em] text-[var(--fg-muted)]">{passport.name}</p>
              <ul className="mt-5 space-y-4">
                {passport.slugs.flatMap((slug) => {
                  const post = bySlug(slug);
                  return post ? [(
                    <li key={slug}>
                      <a href={contentHref('frontier', post.slugPath)} className="group block min-h-11">
                        <span className="font-[family-name:var(--display-font)] text-(length:--step-1) leading-snug group-hover:text-[var(--accent)]">{post.frontmatter.title}</span>
                        <span className="mt-1 line-clamp-3 block text-(length:--step--1) leading-relaxed text-[var(--fg-muted)]">{post.frontmatter.description}</span>
                      </a>
                    </li>
                  )] : [];
                })}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-(length:--step--1) text-[var(--fg-muted)]">
          Holding a UK or another passport? The <a className="text-[var(--accent)] underline underline-offset-4" href="/documents/checklist">checklist</a> covers it, and the{' '}
          <a className="text-[var(--accent)] underline underline-offset-4" href={siteOrigin('residency')}>hub</a> has the UK-specific pages.
        </p>
      </Band>

      <PriceTable site="frontier" />

      <AfterYouMessage site="frontier" tone="alt" message={MESSAGE} />

      <ArticleCards
        site="frontier"
        title="Plan B, by situation"
        articles={stories}
        more={{ href: '/stories', label: 'Browse all stories' }}
      />

      <Testimonials site="frontier" tone="alt" />
      <CaseSnapshots site="frontier" />
      <Guarantee site="frontier" />
      <TeamStrip site="frontier" />

      <Section width="narrow" tone="alt">
        <Heading level={2}>Questions we get</Heading>
        <FAQ items={FAQ_ITEMS} />
        <p className="mt-[var(--space-6)] text-[var(--fg-muted)]">
          Not ready to file anything yet?{' '}
          <a href="/guide" className="text-[var(--accent)] underline underline-offset-4">Read the guide first</a>.
        </p>
      </Section>

      <LeadPanel
        site="frontier"
        variant="consultation"
        title="Ready to find your route?"
        intro="Two minutes tells you which route fits, and where the catch is. Message us, or leave the form."
        whatsappMessage={MESSAGE}
        footnote={
          <>
            Investing serious capital instead?{' '}
            <a href={siteOrigin('investorpass')} className="text-[var(--accent)] underline underline-offset-2">See the Investor Pass</a>.
          </>
        }
      />
    </>
  );
}
