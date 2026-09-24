import { t } from '@/i18n';
import type { ReactNode } from 'react';
import { Button, StickyCta, Breadcrumbs, Container, FAQ, Heading, JsonLd, LeadForm, Prose, Section, type FaqItem } from '@/components';
import { serviceJsonLd } from '@/lib/metadata';
import type { LeadVariant } from '@/components/LeadForm';

/**
 * Shared skeleton for the `/residencia/*`, `/residencia-fiscal` and
 * `/familia` service pages (plan §6.6) — breadcrumbs, intro, body, Service
 * JSON-LD, FAQ, a consultation form. Not shared with the hub's English
 * `ServicePage` (plan §4 restraint baseline / build log for S3–S4): the copy
 * here is Spanish and the shape only needs to match this brand.
 */
export function ServicePage({
  crumbLabel,
  title,
  intro,
  children,
  faq,
  serviceName,
  serviceDescription,
  path,
  formVariant = 'consultation',
}: {
  crumbLabel: string;
  title: string;
  intro: string;
  children: ReactNode;
  faq: FaqItem[];
  serviceName: string;
  serviceDescription: string;
  path: string;
  formVariant?: LeadVariant;
}) {
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: crumbLabel, href: path }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{title}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            {intro}
          </p>
        </header>
        <div className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]" data-service-cta><Button href="#inquiry">Habla con nosotros</Button><Button href="/route-finder" variant="secondary">Descubre tu ruta</Button></div>
        <Prose className="mt-[var(--space-12)]">{children}</Prose>
        <div className="mt-[var(--space-16)]">
          <FAQ title="Preguntas frecuentes" items={faq} />
        </div>
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Cuéntanos tu caso</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Dinos tu nacionalidad y tu plazo. Te decimos la ruta, los documentos y el honorario
            antes de que te comprometas a nada.
          </p>
          <div className="mt-[var(--space-8)]">
            <p className="mb-[var(--space-4)] text-(length:--text-sm) text-[var(--fg-muted)]">{t('residenciaes', 'process.trustBody')}</p>
            <LeadForm site="residenciaes" variant={formVariant} pagePath={path} />
          </div>
        </div>
        <JsonLd
          data={serviceJsonLd('residenciaes', {
            name: serviceName,
            description: serviceDescription,
            path,
          })}
        />
      <StickyCta formId="inquiry" label="Escríbenos" />
      </Container>
    </Section>
  );
}
