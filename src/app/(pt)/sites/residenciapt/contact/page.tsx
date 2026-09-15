import { Container, Heading, LeadForm, Section } from '@/components';
import { t } from '@/i18n';
import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';

const SITE = 'residenciapt' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return <Section><Container>
        <Heading level={1}>{t(SITE, 'contact.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(SITE, 'contact.sub')}</p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-8)] text-left lg:grid-cols-2">
            <div>
              <Heading level={2}>{t('residenciapt', 'process.fullForm')}</Heading>
              <div className="mt-[var(--space-4)]"><LeadForm site="residenciapt" variant="contact" pagePath="/contact" /></div>
            </div>
            <div>
              <Heading level={2}>{t('residenciapt', 'form.whatsapp')}</Heading>
              <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t('residenciapt', 'process.whatsappIntro')}</p>
              <LeadForm site="residenciapt" variant="whatsapp" pagePath="/contact" />
            </div>
          </div>
      </Container></Section>;
}
