import type { ReactNode } from 'react';
import { Button, StickyCta, Breadcrumbs, Container, FAQ, Heading, JsonLd, LeadForm, Prose, Section, type FaqItem } from '@/components';
import { serviceJsonLd } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import { t } from '@/i18n';
import type { LeadVariant } from '@/components/LeadForm';

const SITE = 'flytta' as const;

/**
 * Shared skeleton for flytta's four topic pages — `/uppehallstillstand`,
 * `/skatt`, `/kostnader`, `/familj` (plan §6.8): breadcrumbs, intro, body,
 * Service JSON-LD, FAQ, a consultation form. Mirrors `residency`'s
 * `_lib/ServicePage.tsx` (plan §4 restraint baseline) but owned here since
 * S13 owns `src/app/sites/flytta/` only.
 */
export function TopicPage({
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
  const whatsapp = whatsappHref(`Hej! Jag har en fråga om ${serviceName.toLowerCase()}.`);
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site={SITE} items={[{ label: crumbLabel, href: path }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{title}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            {intro}
          </p>
        </header>
        <div className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]" data-service-cta><Button href="#inquiry">Hör av dig</Button><Button href="/route-finder" variant="secondary">Hitta din väg</Button></div>
        <Prose className="mt-[var(--space-12)]">{children}</Prose>
        <div className="mt-[var(--space-16)]">
          <FAQ title={t(SITE, 'common.faqTitle')} items={faq} />
        </div>
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Berätta hur du tänker</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Skriv var du bor och vad du undrar. Vi säger vilken väg som passar och vad den kostar
            innan du bestämmer dig för något.
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              rel="noopener"
              className="mt-[var(--space-4)] inline-flex items-center gap-2 text-(length:--text-sm) text-[var(--accent)] underline underline-offset-2"
            >
              Eller skriv på WhatsApp
            </a>
          )}
          <div className="mt-[var(--space-8)]">
            <p className="mb-[var(--space-4)] text-(length:--text-sm) text-[var(--fg-muted)]">{t('flytta', 'process.trustBody')}</p>
            <LeadForm site={SITE} variant={formVariant} pagePath={path} />
          </div>
        </div>
        <JsonLd
          data={serviceJsonLd(SITE, {
            name: serviceName,
            description: serviceDescription,
            path,
          })}
        />
      <StickyCta formId="inquiry" label="Hör av dig" />
      </Container>
    </Section>
  );
}
