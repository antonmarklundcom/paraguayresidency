import type { Metadata } from 'next';
import { Breadcrumbs, Container, DocumentChecklist, Heading, Section } from '@/components';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';
import type { ChecklistNationality, ChecklistRoute } from '@/components/DocumentChecklist';

const SITE = 'residenciapt' as const;
const PATH = '/documentos/lista';

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
    { id: 'temporaria', label: t(SITE, 'checklist.route.temporary'), docs: [civil, police, apostille, translation, means] },
    { id: 'permanente', label: t(SITE, 'checklist.route.permanent'), docs: [civil, police, apostille, translation, means] },
    { id: 'cedula', label: t(SITE, 'checklist.route.cedula'), docs: [photo] },
  ];
}

const NATIONALITIES: ChecklistNationality[] = [
  { id: 'br', label: 'Brasil', href: '/guias/documentos/apostilamento-e-traducao-de-documentos-brasileiros' },
  { id: 'other', label: 'Outra nacionalidade' },
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
            policeCertHref="/guias/documentos/certidao-de-antecedentes-e-a-confusao-com-a-interpol"
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
