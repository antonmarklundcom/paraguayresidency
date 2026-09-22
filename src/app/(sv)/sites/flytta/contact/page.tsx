import { whatsappHref } from '@/lib/whatsapp';
import { Container, Heading, LeadForm, Section } from '@/components';
import { t } from '@/i18n';
import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';

const SITE = 'flytta' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  const whatsapp = whatsappHref('');
  return <Section><Container>
        <Heading level={1}>{t(SITE, 'contact.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(SITE, 'contact.sub')}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-8)] text-left">
            <div>
              <Heading level={2}>{t('flytta', 'process.fullForm')}</Heading>
              <div className="mt-[var(--space-4)]"><LeadForm site="flytta" variant="contact" pagePath="/contact" /></div>
            </div>
            <details>
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t('flytta', 'form.whatsappAlternative')}</summary>
              {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">{t('flytta', 'form.whatsapp')}</a>}
              <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t('flytta', 'process.whatsappIntro')}</p>
              <LeadForm site="flytta" variant="whatsapp" pagePath="/contact" />
            </details>
          </div>
      </Container></Section>;
}
