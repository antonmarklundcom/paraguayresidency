import type { Metadata } from 'next';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '../../_lib/ServicePage';

const PATH = '/investor-pass/for-agents';

export function generateMetadata(): Metadata {
  return siteMetadata('investorpass', {
    title: 'Paraguay Investor Pass for Migration Agents & Advisors',
    description:
      'Refer investor clients to the Paraguay Investor Pass team in Asunción. How referrals work, what your clients get, and how to reach us.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'How does a referral work?',
    answer:
      'Send us your client’s rough capital and goal through the form below, or introduce them directly. We tell you and them, honestly, whether the Investor Pass fits or whether standard residency is the better recommendation.',
  },
  {
    question: 'Do you white-label the filing or work under our brand?',
    answer:
      'We file under our own name in Asunción — your client knows who is doing the work. What we can do is keep you informed at whatever level of detail your relationship with the client calls for.',
  },
  {
    question: 'Is there a referral fee?',
    answer:
      'This is worked out per relationship rather than published as a flat rate — tell us your usual arrangement on the call and we will tell you plainly whether it works for us.',
  },
  {
    question: 'What do you need from us to start?',
    answer:
      'Your client’s rough capital range, their nationality, and their timeline. We take it from there and keep you looped in.',
  },
];

export default function Page() {
  return (
    <ServicePage
      crumbLabel="For agents"
      title="Referring investor clients to Paraguay"
      intro="If you advise investors on second residencies or citizenship-by-investment programs, the Investor Pass is a straightforward addition — filed by a team that does this every week in Asunción, not a subcontracted intermediary."
      faq={FAQ}
      serviceName="Investor Pass — Referral Program for Agents"
      serviceDescription="Referral arrangement for migration agents and advisors sending investor clients to the Paraguay Investor Pass."
      path={PATH}
      formVariant="contact"
      formTitle="Introduce a client, or ask about the arrangement"
      formBody="Tell us your firm, your usual referral structure, and — if you already have a client in mind — their rough capital and timeline. A person on our team replies directly."
    >
      <h2>Why agents refer here</h2>
      <p>
        Paraguay is a newer name on most investor-residency comparison lists, which means clients
        researching it online run into inconsistent numbers and thin detail. We give your client a
        straight, current answer — including telling them when the Investor Pass is not their best
        option — rather than a sales pitch that reflects badly on your recommendation later.
      </p>

      <h2>What your client experiences</h2>
      <p>
        The same process every direct client gets: a call to confirm the route and quote the
        current threshold, structuring of the investment, filing, and the cédula once residency is
        approved. Nothing is filed until they have seen the full cost, timeline and exit options in
        writing — which protects your recommendation as much as it protects them.
      </p>

      <h2>Staying in the loop</h2>
      <p>
        We agree upfront how much visibility you want into your client&apos;s case — anything from
        a closing summary to regular updates as it progresses. Tell us what your relationship with
        the client calls for.
      </p>
    </ServicePage>
  );
}
