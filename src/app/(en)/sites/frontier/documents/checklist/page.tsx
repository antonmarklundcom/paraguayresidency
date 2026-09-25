import type { Metadata } from 'next';
import { Breadcrumbs, Container, DocumentChecklist, Heading, Section } from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import type { ChecklistNationality, ChecklistRoute } from '@/components/DocumentChecklist';

const SITE = 'frontier' as const;
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
  const photo = t(SITE, 'checklist.doc.photoId');
  return [
    { id: 'temporary', label: t(SITE, 'checklist.route.temporary'), docs: [civil, police, apostille, translation, means] },
    { id: 'permanent', label: t(SITE, 'checklist.route.permanent'), docs: [civil, police, apostille, translation, means] },
    { id: 'cedula', label: t(SITE, 'checklist.route.cedula'), docs: [photo] },
  ];
}

const NATIONALITIES: ChecklistNationality[] = [
  { id: 'us', label: 'United States', href: '/stories/us-document-chain-before-paraguay' },
  { id: 'ca', label: 'Canada', href: '/stories/canadian-document-chain-for-paraguay' },
  { id: 'other', label: 'Other nationality' },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
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
            policeCertHref="/stories/interpol-and-the-police-certificate-myth"
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
