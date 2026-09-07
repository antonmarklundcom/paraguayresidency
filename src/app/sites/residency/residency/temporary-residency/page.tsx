import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residency/_lib/ServicePage';

const PATH = '/residency/temporary-residency';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Temporary Residency in Paraguay — Requirements & Process',
    description:
      'How Paraguay temporary residency works: who qualifies, the document set, the appointments, and what it costs. Filed for you in Asunción.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Temporary residency"
      title="Temporary residency, the standard first step"
      intro="Almost every applicant starts here. Temporary residency is the route the immigration office expects, and it is the fastest way to get a foothold — a card, a cédula application, and a legal reason to be in the country while you decide how much further you want to go."
      faq={[
        {
          question: 'How long does temporary residency last?',
          answer:
            'It runs for a fixed initial term before you apply for permanent residency — we confirm the current term and what happens if you let it lapse on your call.',
        },
        {
          question: 'Do I need to live in Paraguay full-time to keep it?',
          answer:
            'No. Temporary residency does not carry the same minimum-presence expectations as the permanent card. We explain the practical difference for your travel pattern before you file.',
        },
        {
          question: 'What if my documents are already out of date by the time we file?',
          answer:
            'This is the single most common delay. We sequence your document collection so nothing expires before its appointment — see our guide on what you need before you apply.',
        },
      ]}
      serviceName="Paraguay Temporary Residency Filing"
      serviceDescription="Done-for-you filing of Paraguay temporary residency: document checklist, appointment scheduling and submission."
      path={PATH}
    >
      <h2>Who this route is for</h2>
      <p>
        Temporary residency suits almost anyone who wants a legal foothold in Paraguay without
        committing to the deeper presence and process requirements of the permanent card up front.
        Digital workers, retirees testing the country before relocating fully, and people building
        toward permanent residency all use this as the entry point.
      </p>
      <h2>What the process actually involves</h2>
      <p>
        You bring a core set of legalised documents — birth certificate, police clearance and
        proof of means, each apostilled and translated for Paraguay&apos;s immigration office. We
        build that checklist against your specific nationality rather than handing you a generic
        PDF, because the rules that matter (which clearance offices are accepted, how a document
        is legalised) differ by country. From there it is a filing, a set of appointments in
        Asunción, and a wait for approval — after which the cédula application follows.
      </p>
      <h2>Timeline and what comes after</h2>
      <p>
        Temporary residency runs for <Fact k="temporary.duration" site="residency" />. Most clients
        use that window to decide whether to apply for{' '}
        <a href="/residency/permanent-residency">permanent residency</a>, and some, after seeing
        the country, look at the{' '}
        <a href="/investor-pass">Investor Pass</a> instead if a qualifying investment makes more
        sense for them. If you are not sure which route fits, the{' '}
        <a href="/route-finder">Route Finder</a> takes two minutes and tells you.
      </p>
      <h2>What is included</h2>
      <ul>
        <li>A document checklist built for your nationality, not a generic list.</li>
        <li>Appointment scheduling, coordinated so one trip covers the filing.</li>
        <li>A fixed fee, quoted before you commit — see our <a href="/pricing">pricing</a>.</li>
      </ul>
    </ServicePage>
  );
}
