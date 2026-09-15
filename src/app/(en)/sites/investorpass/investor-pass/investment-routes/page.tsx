import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '../../_lib/ServicePage';

const PATH = '/investor-pass/investment-routes';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Investor Pass Investment Routes — Real Estate to Tourism',
    description:
      'The four qualifying routes for the Paraguay Investor Pass, what each one covers, and which fits your capital and your goal.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'Can I combine two routes to reach the threshold?',
    answer:
      'Generally no — each route is evaluated as its own qualifying investment. If your capital sits across two categories, we tell you on the call which single route is the cleaner filing.',
  },
  {
    question: 'Which route is fastest to structure?',
    answer:
      'Real estate is usually the most straightforward to document, because title and purchase price are clean records. Business and financial-instrument routes take longer to structure correctly, not because they are riskier, just because there is more paperwork proving the investment is real and productive.',
  },
  {
    question: 'What if none of these fit me?',
    answer:
      'Then the Investor Pass is probably not your route, and the standard temporary-to-permanent path is — see the comparison page, or take the Route Finder.',
  },
];

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Investment routes"
      title="Four routes. One outcome: permanent residency."
      intro="Each route suits a different kind of capital. We tell you which one fits your case on the first call — here is what each actually covers."
      faq={FAQ}
      serviceName="Investor Pass — Investment Routes"
      serviceDescription="The four qualifying investment routes for the Paraguay Investor Pass: real estate, productive business, financial instruments and tourism."
      path={PATH}
    >
      <h2 id="real_estate">Real estate</h2>
      <p>
        A qualifying real-estate purchase — <Fact k="investorpass.route_real_estate_usd" site="investorpass" />.
        Title and purchase price make this the most straightforward route to document: the
        investment is the property itself, held in your name or a structure we set up for you.
        This route suits people who also want a place to stay when they visit, or who see
        Paraguayan property as a reasonable place to park capital regardless of the residency.
      </p>

      <h2 id="productive_business">Productive business</h2>
      <p>
        A qualifying investment in an operating business — <Fact k="investorpass.route_business_usd" site="investorpass" />.
        &ldquo;Productive&rdquo; matters here: the business needs to be a real, operating concern,
        not a shell holding cash. This suits investors who already run something similar
        elsewhere, or who want to start a Paraguayan operation rather than hold a passive asset.
      </p>

      <h2 id="financial_instruments">Financial instruments</h2>
      <p>
        A qualifying investment in financial instruments recognised under the programme —{' '}
        <Fact k="investorpass.route_financial_usd" site="investorpass" />. This route suits
        investors who want the qualifying capital to stay liquid and managed rather than tied to
        property or an operating business. Which instruments actually qualify is one of the
        details we confirm against the current rules before you commit anything.
      </p>

      <h2 id="tourism">Tourism</h2>
      <p>
        A qualifying investment in a tourism-sector project — <Fact k="investorpass.route_tourism_usd" site="investorpass" />.
        This is the least publicly documented of the four routes; qualification criteria for what
        counts as a tourism project are exactly the kind of detail we confirm on your call rather
        than guess at from a web page.
      </p>

      <h2>Choosing between them</h2>
      <p>
        The right route is a function of your capital, how liquid you want it to stay, and whether
        you want a tangible asset attached to the residency or not. Tell us your rough numbers and
        goal through the form below, or{' '}
        <a href="/route-finder">take the Route Finder</a> if you are still deciding whether the
        Investor Pass is the right program at all.
      </p>
    </ServicePage>
  );
}
