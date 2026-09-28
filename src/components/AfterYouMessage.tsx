import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';
import { Button } from './Button';
import { Band, SectionHeader } from './SectionKit';
import { WhatsAppButton } from './WhatsApp';

const STEPS = [1, 2, 3, 4] as const;

/**
 * "What happens after you message us": the first hour, day, week and month
 * (overhaul plan §2). The wording only restates what the sites already
 * promise (`proof.reply`, the WhatsApp reply templates, the /process pages):
 * a person reads it, a written answer within one working day, the route and
 * fixed fee in writing before anything starts, documents in the right order.
 * The first step says "straight away", not "within the hour": no page
 * promises an hour. One action: WhatsApp, or the contact page without a number.
 */
export function AfterYouMessage({ site, tone = 'default', message }: {
  site: SiteKey;
  tone?: 'default' | 'alt';
  /** Pre-typed WhatsApp text; defaults to the brand's own. */
  message?: string;
}) {
  return (
    <Band tone={tone} labelledBy="after-title" data-after-you-message>
      <SectionHeader id="after-title" eyebrow={t(site, 'after.eyebrow')} title={t(site, 'after.title')} intro={t(site, 'after.intro')} />
      <ol className="relative mt-12 grid gap-10 md:mt-16 lg:grid-cols-4 lg:gap-8">
        {/* The rail: vertical on phones, horizontal from lg. */}
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[5px] w-px bg-[var(--border)] lg:top-[5px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto" />
        {STEPS.map((step) => (
          <li key={step} className="relative pl-9 lg:pt-10 lg:pl-0">
            <span aria-hidden="true" className="absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] lg:top-0" />
            <p className="text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--accent)]">{t(site, `after.${step}.when`)}</p>
            <h3 className="mt-3 font-[family-name:var(--display-font)] text-(length:--step-2) leading-tight text-balance">{t(site, `after.${step}.title`)}</h3>
            <p className="mt-3 leading-relaxed text-[var(--fg-muted)]">{t(site, `after.${step}.body`)}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-col gap-6 border-t border-[var(--border)] pt-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[60ch] text-(length:--step--1) text-[var(--fg-muted)]">{t(site, 'after.note')}</p>
        {whatsappHref(message ?? t(site, 'whatsapp.prefill')) ? (
          <WhatsAppButton site={site} message={message} placement="after-you-message" className="shrink-0" />
        ) : (
          <Button href="/contact" className="shrink-0">{t(site, 'contact.cta')}</Button>
        )}
      </div>
    </Band>
  );
}
