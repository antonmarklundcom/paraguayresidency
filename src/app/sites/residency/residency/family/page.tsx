import type { Metadata } from 'next';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residency/_lib/ServicePage';

const PATH = '/residency/family';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Residency for Spouses, Children & Dependents',
    description:
      'Bringing a spouse, children or dependents onto your Paraguay residency application: what runs in parallel, what needs its own documents.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Family"
      title="Bringing your family with you"
      intro="A spouse, children and some dependents can be included on a Paraguay residency application. Each person still needs their own document set — a family filing is not one application stretched to cover everyone, and we plan it that way from the start."
      faq={[
        {
          question: 'Do my children need their own document set?',
          answer:
            'Yes — birth certificates, and depending on age, their own police clearances, each apostilled and translated the same way yours is. We build one coordinated checklist so nothing about a child’s file is treated as an afterthought.',
        },
        {
          question: 'Can we all attend the same appointments?',
          answer:
            'Where the immigration office allows it, we schedule your family together so one trip to Asunción covers everyone rather than several.',
        },
        {
          question: 'What counts as a dependent beyond spouse and children?',
          answer:
            'It varies by case — a parent or another relative can sometimes qualify. Tell us who you want to bring and we tell you honestly whether their case fits, and what it needs if so.',
        },
      ]}
      serviceName="Paraguay Family Residency Filing"
      serviceDescription="Coordinated Paraguay residency filing for spouses, children and dependents alongside the primary applicant."
      path={PATH}
    >
      <h2>Same route, more documents</h2>
      <p>
        Whether your family files under{' '}
        <a href="/residency/temporary-residency">temporary residency</a> or the{' '}
        <a href="/investor-pass">Investor Pass</a>, the route itself does not change because
        family is involved. What changes is the document load: each additional person brings their
        own birth certificate, clearance and, where relevant, marriage certificate, each legalised
        the same way the primary applicant&apos;s are.
      </p>
      <h2>What we coordinate for a family filing</h2>
      <ul>
        <li>One checklist covering every family member, sequenced so nothing expires out of order.</li>
        <li>Appointments scheduled together wherever the immigration office permits it.</li>
        <li>Clear answers on which relatives qualify as dependents for your specific case.</li>
      </ul>
      <p>
        Different family members sometimes end up better served by different routes — a spouse
        filing under yours, an adult child filing independently. If you are not sure how your
        household fits together, start with the{' '}
        <a href="/route-finder">Route Finder</a> or <a href="/contact">tell us your situation</a>{' '}
        directly.
      </p>
    </ServicePage>
  );
}
