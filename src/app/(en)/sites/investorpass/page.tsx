import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCards, CaseSnapshots, Disclosure, Fact, Guarantee, JsonLd, LeadPanel, TeamStrip, Testimonials, TrustBar } from '@/components';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { getPages } from '@/content';
import { contentHref } from '@/lib/content-href';
import { siteMetadata, serviceOfferJsonLd } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';
import { Agents } from './_lib/Agents';
import { Documents } from './_lib/Documents';
import { InWriting } from './_lib/InWriting';
import { MemoFaq, type MemoFaqItem } from './_lib/MemoFaq';
import { MemoStrip } from './_lib/MemoStrip';
import { Qualifier } from './_lib/Qualifier';
import { RoutesTable } from './_lib/RoutesTable';
import { Timeline } from './_lib/Timeline';

const PATH = '/';
const MESSAGE = 'Hi — I have a question about the Investor Pass.';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Paraguay Investor Pass — Permanent Residency by Investment',
    description:
      'The Paraguay Investor Pass grants permanent residency to qualifying investors, skipping temporary residency. Routes, requirements and timeline.',
    path: PATH,
  });
}

/** Read against the 2026 resolution, in reading order; the block shows the first three. */
const FEATURED = [
  'what-the-investor-pass-is',
  'investor-pass-resolution-explained',
  'investor-pass-vs-suace',
  'paraguay-golden-visa',
  'paraguay-citizenship-by-investment',
  'financial-instruments-and-tourism-routes',
];

const FAQ_ITEMS: MemoFaqItem[] = [
  {
    question: 'Is the programme stable?',
    answer:
      'It is new. The Investor Pass was introduced in 2026 and its implementing rules are still being issued and adjusted. We quote the rules in force on the day we write to you, with their source, and flag what could change before you file.',
  },
  {
    question: 'Can family be included?',
    answer:
      'In general a spouse and dependent children can apply alongside the main investor, but conditions and documents differ and have not been settled for every case. We confirm your family’s position in writing before anything is filed.',
  },
  {
    question: 'Can I exit the investment?',
    answer:
      'Exit terms depend on the route and on minimum holding requirements that are still being clarified. Selling early may affect your status. Your brief sets out what is known, what is unconfirmed, and the consequences of each exit.',
  },
  {
    question: 'How is the investment verified?',
    answer:
      'Typically through documentary evidence such as deeds, bank certificates or company filings, together with proof of the lawful origin of the funds, reviewed by the migration authority. We assemble and check this file before submission.',
  },
  {
    question: 'What does the standard route cost instead?',
    answer:
      'The standard route goes through temporary residency first. Upfront costs are usually lower, but the process takes longer and involves a second application. We quote both side by side for your case.',
    after: (
      <p>
        <Link href="/investor-pass/vs-standard-residency">Compare the two routes</Link> or see <Link href="/pricing">how we price the service</Link>.
      </p>
    ),
  },
  {
    question: 'Is this the same team as paraguayresidency.co.uk?',
    answer:
      'Yes. Investor Pass is a dedicated brand because it targets a different applicant — investors, family offices, migration agents — with a different ticket size, filed by the same team in Asunción.',
  },
];

export default function Page() {
  const pages = getPages('investorpass');
  const articles = FEATURED.flatMap((slug) => {
    const post = pages.find((page) => !page.frontmatter.draft && page.slugPath.endsWith(`/${slug}`));
    return post ? [{ title: post.frontmatter.title, description: post.frontmatter.description, href: contentHref('investorpass', post.slugPath), hub: 'insights' }] : [];
  }).slice(0, 3);

  return (
    <div className="ipm">
      <MemoStrip />

      <div className="ipm-wrap">
        <section className="ipm-hero" aria-labelledby="hero-title">
          <div className="ipm-hero-copy">
            <p className="ipm-sec" style={{ margin: 0 }}>Decision memo · Investor Pass 2026</p>
            <h1 id="hero-title" className="ipm-h1">Permanent residency in Paraguay, in one step.</h1>
            <p className="ipm-lede">
              The Investor Pass lets qualifying investors skip temporary residency entirely. We structure the investment, file the application and stay with you until the permanent card is in your hand.
            </p>
            <div className="ipm-actions">
              <a href="#qualify" className="ipm-btn ipm-btn-primary">See if you qualify</a>
              <a href="#routes" className="ipm-btn">Investment routes</a>
            </div>
            <ol className="ipm-points">
              <li><span>01</span><span>Four qualifying routes (real estate, productive business, financial instruments, tourism) matched to your capital and goals</span></li>
              <li><span>02</span><span>Thresholds and rules quoted in writing, not from a stale page</span></li>
              <li><span>03</span><span>Nothing filed until you have seen cost, timeline and exit options in writing</span></li>
            </ol>
          </div>
          <Qualifier />
        </section>
      </div>

      {/* Proof strip: renders nothing until content/shared/proof.ts has real values. */}
      <TrustBar site="investorpass" />

      {/* §01 */}
      <section id="routes" aria-labelledby="routes-title" className="ipm-rule-top scroll-mt-20">
        <div className="ipm-wrap ipm-band">
          <div className="ipm-hd">
            <p className="ipm-sec" style={{ margin: 0 }}>§ 01 · Routes</p>
            <div>
              <h2 id="routes-title" className="ipm-h2">Four routes, compared on the same terms.</h2>
              <p className="ipm-lede">Which assets and projects qualify is set by the authority and is still being clarified. Treat this as orientation; we confirm eligibility for your case in writing.</p>
            </div>
          </div>
          <RoutesTable />
          <p className="ipm-note" style={{ marginTop: 16 }}>
            Minimum investment, as currently published: <Fact k="investorpass.min_investment_usd" site="investorpass" />. Thresholds are quoted in writing with the source and date of the rule. <Link href="/investor-pass/investment-routes" className="text-[var(--accent)] underline">The routes in detail</Link>.
          </p>
        </div>
      </section>

      {/* §02 */}
      <section id="timeline" aria-labelledby="timeline-title" className="ipm-alt scroll-mt-20">
        <div className="ipm-wrap ipm-band">
          <div className="ipm-hd">
            <p className="ipm-sec" style={{ margin: 0 }}>§ 02 · Timeline</p>
            <div>
              <h2 id="timeline-title" className="ipm-h2">One application instead of two.</h2>
              <p className="ipm-lede">The standard path runs through temporary residency before you can apply for permanent status. Under the Pass, as currently published, qualifying investors apply for permanent residency directly.</p>
            </div>
          </div>
          <Timeline />
        </div>
      </section>

      {/* §03 */}
      <section id="writing" aria-labelledby="writing-title" className="scroll-mt-20">
        <div className="ipm-wrap ipm-band">
          <div className="ipm-hd">
            <p className="ipm-sec" style={{ margin: 0 }}>§ 03 · In writing</p>
            <div className="ipm-body">
              <div style={{ display: 'grid', gap: 12 }}>
                <h2 id="writing-title" className="ipm-h2">What you get in writing before anything is filed</h2>
                <p className="ipm-lede">One written brief, dated, with the rule sources it relies on. Where a point is not yet settled by the authority, the brief says so.</p>
              </div>
              <InWriting />
            </div>
          </div>
        </div>
      </section>

      {/* Real people and real cases: each hides itself until content/shared/proof.ts has entries. */}
      <TeamStrip site="investorpass" />
      <Testimonials site="investorpass" />
      <CaseSnapshots site="investorpass" />
      <Guarantee site="investorpass" />

      {/* §04 */}
      <section id="documents" aria-labelledby="documents-title" className="ipm-rule-top scroll-mt-20">
        <div className="ipm-wrap ipm-band">
          <div className="ipm-hd">
            <p className="ipm-sec" style={{ margin: 0 }}>§ 04 · Documents</p>
            <div className="ipm-body">
              <div style={{ display: 'grid', gap: 12 }}>
                <h2 id="documents-title" className="ipm-h2">Documents by route</h2>
                <p className="ipm-lede">Indicative. The final list depends on route, nationality and current guidance, and is confirmed in your brief.</p>
              </div>
              <Documents />
            </div>
          </div>
        </div>
      </section>

      {/* §05 */}
      <Agents />

      {/* §06 */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20">
        <div className="ipm-wrap ipm-band">
          <div className="ipm-hd">
            <p className="ipm-sec" style={{ margin: 0 }}>§ 06 · FAQ</p>
            <div className="ipm-body">
              <h2 id="faq-title" className="ipm-h2">Questions we are asked first</h2>
              <MemoFaq items={FAQ_ITEMS} />
              <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '4px 24px' }}>
                <Link className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4" href="/investor-pass/process">The process, step by step</Link>
                <Link className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4" href="/investor-pass/requirements">Requirements</Link>
                <Link className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4" href="/investor-pass/for-agents">For migration agents</Link>
              </p>
              <Disclosure title="The full process"><ProcessTimeline site="investorpass" route="investor" /></Disclosure>
            </div>
          </div>
        </div>
      </section>

      <ArticleCards
        site="investorpass"
        title="Read the rules behind this page"
        articles={articles}
        more={{ href: '/insights', label: 'All Investor Pass insights' }}
        tone="alt"
      />

      {/* §07 — the existing lead form (variant investor_inquiry), restyled by CSS under .ipm-qualify. */}
      <div className="ipm-qualify">
        <LeadPanel
          site="investorpass"
          variant="investor_inquiry"
          id="qualify"
          eyebrow="§ 07 · Qualification"
          title="See if you qualify."
          intro="Send a few facts about your capital and family. A member of the Asunción team replies in writing within one working day with the routes that fit and what is not yet confirmed. We do not book sales calls."
          whatsappMessage={MESSAGE}
          footnote={
            <>
              Not investing? See{' '}
              <a href={siteOrigin('residency')} className="text-[var(--accent)] underline underline-offset-2">standard residency routes</a>{' '}
              on paraguayresidency.co.uk instead.
            </>
          }
        />
      </div>

      <JsonLd
        data={serviceOfferJsonLd('investorpass', {
          name: 'Paraguay Investor Pass',
          description:
            'Direct permanent residency in Paraguay for qualifying investors, filed end to end.',
          path: PATH,
        })}
      />
    </div>
  );
}
