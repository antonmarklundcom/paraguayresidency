import { AfterYouMessage, Band, Breadcrumbs, LeadForm, OfficeStrip, WhatsAppButton } from '@/components';
import type { LeadVariant } from '@/components/LeadFormFields';
import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';

/**
 * WhatsApp first, the lead form second (overhaul plan §3): the primary action
 * sits in the left column with the three promises the sites already make, the
 * full form in a card beside it, then "what happens after you message us" and
 * the office (hidden until the proof file has one).
 */
export function ContactLayout({ site, variant, message }: { site: SiteKey; variant: Exclude<LeadVariant, 'whatsapp' | 'quiz'>; message: string }) {
  const whatsapp = whatsappHref(message);
  const points = ['lead.point.reply', 'lead.point.fee', 'lead.point.honest'];
  return (
    <>
      <Band labelledBy="contact-title">
        <Breadcrumbs site={site} items={[{ label: t(site, 'nav.contact'), href: '/contact' }]} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div>
            <h1 id="contact-title" className="font-[family-name:var(--display-font)] text-(length:--step-5) leading-[1.02] text-balance">{t(site, 'contact.h1')}</h1>
            <p className="mt-6 max-w-[46ch] text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">{t(site, 'contact.sub')}</p>
            <div className="mt-8">
              <WhatsAppButton site={site} message={message} placement="contact" className="!min-h-14 !px-7" />
            </div>
            <ul className="mt-10 space-y-4 border-t border-[var(--border)] pt-8">
              {points.map((key) => (
                <li key={key} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs text-[var(--accent-fg)]">✓</span>
                  <span>{t(site, key)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-(length:--step--1) text-[var(--fg-muted)]">{t(site, 'contact.orForm')}</p>
          </div>
          <div className="self-start rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--elev-1)] sm:p-10">
            <h2 className="font-[family-name:var(--display-font)] text-(length:--step-2)">{t(site, 'process.fullForm')}</h2>
            <div className="mt-6">
              <LeadForm site={site} variant={variant} pagePath="/contact" />
            </div>
            <details className="mt-8 border-t border-[var(--border)] pt-4">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsappAlternative')}</summary>
              {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsapp')}</a>}
              <p className="my-4 text-[var(--fg-muted)]">{t(site, 'process.whatsappIntro')}</p>
              <LeadForm site={site} variant="whatsapp" pagePath="/contact" />
            </details>
          </div>
        </div>
      </Band>
      <AfterYouMessage site={site} tone="alt" message={message} />
      <OfficeStrip site={site} />
    </>
  );
}
