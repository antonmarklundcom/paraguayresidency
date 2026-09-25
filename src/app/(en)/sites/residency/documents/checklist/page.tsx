import type { Metadata } from 'next';
import { Breadcrumbs, Container, DocumentChecklist, Heading, JsonLd, Section } from '@/components';
import { t } from '@/i18n';
import { serviceJsonLd, siteMetadata } from '@/lib/metadata';
import type { ChecklistNationality, ChecklistRoute } from '@/components/DocumentChecklist';

const SITE = 'residency' as const;
const PATH = '/documents/checklist';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'checklist.metaTitle'),
    description: t(SITE, 'checklist.metaDescription'),
    path: PATH,
  });
}

function routes(): ChecklistRoute[] {
  const civil = t(SITE, 'checklist.doc.civilRecord');
  const police = t(SITE, 'checklist.doc.policeCertificate');
  const apostille = t(SITE, 'checklist.doc.apostille');
  const translation = t(SITE, 'checklist.doc.translation');
  const means = t(SITE, 'checklist.doc.proofOfMeans');
  const investment = t(SITE, 'checklist.doc.investmentEvidence');
  const photo = t(SITE, 'checklist.doc.photoId');
  return [
    { id: 'temporary', label: t(SITE, 'checklist.route.temporary'), docs: [civil, police, apostille, translation, means] },
    { id: 'permanent', label: t(SITE, 'checklist.route.permanent'), docs: [civil, police, apostille, translation, means] },
    { id: 'cedula', label: t(SITE, 'checklist.route.cedula'), docs: [photo] },
    { id: 'investor', label: t(SITE, 'checklist.route.investor'), docs: [civil, police, apostille, translation, investment] },
  ];
}

const NATIONALITIES: ChecklistNationality[] = [
  { id: 'us', label: 'United States', href: '/guides/documents/apostille-and-documents-for-american-applicants' },
  { id: 'uk', label: 'United Kingdom', href: '/guides/documents/apostille-and-documents-for-british-applicants' },
  { id: 'ca', label: 'Canada', href: '/guides/documents/apostille-and-documents-for-canadian-applicants' },
  { id: 'au', label: 'Australia', href: '/guides/documents/apostille-and-documents-for-australian-applicants' },
  { id: 'de', label: 'Germany', href: '/guides/documents/apostille-and-documents-for-german-applicants' },
  { id: 'za', label: 'South Africa', href: '/guides/documents/apostille-and-documents-for-south-african-applicants' },
  { id: 'other', label: 'Other nationality' },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <JsonLd
          data={serviceJsonLd(SITE, {
            name: 'Paraguay Residency Document Checklist',
            description: t(SITE, 'checklist.metaDescription'),
            path: PATH,
          })}
        />
        <Breadcrumbs site={SITE} items={[{ label: t(SITE, 'checklist.h1'), href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-4)]">
          {t(SITE, 'checklist.h1')}
        </Heading>
        <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-[var(--fg-muted)]">
          {t(SITE, 'checklist.sub')}
        </p>
        <div className="mt-[var(--space-10)]">
          <DocumentChecklist
            site={SITE}
            pagePath={PATH}
            routes={routes()}
            nationalities={NATIONALITIES}
            policeCertHref="/guides/documents/police-certificate-and-interpol-checks"
            copy={{
              routeLabel: t(SITE, 'checklist.routeLabel'),
              nationalityLabel: t(SITE, 'checklist.nationalityLabel'),
              checklistHeading: t(SITE, 'checklist.checklistHeading'),
              note: t(SITE, 'checklist.note'),
              policeCertCta: t(SITE, 'checklist.policeCertCta'),
              nationalityArticleCta: t(SITE, 'checklist.nationalityArticleCta'),
              formTitle: t(SITE, 'checklist.formTitle'),
              formBody: t(SITE, 'checklist.formBody'),
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
