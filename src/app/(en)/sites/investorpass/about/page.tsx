import type { Metadata } from 'next';
import { Band, Breadcrumbs, Button, Eyebrow, Guarantee, OfficeStrip, TeamSection, TrustBar } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';
import { siteOrigin } from '@/sites/registry';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'About Paraguay Investor Pass — Who Files Your Case',
    description:
      'The same Asunción team behind paraguayresidency.co.uk, running a dedicated brand for direct permanent residency by investment.',
    path: PATH,
  });
}

const link = 'text-[var(--accent)] underline underline-offset-4';

export default function Page() {
  return (
    <>
      <Band labelledBy="about-h1">
        <Breadcrumbs site="investorpass" items={[{ label: 'About', href: PATH }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div>
            <Eyebrow>About</Eyebrow>
            <h1 id="about-h1" className="mt-5 font-[family-name:var(--display-font)] text-(length:--step-5) leading-[1.02] text-balance">
              One team, a dedicated brand for a different kind of case
            </h1>
          </div>
          <div className="lg:pt-14"><p className="text-(length:--step-0) leading-relaxed text-[var(--fg-muted)]">
            Paraguay Investor Pass is run by the same team that files standard residency, cédula and tax cases every week in Asunción — on{' '}
            <a href={siteOrigin('residency')} rel="noopener" className={link}>paraguayresidency.co.uk</a>. We separated the brand because
            investors, family offices and migration agents ask different questions and need a different depth of detail than someone filing
            for temporary residency for the first time.
          </p>
          <p className="mt-4 text-[var(--fg)]">{t('investorpass', 'about.teamBody')}</p></div>
        </div>
      </Band>
      <TrustBar site="investorpass" />

      <TeamSection site="investorpass" tone="alt" />

      <Band labelledBy="how-title">
        <h2 id="how-title" className="sr-only">How we work</h2>
        <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
          <div className="border-t border-[var(--accent)]/40 pt-6">
            <h3 className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">How we work</h3>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              We structure the investment, file the application, and stay with you until the permanent card is in your hand. Nothing is filed
              until you have seen the full cost, timeline and exit options in writing.
            </p>
          </div>
          <div className="border-t border-[var(--accent)]/40 pt-6">
            <h3 className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">Why the numbers are hedged</h3>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              The Investor Pass is a new program, and public sources genuinely disagree on the minimum investment and other thresholds. Rather
              than pick one figure and hope it is right, we confirm the current numbers against the resolution text in writing for your case —
              every figure on this site is marked as such until it is. Start with{' '}
              <a className={link} href="/insights/investor-pass-resolution-explained">the resolution, explained</a>.
            </p>
          </div>
        </div>
      </Band>

      <OfficeStrip site="investorpass" tone="alt" />
      <Guarantee site="investorpass" />

      <Band tone="alt" labelledBy="rest-title">
        <h2 id="rest-title" className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">The rest of what we run</h2>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-[var(--fg-muted)]">
          The done-for-you standard residency services live on{' '}
          <a href={siteOrigin('residency')} rel="noopener" className={link}>paraguayresidency.co.uk</a>, and a written-down, kept-current
          reference guide is at <a href={siteOrigin('guide')} rel="noopener" className={link}>paraguayresidencyguide.com</a> if you would
          rather read the whole process yourself first.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/contact">See if you qualify</Button>
          <Button href="/investor-pass/investment-routes" variant="secondary">Investment routes</Button>
          <Button href="/pricing" variant="secondary">Service fee</Button>
        </div>
      </Band>
    </>
  );
}
