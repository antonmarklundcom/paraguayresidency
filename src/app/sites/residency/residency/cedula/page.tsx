import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residency/_lib/ServicePage';

const PATH = '/residency/cedula';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Cédula de Identidad — Process for Foreigners',
    description:
      'The cédula is your everyday ID once residency is approved — banking, contracts, daily life. How the process works and what we handle for you.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Cédula"
      title="The cédula: your everyday ID once residency lands"
      intro="Residency is the legal status. The cédula de identidad is the card you actually use — at the bank, signing a lease, opening a business. It follows residency approval, and the timing catches people off guard if nobody tells them what to expect."
      faq={[
        {
          question: 'Can I get a cédula before residency is approved?',
          answer:
            'No — the cédula follows residency approval, it is not a parallel process. We build your expectations around the real sequence rather than a hopeful one.',
        },
        {
          question: 'What can I do with a cédula that I could not do before?',
          answer:
            'Open a bank account without friction, sign leases and contracts as a resident rather than a visitor, and generally move through daily administrative life the way a Paraguayan does.',
        },
        {
          question: 'Does the cédula need renewing?',
          answer:
            'Yes, on its own cycle. We flag renewal timing for you rather than leaving you to track it against a card in a drawer.',
        },
      ]}
      serviceName="Paraguay Cédula de Identidad Processing"
      serviceDescription="Cédula de identidad application for foreign residents, coordinated to follow residency approval without a gap."
      path={PATH}
    >
      <h2>Where the cédula fits</h2>
      <p>
        A lot of the friction foreigners describe about &ldquo;living in Paraguay&rdquo; — a bank
        that will not open an account, a landlord who wants an ID they recognise — is really a
        cédula problem, not a residency problem. The residency card proves your legal status; the
        cédula is what a bank teller or a landlord actually asks for day to day.
      </p>
      <h2>Timeline</h2>
      <p>
        The cédula is <Fact k="cedula.timeline" site="residency" />. We give you a realistic
        window rather than a best case, because the gap between &ldquo;residency approved&rdquo;
        and &ldquo;cédula in hand&rdquo; is exactly when people feel stuck — able to stay, not yet
        able to do much of the paperwork that requires local ID.
      </p>
      <h2>What we coordinate</h2>
      <ul>
        <li>Filing timed to follow your residency approval without a needless gap.</li>
        <li>The photo, biometric and appointment logistics in Asunción.</li>
        <li>A heads-up on renewal timing well before the card expires.</li>
      </ul>
      <p>
        If you have not filed for residency yet, start with{' '}
        <a href="/residency/temporary-residency">temporary residency</a> or take the{' '}
        <a href="/route-finder">Route Finder</a> to see which route fits your case first.
      </p>
    </ServicePage>
  );
}
