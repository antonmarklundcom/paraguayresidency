import type { ReactNode } from 'react';
import { Button, StickyCta, Breadcrumbs, Container, FAQ, Heading, JsonLd, LeadForm, Prose, Section, type FaqItem } from '@/components';
import { serviceJsonLd, serviceOfferJsonLd } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import type { LeadVariant } from '@/components/LeadForm';

/**
 * Dark-editorial equivalent of the hub's `_lib/ServicePage.tsx` (plan §6.2 —
 * NOT shared: Investor Pass pages have a different shape, no cédula/family
 * equivalents, and the inquiry form defaults to `investor_inquiry`).
 * Theming itself is CSS-variable driven (`[data-theme='investorpass']`), so
 * this only needs to hardcode `site="investorpass"` and the copy tone.
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
  formVariant = 'investor_inquiry',
  formTitle = 'Tell us what you are working with',
  formBody = 'Capital, timeline, and what you want the residency to do for you. Nothing is filed until you have seen the full cost, timeline and exit options in writing.',
  withOffer = false,
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
  formTitle?: string;
  formBody?: string;
  /** Product/Service + Offer JSON-LD (plan §6.2 exit) — set on `/` only. */
  withOffer?: boolean;
}) {
  const whatsapp = whatsappHref(`Hi — I have a question about ${serviceName.toLowerCase()}.`);
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site="investorpass" items={[{ label: crumbLabel, href: path }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{title}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            {intro}
          </p>
        </header>
        <div className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]" data-service-cta><Button href="#inquiry">See if you qualify</Button><Button href="/route-finder" variant="secondary">Find your route</Button></div>
        <Prose className="mt-[var(--space-12)]">{children}</Prose>
        {faq.length > 0 && (
          <div className="mt-[var(--space-16)]">
            <FAQ title="Frequently asked" items={faq} />
          </div>
        )}
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-8)]">
          <Heading level={2}>{formTitle}</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{formBody}</p>
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
            <LeadForm site="investorpass" variant={formVariant} pagePath={path} />
          </div>
        </div>
        <JsonLd
          data={
            withOffer
              ? serviceOfferJsonLd('investorpass', {
                  name: serviceName,
                  description: serviceDescription,
                  path,
                })
              : serviceJsonLd('investorpass', {
                  name: serviceName,
                  description: serviceDescription,
                  path,
                })
          }
        />
      <StickyCta formId="inquiry" label="See if you qualify" />
      </Container>
    </Section>
  );
}
