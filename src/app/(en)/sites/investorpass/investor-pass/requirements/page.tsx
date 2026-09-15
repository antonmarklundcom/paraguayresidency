import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '../../_lib/ServicePage';

const PATH = '/investor-pass/requirements';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Investor Pass Requirements — Paraguay Permanent Residency',
    description:
      'What qualifies for the Paraguay Investor Pass: capital, documentation and due diligence, before you file.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'Do I need to already have a company or property in Paraguay?',
    answer:
      'No. Structuring the investment — buying the property, forming or investing in the business, placing the qualifying instrument — is part of what we handle, not a precondition for talking to us.',
  },
  {
    question: 'Is there a language or residency-history requirement?',
    answer:
      'No language test and no prior time in Paraguay is required. The qualifying investment is the requirement; everything else is standard identity and background documentation.',
  },
  {
    question: 'What disqualifies an applicant?',
    answer:
      'A criminal record that fails background screening, or capital that cannot be shown to come from a legitimate, documented source. We screen for both before you commit to a structure.',
  },
];

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Requirements"
      title="What the Investor Pass actually requires"
      intro="Capital, clean documentation, and a route that fits your goal. Nothing exotic — but the details matter, and public sources are inconsistent about the exact figures."
      faq={FAQ}
      serviceName="Investor Pass — Requirements"
      serviceDescription="Documentation and due-diligence requirements for the Paraguay Investor Pass."
      path={PATH}
    >
      <h2>The qualifying investment</h2>
      <p>
        Every route needs a qualifying investment that starts{' '}
        <Fact k="investorpass.min_investment_usd" site="investorpass" />. The exact threshold for
        your chosen route is confirmed against the resolution text before you file — see{' '}
        <a href="/investor-pass/investment-routes">investment routes</a> for what each one covers.
      </p>

      <h2>Identity and background documentation</h2>
      <p>
        A valid passport, apostilled or legalised civil documents (birth certificate, marriage
        certificate where relevant), and a police clearance certificate from every country you
        have lived in for a meaningful period. Requirements vary slightly by nationality — we give
        you the exact checklist on the first call, not a generic list.
      </p>

      <h2>Proof of the funds themselves</h2>
      <p>
        Because the investment is the qualifying event, its source has to be documented — bank
        statements, sale proceeds, business records, whatever traces the capital back to a
        legitimate origin. This is the step migration agents most often underestimate: a
        structurally sound investment with weak source-of-funds paperwork stalls at review.
      </p>

      <h2>Family inclusion</h2>
      <p>
        A spouse and dependent children can generally be included on the same application. Each
        dependent adds their own identity documentation; the qualifying investment itself is not
        multiplied per family member. <Fact k="cedula.timeline" site="investorpass" /> once the
        residency itself is approved, for every family member included.
      </p>

      <h2>What we screen before you invest anything</h2>
      <p>
        We review your intended route, your documentation and your background before any capital
        moves, specifically so you are not the one discovering a disqualifying issue after
        committing funds. If your case is unusual, we say so on the first call.
      </p>
    </ServicePage>
  );
}
