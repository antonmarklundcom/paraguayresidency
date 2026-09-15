import type { ReactNode } from 'react';
import { Breadcrumbs, Container, FAQ, Heading, JsonLd, LeadForm, Prose, Section, type FaqItem } from '@/components';
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
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residency" items={[{ label: crumbLabel, href: path }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{title}</Heading>
          <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
            {intro}
          </p>
        </header>
        <Prose className="mt-[var(--space-12)]">{children}</Prose>
        <div className="mt-[var(--space-16)]">
          <FAQ title="Frequently asked" items={faq} />
        </div>
        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Talk to us about your case</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Tell us your nationality and timeline. We tell you the route, the documents and the
            fee before you commit to anything.
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              rel="noopener"
              className="mt-[var(--space-4)] inline-flex items-center gap-2 text-[var(--text-sm)] text-[var(--accent)] underline underline-offset-2"
            >
              Or message us on WhatsApp
            </a>
          )}
          <div className="mt-[var(--space-8)]">
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
      </Container>
    </Section>
  );
}
