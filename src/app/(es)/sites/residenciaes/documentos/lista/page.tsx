import type { Metadata } from 'next';
import { Breadcrumbs, Container, DocumentChecklist, Heading, JsonLd, Section } from '@/components';
import { t } from '@/i18n';
import { serviceJsonLd, siteMetadata } from '@/lib/metadata';
import type { ChecklistNationality, ChecklistRoute } from '@/components/DocumentChecklist';

const SITE = 'residenciaes' as const;
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
    { id: 'temporal', label: t(SITE, 'checklist.route.temporary'), docs: [civil, police, apostille, translation, means] },
    { id: 'permanente', label: t(SITE, 'checklist.route.permanent'), docs: [civil, police, apostille, translation, means] },
    { id: 'cedula', label: t(SITE, 'checklist.route.cedula'), docs: [photo] },
  ];
}

const NATIONALITIES: ChecklistNationality[] = [
  { id: 'es', label: 'España', href: '/guias/documentos/documentos-y-apostillas-para-espanoles' },
  { id: 'ar', label: 'Argentina', href: '/guias/documentos/documentos-y-apostillas-para-argentinos' },
  { id: 'co', label: 'Colombia', href: '/guias/documentos/documentos-y-apostillas-para-colombianos' },
  { id: 'mx', label: 'México', href: '/guias/documentos/documentos-y-apostillas-para-mexicanos' },
  { id: 'other', label: 'Otra nacionalidad' },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <JsonLd
          data={serviceJsonLd(SITE, {
            name: 'Lista de documentos para residencia en Paraguay',
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
            policeCertHref="/guias/documentos/certificado-de-antecedentes-y-la-confusion-con-interpol"
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
