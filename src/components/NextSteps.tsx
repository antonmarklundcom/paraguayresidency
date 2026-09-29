import { t } from '@/i18n';
import { priceKeyFor, replyHours } from '@/lib/reply-window';
import { whatsappHref } from '@/lib/whatsapp';
import type { FactKey } from '@content/shared/facts';
import type { SiteKey } from '@/sites/registry';
import { Fact } from './Fact';
import { WhatsAppButton } from './WhatsApp';

const STEPS = [1, 2, 3] as const;

/**
 * The one "what happens next" block, at the end of every service page and
 * article: three steps, who replies, how fast, and the price anchor (a
 * <Fact>, so it is the hedged wording until the fee is verified). The reply
 * time is config (`replyHours`): with no value set it promises no number.
 * WhatsApp when a number is set, otherwise the contact page.
 */
export function NextSteps({ site, path = '/', priceKey }: { site: SiteKey; path?: string; priceKey?: FactKey }) {
  const hours = replyHours();
  const key = priceKey ?? priceKeyFor(path);
  return (
    <section aria-labelledby="next-steps-title" data-next-steps className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-6)] sm:p-[var(--space-8)]">
      <h2 id="next-steps-title" className="font-[family-name:var(--display-font)] text-(length:--text-xl)">{t(site, 'nextSteps.title')}</h2>
      <ol className="mt-[var(--space-5)] grid gap-[var(--space-4)] md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step} className="flex gap-3">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-(length:--text-sm) font-medium text-[var(--accent-fg)]">{step}</span>
            <div>
              <h3 className="font-medium">{t(site, `nextSteps.${step}.title`)}</h3>
              <p className="mt-1 text-(length:--text-sm) text-[var(--fg-muted)]">{t(site, `nextSteps.${step}.body`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <dl className="mt-[var(--space-6)] grid gap-[var(--space-3)] border-t border-[var(--border)] pt-[var(--space-5)] text-(length:--text-sm) sm:grid-cols-[auto_1fr] sm:gap-x-6">
        <dt className="font-medium">{t(site, 'nextSteps.who.label')}</dt>
        <dd className="text-[var(--fg-muted)]">{t(site, 'nextSteps.who.body')}</dd>
        <dt className="font-medium">{t(site, 'nextSteps.reply.label')}</dt>
        <dd data-reply-window={hours ?? 'none'} className="text-[var(--fg-muted)]">
          {hours ? t(site, 'nextSteps.reply.hours', { hours }) : t(site, 'nextSteps.reply.default')}
        </dd>
        <dt className="font-medium">{t(site, 'nextSteps.price.label')}</dt>
        <dd className="text-[var(--fg-muted)]"><Fact k={key} site={site} />. {t(site, 'nextSteps.price.note')}</dd>
      </dl>
      <div className="mt-[var(--space-5)]">
        {whatsappHref(t(site, 'whatsapp.prefill')) ? (
          <WhatsAppButton site={site} placement="next-steps" />
        ) : (
          <a href="/contact" className="inline-flex min-h-11 items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-(length:--text-sm) font-medium text-[var(--accent-fg)] hover:opacity-90">{t(site, 'contact.cta')}</a>
        )}
      </div>
    </section>
  );
}
