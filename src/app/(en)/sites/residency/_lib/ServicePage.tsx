import { t } from '@/i18n';
import type { ReactNode } from 'react';
import { Button, StickyCta, Breadcrumbs, Container, FAQ, Heading, JsonLd, LeadForm, Prose, Section, type FaqItem } from '@/components';
import { serviceJsonLd } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import type { LeadVariant } from '@/components/LeadForm';

/**
 * Shared skeleton for the hub's five `/residency/<slug>` service pages
 * (plan §6.1): breadcrumbs, intro, body, Service JSON-LD, FAQ, a consultation
 * form. Keeps every service page consistent without five copies of the same
 * wiring — the copy itself is unique per page.
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
  const whatsapp = whatsappHref(`Hi — I have a question about ${serviceName.toLowerCase()}.`);
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site="residency" items={[{ label: crumbLabel, href: path }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{title}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            {intro}
          </p>
        </header>
        <div className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]" data-service-cta><Button href="#inquiry">Talk to us</Button><Button href="/route-finder" variant="secondary">Find your route</Button></div>
        <Prose className="mt-[var(--space-12)]">{children}</Prose>
        <div className="mt-[var(--space-16)]">
          <FAQ title="Frequently asked" items={faq} />
        </div>
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Talk to us about your case</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Tell us your nationality and timeline. We tell you the route, the documents and the
            fee before you commit to anything.
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              rel="noopener"
              className="mt-[var(--space-4)] inline-flex items-center gap-2 text-(length:--text-sm) text-[var(--accent)] underline underline-offset-2"
            >
              Or message us on WhatsApp
            </a>
          )}
          <div className="mt-[var(--space-8)]">
            <p className="mb-[var(--space-4)] text-(length:--text-sm) text-[var(--fg-muted)]">{t('residency', 'process.trustBody')}</p>
            <LeadForm site="residency" variant={formVariant} pagePath={path} />
          </div>
        </div>
        <JsonLd
          data={serviceJsonLd('residency', {
            name: serviceName,
            description: serviceDescription,
            path,
          })}
        />
      <StickyCta formId="inquiry" label="Talk to us" />
      </Container>
    </Section>
  );
}
