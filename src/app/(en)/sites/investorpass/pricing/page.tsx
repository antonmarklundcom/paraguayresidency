import type { Metadata } from 'next';
import { AfterYouMessage, Band, Breadcrumbs, Button, Eyebrow, Guarantee, LeadPanel, PriceTable, SectionHeader } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/pricing';
const MESSAGE = 'Hi — I would like a quote for the Investor Pass.';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Investor Pass Service Fee — Fixed, Quoted in Writing',
    description:
      'How the Paraguay Investor Pass service fee works: one fixed fee for structuring and filing, quoted in writing before you commit. Your investment and government fees are separate.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <>
      <Band labelledBy="pricing-heading">
        <Breadcrumbs site="investorpass" items={[{ label: 'Pricing', href: PATH }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20">
          <div>
            <Eyebrow>Service fee</Eyebrow>
            <h1 id="pricing-heading" className="mt-5 font-[family-name:var(--display-font)] text-(length:--step-5) leading-[1.02] text-balance">
              One fixed fee for structuring and filing
            </h1>
          </div>
          <div>
            <p className="leading-relaxed text-[var(--fg-muted)]">
              The fee is for our work: choosing the route that fits your capital, reviewing the structure before funds move, and coordinating the
              filing until your card arrives. It is quoted in writing before you commit. The investment itself is yours and is not part of it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="#inquiry">Private consultation</Button>
              <Button href="/investor-pass/investment-routes" variant="secondary">Investment routes</Button>
            </div>
          </div>
        </div>
      </Band>

      <PriceTable site="investorpass" tone="alt" title="The Investor Pass service fee" intro="The routes have different thresholds and paperwork, so the quote follows your route. What is fixed is our fee, agreed in writing first." />

      <Band labelledBy="separate-title">
        <SectionHeader id="separate-title" eyebrow="Kept separate" title="What is not in our fee" />
        <dl className="mt-12 grid gap-x-16 gap-y-8 md:grid-cols-3">
          <div>
            <dt className="font-[family-name:var(--display-font)] text-(length:--step-1)">The investment</dt>
            <dd className="mt-2 leading-relaxed text-[var(--fg-muted)]">The capital you put into property, a business, instruments or a tourism project belongs to you. The threshold for each route is on the <a className="text-[var(--accent)] underline underline-offset-4" href="/investor-pass/requirements">requirements page</a>.</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--display-font)] text-(length:--step-1)">Government fees</dt>
            <dd className="mt-2 leading-relaxed text-[var(--fg-muted)]">Official fees go to the Paraguayan state. Apostilles and translations are paid to their providers. We list which apply to your application before you decide.</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--display-font)] text-(length:--step-1)">Tax and legal advice</dt>
            <dd className="mt-2 leading-relaxed text-[var(--fg-muted)]">Your own accountant or lawyer advises on obligations in your home country. See <a className="text-[var(--accent)] underline underline-offset-4" href="/insights/investor-pass-and-your-taxes">Investor Pass and your taxes</a>.</dd>
          </div>
        </dl>
      </Band>

      <AfterYouMessage site="investorpass" tone="alt" message={MESSAGE} />
      <Guarantee site="investorpass" />

      <LeadPanel
        site="investorpass"
        variant="investor_inquiry"
        id="inquiry"
        pagePath={PATH}
        title="Ask for the written quote"
        intro="Tell us your capital and goal. We send the route, our fee and the separate costs in writing."
        whatsappMessage={MESSAGE}
      />
    </>
  );
}
