import { whatsappHref } from '@/lib/whatsapp';
import { t } from '@/i18n';
import { Container, Heading, LeadForm, Section, WhatsAppButton } from '@/components';
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
        <div className="mt-[var(--space-6)]">
          <WhatsAppButton site={SITE} message="Hola, me gustaría saber más sobre la residencia en Paraguay." />
        </div>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-8)] text-left">
            <div>
              <Heading level={2}>{t('residenciaes', 'process.fullForm')}</Heading>
              <div className="mt-[var(--space-4)]"><LeadForm site="residenciaes" variant="contact" pagePath="/contact" /></div>
            </div>
            <details>
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t('residenciaes', 'form.whatsappAlternative')}</summary>
              {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">{t('residenciaes', 'form.whatsapp')}</a>}
              <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t('residenciaes', 'process.whatsappIntro')}</p>
              <LeadForm site="residenciaes" variant="whatsapp" pagePath="/contact" />
            </details>
          </div>
      </Container>
    </Section>
  );
}
