import type { ReactNode } from 'react';
import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';
import { LeadForm } from './LeadForm';
import type { LeadVariant } from './LeadFormFields';

/**
 * The homepage close: the pitch and three promises on the left, the form in a
 * card on the right, WhatsApp behind a disclosure (F-014). Presentation only —
 * the form, its action and the lead pipeline are untouched.
 */
export function LeadPanel({ site, variant, title, intro, whatsappMessage, id = 'contact', pagePath = '/', footnote }: {
  site: SiteKey;
  variant: Exclude<LeadVariant, 'whatsapp' | 'quiz'>;
  title: string;
  intro: string;
  whatsappMessage: string;
  id?: string;
  pagePath?: string;
  footnote?: ReactNode;
}) {
  const whatsapp = whatsappHref(whatsappMessage);
  const points = ['lead.point.reply', 'lead.point.fee', 'lead.point.honest'];
  return (
    <section id={id} className="scroll-mt-20 bg-[var(--surface-alt)] py-16 md:py-24">
      <div className="mx-auto grid max-w-[var(--container)] gap-10 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div className="lg:pt-6">
          <p className="text-(length:--text-xs) font-medium uppercase tracking-[.18em] text-[var(--accent)]">{t(site, 'lead.eyebrow')}</p>
          <h2 className="mt-3 font-[family-name:var(--display-font)] text-(length:--text-2xl) leading-[var(--leading-tight)] text-balance sm:text-(length:--text-3xl)">{title}</h2>
          <p className="mt-4 text-[var(--fg-muted)]">{intro}</p>
          <ul className="mt-8 space-y-4">
            {points.map((key) => (
              <li key={key} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs text-[var(--accent-fg)]">✓</span>
                <span>{t(site, key)}</span>
              </li>
            ))}
          </ul>
          {footnote && <div className="mt-8 text-(length:--text-sm) text-[var(--fg-muted)]">{footnote}</div>}
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:p-10">
          <h3 className="font-[family-name:var(--display-font)] text-(length:--text-xl)">{t(site, 'process.fullForm')}</h3>
          <div className="mt-6">
            <LeadForm site={site} variant={variant} pagePath={pagePath} />
          </div>
          <details className="mt-8 border-t border-[var(--border)] pt-4">
            <summary className="flex min-h-[44px] cursor-pointer items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsappAlternative')}</summary>
            {whatsapp && <a href={whatsapp} rel="noopener" className="inline-flex min-h-11 items-center text-[var(--accent)] underline underline-offset-2">{t(site, 'form.whatsapp')}</a>}
            <p className="my-4 text-[var(--fg-muted)]">{t(site, 'process.whatsappIntro')}</p>
            <LeadForm site={site} variant="whatsapp" pagePath={pagePath} />
          </details>
        </div>
      </div>
    </section>
  );
}
