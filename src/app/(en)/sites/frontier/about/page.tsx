import type { Metadata } from 'next';
import { Band, Breadcrumbs, Button, Eyebrow, Guarantee, OfficeStrip, TeamSection, TrustBar } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/about';

export function generateMetadata(): Metadata {
  return siteMetadata('frontier', {
    title: 'About Paraguay Frontier — Who Files Your Case',
    description:
      'The Asunción team behind paraguayresidency.co.uk, running a dedicated brand for plan-B residency for Americans, Canadians, Britons and Australians.',
    path: PATH,
  });
}

const link = 'text-[var(--accent)] underline underline-offset-4';

export default function Page() {
  return (
    <>
      <Band labelledBy="about-h1">
        <Breadcrumbs site="frontier" items={[{ label: 'About', href: PATH }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div>
            <Eyebrow>About</Eyebrow>
            <h1 id="about-h1" className="mt-5 font-[family-name:var(--display-font)] text-(length:--step-5) leading-[1.02] text-balance">
              One team, a dedicated brand for a plan-B case
            </h1>
          </div>
          <p className="text-(length:--step-0) leading-relaxed text-[var(--fg-muted)] lg:pt-14">
            Paraguay Frontier is run by the same team that files standard residency, cédula and tax cases every week in Asunción — on{' '}
            <a href={siteOrigin('residency')} rel="noopener" className={link}>paraguayresidency.co.uk</a>. We separated this brand because
            Americans, Canadians, Britons and Australians weighing optionality — a residency and tax ID in reserve, not necessarily a full
            move — ask a different set of questions than someone already committed to relocating.
          </p>
        </div>
      </Band>
      <TrustBar site="frontier" />

      <TeamSection site="frontier" tone="alt" />

      <Band labelledBy="how-title">
        <h2 id="how-title" className="sr-only">How we work and why we state the catch</h2>
        <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
          <div className="border-l-4 border-[var(--accent)] bg-[var(--surface)] p-6 sm:p-8">
            <h3 className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">How we work</h3>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              A fixed fee per route, quoted before you commit, a document checklist built for your nationality, and filing handled in
              Asunción. You attend the appointments; the rest is ours. <a className={link} href="/pricing">See the fees</a>.
            </p>
          </div>
          <div className="border-l-4 border-[var(--accent)] bg-[var(--surface)] p-6 sm:p-8">
            <h3 className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">Why we state the catch</h3>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              This niche has a hype problem — golden-visa blog posts that skip the presence rules, the bureaucracy, and the difference between
              territorial tax and no tax at all. We would rather be the site that says so than the one that oversells it, because a client who
              knows what to expect is easier to serve well. Start with{' '}
              <a className={link} href="/stories/paraguay-residency-reddit-questions-answered">the questions people ask most</a>.
            </p>
          </div>
        </div>
      </Band>

      <OfficeStrip site="frontier" tone="alt" />
      <Guarantee site="frontier" />

      <Band tone="alt" labelledBy="rest-title">
        <h2 id="rest-title" className="font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">The rest of what we run</h2>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-[var(--fg-muted)]">
          Done-for-you standard residency services live on{' '}
          <a href={siteOrigin('residency')} rel="noopener" className={link}>paraguayresidency.co.uk</a>, direct permanent residency by
          investment is on <a href={siteOrigin('investorpass')} rel="noopener" className={link}>paraguayinvestorpass.com</a>, and a
          written-down, kept-current reference guide is at{' '}
          <a href={siteOrigin('guide')} rel="noopener" className={link}>paraguayresidencyguide.com</a> if you would rather read the whole
          process yourself first.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/route-finder">Find your route</Button>
          <Button href="/why-paraguay" variant="secondary">Why Paraguay</Button>
          <Button href="/contact" variant="secondary">Contact</Button>
        </div>
      </Band>
    </>
  );
}
