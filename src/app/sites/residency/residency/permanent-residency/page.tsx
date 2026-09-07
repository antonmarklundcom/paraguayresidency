import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residency/_lib/ServicePage';

const PATH = '/residency/permanent-residency';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Permanent Residency in Paraguay — the 10-Year Card',
    description:
      'Paraguay permanent residency after temporary, or direct via the Investor Pass. What the presence rule really means, filed for you in Asunción.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Permanent residency"
      title="Permanent residency — the long-validity card"
      intro="Most people arrive here after temporary residency. A smaller number skip straight to it through the Investor Pass. Either way, the card itself is the same, and so is the one rule that trips people up: presence."
      faq={[
        {
          question: 'Can I go straight to permanent residency?',
          answer:
            'Yes, through the Investor Pass, which grants permanent residency directly to a qualifying investment without the temporary step first. It is a separate brand with the same team — see the Investor Pass.',
        },
        {
          question: 'What happens if I do not visit often enough?',
          answer:
            'A minimum-presence rule applies to the permanent card. What it means for your specific travel pattern is worth a call before you file, not after — we would rather tell you now than have you find out the hard way.',
        },
        {
          question: 'Does permanent residency expire?',
          answer:
            'It carries a long validity term. We confirm the exact figure and renewal mechanics on your call rather than quoting a number we cannot stand behind here.',
        },
      ]}
      serviceName="Paraguay Permanent Residency Filing"
      serviceDescription="Filing of Paraguay permanent residency after temporary status, or directly via the Investor Pass, including the presence-rule briefing."
      path={PATH}
    >
      <h2>The two ways in</h2>
      <p>
        The standard path is <a href="/residency/temporary-residency">temporary residency</a>{' '}
        first, then an application for permanent status once you have held it for the required
        period. The direct path is the{' '}
        <a href="/investor-pass">Investor Pass</a>, which grants permanent residency in one
        filing to investors who qualify — a different brand under the same team, for a different
        kind of applicant.
      </p>
      <h2>The presence rule, stated plainly</h2>
      <p>
        Permanent residency comes with <Fact k="permanent.presence_rule" site="residency" />. This
        is the single most-misquoted figure in this niche, and we would rather you heard it
        straight from us before you file than assumed something from a forum post. What it means
        in practice depends on how you actually plan to split your time — we walk through your
        specific pattern on the call.
      </p>
      <h2>What we file for you</h2>
      <ul>
        <li>The permanent-residency application itself, once you are eligible.</li>
        <li>A plain briefing on what the presence rule means for your travel plans.</li>
        <li>Coordination with your cédula renewal, so the two stay in sync.</li>
      </ul>
      <p>
        Not sure whether you are better off waiting out temporary residency or qualifying for the
        Investor Pass now? The <a href="/route-finder">Route Finder</a> compares both against your
        actual situation in about two minutes.
      </p>
    </ServicePage>
  );
}
