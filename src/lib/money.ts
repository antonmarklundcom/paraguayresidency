import { INTL_LOCALE, type Locale } from '@/i18n/locales';
import { getSite, type SiteKey } from '@/sites/registry';

/**
 * Money formatting for seven brands in four locales (plan §5.4.2).
 *
 * Amounts are always integer minor units — cents, centavos, öre — because
 * that is how every processor and every column in `products`/`purchases`
 * stores them. Formatting is the only place a decimal point appears.
 */

/** Currencies with no minor unit: 1 PYG is 1 guaraní, not 100 céntimos. */
const ZERO_DECIMAL = new Set(['PYG', 'JPY', 'CLP', 'KRW', 'VND', 'ISK']);

export function minorUnitFactor(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100;
}

/**
 * `formatMoney(700, 'USD', 'en')` → `$7`. A whole amount prints without
 * decimals; anything else keeps them, so $7 never renders as "$7.00" on a
 * sales page and €1,234.50 never loses its 50.
 */
export function formatMoney(cents: number, currency: string, locale: Locale): string {
  const code = currency.toUpperCase();
  const factor = minorUnitFactor(code);
  const amount = cents / factor;
  const whole = cents % factor === 0;
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'currency',
      currency: code,
      minimumFractionDigits: whole ? 0 : undefined,
    }).format(amount);
  } catch {
    // An unknown ISO code must not take a page down with it.
    return `${code} ${amount.toFixed(whole ? 0 : 2)}`;
  }
}

/** The same, resolving the locale from the brand. */
export function formatMoneyFor(cents: number, currency: string, site: SiteKey): string {
  return formatMoney(cents, currency, getSite(site).locale);
}

/** The brand's first display currency (plan §2 `currencies`). */
export function primaryCurrency(site: SiteKey): string {
  return getSite(site).currencies[0] ?? 'USD';
}

export function formatDate(value: Date | string, locale: Locale): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
