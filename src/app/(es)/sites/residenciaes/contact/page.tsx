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
      <Container width="narrow">
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
        <div className="mt-[var(--space-10)]">
          <LeadForm site={SITE} variant="contact" pagePath="/contact" />
        </div>
      </Container>
    </Section>
  );
}
