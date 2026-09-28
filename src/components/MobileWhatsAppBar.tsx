import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import { getSite, siteSellsProducts, type SiteKey } from '@/sites/registry';
import { MobileBarClient, type BarAction } from './MobileBar';

/**
 * The phone-width action bar on every page of every brand (overhaul plan §2),
 * mounted once by SiteShell. Service brands: WhatsApp with the brand's own
 * pre-typed text (the same `whatsapp.prefill` and number as every other
 * WhatsApp button). The guide sells, so its main action is the brand's
 * buy anchor (`SiteConfig.cta`) with WhatsApp as a small icon beside it.
 * Without a WhatsApp number it falls back to the contact page, like
 * HeroContact. A page with its own form bar (StickyCta) hides this one.
 */
export function MobileWhatsAppBar({ site }: { site: SiteKey }) {
  const config = getSite(site);
  const href = whatsappHref(t(site, 'whatsapp.prefill'));
  const whatsapp = href ? { href, label: t(site, 'whatsapp.cta') } : null;
  const sells = siteSellsProducts(site);
  const primary: BarAction = sells
    ? { href: config.cta.href, label: t(site, config.cta.labelKey), kind: 'buy' }
    : whatsapp
      ? { ...whatsapp, kind: 'whatsapp' }
      : { href: '/contact', label: t(site, 'contact.cta'), kind: 'contact' };
  return <MobileBarClient site={site} label={t(site, 'mobileBar.label')} primary={primary} secondary={sells ? whatsapp : null} />;
}
