import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '../../_lib/ServicePage';

const PATH = '/investor-pass/process';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Investor Pass Process — From Call to Permanent Card',
    description:
      'How the Paraguay Investor Pass process runs, step by step: structuring the investment, filing, and the cédula once residency is approved.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'How long does the whole process take?',
    answer:
      'It depends on which route you choose and how quickly your documentation and funds transfer come together — we give you a realistic window for your specific case on the first call, not a marketing number.',
  },
  {
    question: 'Do I need to be in Paraguay for the whole process?',
    answer:
      'No. Most of the structuring and filing can proceed with you traveling in for specific appointments — we tell you exactly which steps require your physical presence and time them together where possible.',
  },
  {
    question: 'What happens if my investment falls through partway?',
    answer:
      'We screen the structure before funds move specifically to avoid this. If circumstances change mid-process, we tell you plainly what it does to your timeline rather than letting the filing proceed on a shaky foundation.',
  },
];

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Process"
      title="From first call to permanent card"
      intro="Five stages, most of them able to run in parallel with your own schedule. Here is what actually happens, in order."
      faq={FAQ}
      serviceName="Investor Pass — Process"
      serviceDescription="The end-to-end filing process for the Paraguay Investor Pass, from investment structuring to the cédula."
      path={PATH}
    >
      <h2>1. The call</h2>
      <p>
        We confirm which of the four routes fits your capital and goal, and quote the current
        qualifying threshold against the resolution text — not a web page that may already be out
        of date.
      </p>

      <h2>2. Structuring the investment</h2>
      <p>
        We set up whatever the chosen route requires — the property purchase, the business
        investment, the financial instrument, the tourism project — and assemble the
        source-of-funds documentation that review actually looks for.
      </p>

      <h2>3. Filing</h2>
      <p>
        Your identity documentation, background clearance and investment evidence go in together
        as one application for permanent residency directly — no separate temporary-residency
        stage first.
      </p>

      <h2>4. Approval and the cédula</h2>
      <p>
        Once residency is approved, your cédula follows — <Fact k="cedula.timeline" site="investorpass" />.
        The card is issued for <Fact k="investorpass.validity_years" site="investorpass" />.
      </p>

      <h2>5. After the card is in your hand</h2>
      <p>
        A permanent card carries its own presence expectations — <Fact k="permanent.presence_rule" site="investorpass" />.
        We explain exactly what that means for your travel pattern before you finalise anything, so
        there are no surprises once the process is done.
      </p>

      <p>
        If you are still deciding whether the Investor Pass is worth the investment compared with
        the standard route, see the <a href="/investor-pass/vs-standard-residency">full comparison</a>.
      </p>
    </ServicePage>
  );
}
