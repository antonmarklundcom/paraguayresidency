import { t } from '@/i18n';
import type { ReactNode } from 'react';
import { Button, StickyCta, Breadcrumbs, Container, FAQ, Heading, JsonLd, LeadForm, Prose, Section, type FaqItem } from '@/components';
import { serviceJsonLd } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import type { LeadVariant } from '@/components/LeadForm';

/**
 * Portuguese equivalent of the hub's `ServicePage` (plan §6.7): breadcrumbs,
 * intro, body, Service JSON-LD, FAQ, a lead form. residenciapt-only, not
 * exported from `src/lib` — the hub's English copy is not reusable here.
 */
export function ServicoPage({
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
  const whatsapp = whatsappHref(`Olá — tenho uma dúvida sobre ${serviceName.toLowerCase()}.`);
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: crumbLabel, href: path }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{title}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            {intro}
          </p>
        </header>
        <div className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]" data-service-cta><Button href="#inquiry">Escreva para nós</Button><Button href="/route-finder" variant="secondary">Descubra sua rota</Button></div>
        <Prose className="mt-[var(--space-12)]">{children}</Prose>
        <div className="mt-[var(--space-16)]">
          <FAQ title="Perguntas frequentes" items={faq} />
        </div>
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Conte o seu caso</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Diga sua nacionalidade e seu prazo. A gente diz a rota, os documentos e o honorário
            antes de você se comprometer com qualquer coisa.
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              rel="noopener"
              className="mt-[var(--space-4)] inline-flex items-center gap-2 text-(length:--text-sm) text-[var(--accent)] underline underline-offset-2"
            >
              Ou mande uma mensagem no WhatsApp
            </a>
          )}
          <div className="mt-[var(--space-8)]">
            <p className="mb-[var(--space-4)] text-(length:--text-sm) text-[var(--fg-muted)]">{t('residenciapt', 'process.trustBody')}</p>
            <LeadForm site="residenciapt" variant={formVariant} pagePath={path} />
          </div>
        </div>
        <JsonLd
          data={serviceJsonLd('residenciapt', {
            name: serviceName,
            description: serviceDescription,
            path,
          })}
        />
      <StickyCta formId="inquiry" label="Escreva para nós" />
      </Container>
    </Section>
  );
}
