import type { Metadata } from 'next';
import {
  AfterYouMessage,
  Breadcrumbs,
  Container,
  Guarantee,
  Heading,
  OfficeStrip,
  Section,
  TrustBar,
  WhatsAppButton,
} from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { contactMetadata } from '@/lib/conversion-pages';
import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';

const SITE = 'flytta' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

/** Contact: WhatsApp first, the form second, then what happens after you write. */
export default function Page() {
  const message = t(SITE, 'whatsapp.prefill');
  const whatsapp = whatsappHref(message);
  return (
    <>
      <Section>
        <Container width="narrow">
          <Breadcrumbs site={SITE} items={[{ label: t(SITE, 'contact.h1'), href: '/contact' }]} />
          <Heading level={1} className="mt-[var(--space-8)]">{t(SITE, 'contact.h1')}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">{t(SITE, 'contact.sub')}</p>
          <div className="mt-[var(--space-8)] flex flex-wrap items-center gap-x-4 gap-y-3">
            <WhatsAppButton site={SITE} message={message} placement="contact" />
            <span className="text-(length:--text-sm) text-[var(--fg-muted)]">{t(SITE, 'contact.orForm')}</span>
          </div>
          <div className="mt-[var(--space-8)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
            <Heading level={2} className="!text-(length:--text-xl)">{t(SITE, 'process.fullForm')}</Heading>
            <div className="mt-[var(--space-4)]">
              <LeadForm site={SITE} variant="contact" pagePath="/contact" />
            </div>
            <details className="mt-[var(--space-8)] border-t border-[var(--border)] pt-[var(--space-4)]">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t(SITE, 'form.whatsappAlternative')}</summary>
              {whatsapp && (
                <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">
                  {t(SITE, 'form.whatsapp')}
                </a>
              )}
              <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t(SITE, 'process.whatsappIntro')}</p>
              <LeadForm site={SITE} variant="whatsapp" pagePath="/contact" />
            </details>
          </div>
        </Container>
      </Section>
      <TrustBar site={SITE} />
      <AfterYouMessage site={SITE} tone="alt" />
      <OfficeStrip site={SITE} />
      <Guarantee site={SITE} />
    </>
  );
}
