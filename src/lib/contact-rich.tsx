import type { ReactNode } from 'react';
import { AfterYouMessage, Breadcrumbs, Heading, OfficeStrip, Section, TrustBar, WhatsAppButton } from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';

/**
 * The W5-A contact page (hub and guide): WhatsApp first, in a large panel
 * beside a short "what to tell us" list; the form second; then, for the
 * service brand, what happens after the message, and the office when real
 * photos exist. Wiring (forms, WhatsApp link, tracking) is the same as
 * `ContactPage` in `conversion-pages.tsx`; only the composition differs.
 */
export function RichContactPage({ site, whatsappMessage, checklist, after = false, aside }: {
  site: SiteKey;
  whatsappMessage?: string;
  /** "Tell us…" bullets, in the brand's language. */
  checklist: string[];
  /** Show the "what happens after you message us" band. */
  after?: boolean;
  aside?: ReactNode;
}) {
  const message = whatsappMessage ?? t(site, 'whatsapp.prefill');
  const whatsapp = whatsappHref(message);
  return (
    <>
      <Section>
        <div className="grid gap-[var(--space-12)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
          <div>
            <Breadcrumbs site={site} items={[{ label: t(site, 'contact.h1'), href: '/contact' }]} />
            <Heading level={1} className="mt-[var(--space-8)]">{t(site, 'contact.h1')}</Heading>
            <p className="mt-[var(--space-4)] max-w-[60ch] text-(length:--text-lg) text-[var(--fg-muted)]">{t(site, 'contact.sub')}</p>
            <div className="mt-[var(--space-8)] flex flex-wrap items-center gap-x-4 gap-y-3">
              <WhatsAppButton site={site} message={message} placement="contact" />
              <a href="#form" className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-4">{t(site, 'contact.cta')}: {t(site, 'process.fullForm')}</a>
            </div>
            <ul className="mt-[var(--space-8)] space-y-[var(--space-3)] border-t border-[var(--border)] pt-[var(--space-6)]">
              {checklist.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[.45em] h-2 w-3 shrink-0 -rotate-45 border-b-2 border-l-2 border-[var(--accent)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-[var(--space-6)] text-(length:--text-sm) text-[var(--fg-muted)]">{t(site, 'contact.orForm')}</p>
            {aside}
          </div>
          <div id="form" className="scroll-mt-24 rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--elev-0)] sm:p-8">
            <Heading level={2} className="!text-(length:--text-xl)">{t(site, 'process.fullForm')}</Heading>
            <div className="mt-[var(--space-4)]">
              <LeadForm site={site} variant="contact" pagePath="/contact" />
            </div>
            <details className="mt-[var(--space-8)] border-t border-[var(--border)] pt-[var(--space-4)]">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsappAlternative')}</summary>
              {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-[44px] items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsapp')}</a>}
              <p className="my-[var(--space-4)] text-[var(--fg-muted)]">{t(site, 'process.whatsappIntro')}</p>
              <LeadForm site={site} variant="whatsapp" pagePath="/contact" />
            </details>
          </div>
        </div>
      </Section>
      <TrustBar site={site} />
      {after && <AfterYouMessage site={site} tone="alt" message={message} />}
      <OfficeStrip site={site} tone={after ? 'default' : 'alt'} />
    </>
  );
}
