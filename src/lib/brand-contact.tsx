import {
  AfterYouMessage,
  Band,
  Breadcrumbs,
  Eyebrow,
  Guarantee,
  Heading,
  OfficeStrip,
  TrustBar,
  WhatsAppButton,
} from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';

/**
 * The contact page of the language brands (W5-C): WhatsApp first, in a
 * card of its own, the form second, then what happens after a message, the
 * office (once there are real photos) and the proof strip. Same forms and
 * lead pipeline as the shared `ContactPage`; only the composition differs.
 * Strings are the brand's own `contact.*` / `form.*` / `process.*` keys.
 */
export function BrandContactPage({ site, whatsappMessage, eyebrow }: { site: SiteKey; whatsappMessage?: string; eyebrow: string }) {
  const message = whatsappMessage ?? t(site, 'whatsapp.prefill');
  const whatsapp = whatsappHref(message);
  return (
    <>
      <Band>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div className="lg:pt-4">
            <Breadcrumbs site={site} items={[{ label: t(site, 'contact.h1'), href: '/contact' }]} />
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading level={1} className="mt-4">{t(site, 'contact.h1')}</Heading>
            <p className="mt-6 max-w-[52ch] text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">{t(site, 'contact.sub')}</p>
            {whatsapp && (
              <div className="mt-10 rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-6 md:p-8">
                <p className="max-w-[40ch] font-[family-name:var(--display-font)] text-(length:--step-2) leading-snug text-balance">{t(site, 'team.promise')}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <WhatsAppButton site={site} message={message} placement="contact" className="min-h-12 px-6" />
                </div>
                <p className="mt-5 text-(length:--step--1) text-[var(--fg-muted)]">{t(site, 'contact.orForm')}</p>
              </div>
            )}
          </div>
          <div className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--elev-1)] md:p-10">
            <Heading level={2} className="!text-(length:--step-2)">{t(site, 'process.fullForm')}</Heading>
            <div className="mt-6">
              <LeadForm site={site} variant="contact" pagePath="/contact" />
            </div>
            <details className="mt-8 border-t border-[var(--border)] pt-4">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsappAlternative')}</summary>
              {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsapp')}</a>}
              <p className="my-4 text-[var(--fg-muted)]">{t(site, 'process.whatsappIntro')}</p>
              <LeadForm site={site} variant="whatsapp" pagePath="/contact" />
            </details>
          </div>
        </div>
      </Band>
      <TrustBar site={site} />
      <AfterYouMessage site={site} tone="alt" message={message} />
      <OfficeStrip site={site} />
      <Guarantee site={site} tone="alt" />
    </>
  );
}
