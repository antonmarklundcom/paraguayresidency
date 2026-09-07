import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residency/_lib/ServicePage';

const PATH = '/residency/tax-residency';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Tax Residency & RUC — Who It Suits',
    description:
      'Paraguay taxes territorially — what that means for foreign income, who a RUC and tax residency suit, and what your accountant still confirms.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Tax residency"
      title="Tax residency and the RUC — who this actually suits"
      intro="Paraguay runs a territorial tax system, and that phrase gets thrown around loosely online. We say plainly what it does and does not cover, get you your RUC, and stop short of anything that should be your own accountant's call."
      faq={[
        {
          question: 'Does becoming a tax resident here mean I stop paying tax at home?',
          answer:
            'Not automatically, and we will not tell you it does. Your home country’s own rules decide that question — this is exactly what your accountant needs to confirm for your specific situation.',
        },
        {
          question: 'Do I need a RUC even if I am not running a business?',
          answer:
            'Often yes — banking and some contracts ask for one. We walk through whether your case needs it and get it set up alongside your residency filing.',
        },
        {
          question: 'What income is actually taxed here?',
          answer:
            'The territorial system taxes what is sourced in Paraguay, not your worldwide income. We explain what that means for your specific income streams on the call rather than in generic terms here.',
        },
      ]}
      serviceName="Paraguay Tax Residency & RUC Setup"
      serviceDescription="RUC registration and tax residency guidance under Paraguay's territorial system, explained honestly with limits stated."
      path={PATH}
    >
      <h2>What the territorial system actually means</h2>
      <p>
        Paraguay applies <Fact k="tax.territorial_rate" site="residency" /> under a system where{' '}
        <Fact k="tax.foreign_income_treatment" site="residency" />. That is a real, useful feature
        for someone with foreign-sourced income. It is also a narrower claim than the &ldquo;tax
        haven&rdquo; framing that circulates online, and we would rather be the site that says so
        than the one that oversells it.
      </p>
      <h2>Who this genuinely suits</h2>
      <p>
        People with income sourced outside Paraguay — remote work, foreign investments, a pension
        — tend to get the clearest benefit from the system. People with Paraguay-sourced income,
        or a business operating locally, have a more ordinary tax picture, and we say that upfront
        rather than blurring it into a single pitch.
      </p>
      <h2>The RUC</h2>
      <p>
        A RUC is Paraguay&apos;s tax identification number, and most residents end up needing one
        for banking or contracts even without running a local business. We register it alongside
        your residency filing so you are not making a second trip for it later.
      </p>
      <h2>What we do, and what we do not</h2>
      <ul>
        <li>We register your RUC and explain the territorial system as it applies generally.</li>
        <li>We do not advise on your home country&apos;s tax obligations — that is your accountant&apos;s job, and we say so rather than guessing.</li>
        <li>
          Unsure if tax residency is the piece you actually need? The{' '}
          <a href="/route-finder">Route Finder</a> asks about your tax motive directly.
        </li>
      </ul>
    </ServicePage>
  );
}
