import { whatsappHref } from '@/lib/whatsapp';
import { t } from '@/i18n';
import { Container, Heading, LeadForm, Section } from '@/components';
import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  const whatsapp = whatsappHref('Hola, me gustaría saber más sobre la residencia en Paraguay.');
  return (
    <Section>
      <Container>
        <Heading level={1}>{t(SITE, 'contact.h1')}</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">{t(SITE, 'contact.sub')}</p>
        {whatsapp && (
        <a
          href={whatsapp}
          rel="noopener"
          className="mt-[var(--space-4)] inline-flex items-center gap-2 text-[var(--text-sm)] text-[var(--accent)] underline underline-offset-2"
        >
          {t('residenciaes', 'form.whatsapp')}
        </a>
      )}
        <div className="mt-[var(--space-10)] grid gap-[var(--space-8)] text-left lg:grid-cols-2">
            <div>
              <Heading level={2}>{t('residenciaes', 'process.fullForm')}</Heading>
              <div className="mt-[var(--space-4)]"><LeadForm site="residenciaes" variant="contact" pagePath="/contact" /></div>
            </div>
            <div>
              <Heading level={2}>{t('residenciaes', 'form.whatsapp')}</Heading>
              <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t('residenciaes', 'process.whatsappIntro')}</p>
              <LeadForm site="residenciaes" variant="whatsapp" pagePath="/contact" />
            </div>
          </div>
      </Container>
    </Section>
  );
}
