import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';
import { Button } from './Button';
import { WhatsAppIcon } from './WhatsAppIcon';

/**
 * Inline "Message us on WhatsApp" button in the brand's language. Renders
 * nothing when `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset (a missing credential
 * never blocks, plan §4.5), so callers pair it with a form link.
 */
export function WhatsAppButton({ site, message, variant = 'primary', className = '', hero = false, placement = 'inline' }: {
  site: SiteKey; message?: string; variant?: 'primary' | 'secondary' | 'onDark'; className?: string;
  /** Which button this is, for the `whatsapp_click` event (WhatsAppClickTracker). */
  placement?: string;
  /** Marks the hero's contact action, for the fold check in the browser audit. */
  hero?: boolean;
}) {
  const href = whatsappHref(message ?? t(site, 'whatsapp.prefill'));
  if (!href) return null;
  const styles = {
    primary: 'bg-[#1f8f4e] text-white hover:bg-[#197a42]',
    secondary: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[#1f8f4e]',
    onDark: 'bg-white text-black hover:bg-white/90',
  } as const;
  return (
    <a href={href} rel="noopener" target="_blank" data-whatsapp data-placement={hero ? 'hero' : placement} data-hero-contact={hero || undefined} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-brand)] px-5 py-3 text-(length:--text-sm) font-medium transition-colors duration-[var(--duration)] ${styles[variant]} ${className}`}>
      <WhatsAppIcon className={`size-5 ${variant === 'onDark' ? 'text-[#1f8f4e]' : ''}`} />
      {t(site, 'whatsapp.cta')}
    </a>
  );
}

/** Floating WhatsApp button on every page of every brand (SiteShell). */
export function WhatsAppFab({ site }: { site: SiteKey }) {
  const href = whatsappHref(t(site, 'whatsapp.prefill'));
  if (!href) return null;
  return (
    <a
      href={href}
      rel="noopener"
      target="_blank"
      data-whatsapp
      data-wa-fab
      data-placement="floating"
      aria-label={t(site, 'whatsapp.cta')}
      className="group fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center gap-2 rounded-full bg-[#1f8f4e] text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,.45)] transition-[width,background-color] duration-300 hover:bg-[#197a42] sm:right-6 sm:bottom-6 md:w-auto md:px-5"
    >
      <WhatsAppIcon className="size-7 md:size-6" />
      <span className="hidden text-(length:--text-sm) font-medium md:inline">{t(site, 'whatsapp.short')}</span>
    </a>
  );
}

/**
 * The hero's second action: WhatsApp when the number is configured (the main
 * contact channel, no booked calls), otherwise a plain "Message us" link to
 * the brand's form.
 */
export function HeroContact({ site, message, fallbackHref = '/contact' }: { site: SiteKey; message?: string; fallbackHref?: string }) {
  if (whatsappHref(message ?? t(site, 'whatsapp.prefill'))) {
    return <WhatsAppButton site={site} message={message} variant="onDark" hero />;
  }
  return (
    <span data-hero-contact className="contents">
      <Button href={fallbackHref} variant="secondary">{t(site, 'contact.cta')}</Button>
    </span>
  );
}
