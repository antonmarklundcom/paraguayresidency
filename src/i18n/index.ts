import { getSite, type SiteKey } from '@/sites/registry';
import { INTL_LOCALE, type Locale } from './locales';

import enCommon from './messages/en/common.json';
import esCommon from './messages/es/common.json';
import ptCommon from './messages/pt/common.json';
import svCommon from './messages/sv/common.json';

import residency from './messages/en/residency.json';
import investorpass from './messages/en/investorpass.json';
import guide from './messages/en/guide.json';
import frontier from './messages/en/frontier.json';
import residenciaes from './messages/es/residenciaes.json';
import residenciapt from './messages/pt/residenciapt.json';
import flytta from './messages/sv/flytta.json';

/**
 * i18n for seven brands in four locales (plan §1.3, §5.4.2).
 *
 * A brand has exactly one locale, so there is no runtime locale switch and no
 * `/es/` path prefix: the host decides the language. `messagesFor(site)` loads
 * that locale's `common.json` plus the brand's own file.
 *
 * **No silent `en` fallback in production.** A key missing from a shipped
 * locale is a bug that `npm run verify:i18n` refuses to let past the build, so
 * `t()` never quietly renders English on a Spanish page.
 */
export { LOCALES, DEFAULT_LOCALE, isLocale, HTML_LANG, INTL_LOCALE, OG_LOCALE } from './locales';
export type { Locale } from './locales';

type Messages = Record<string, string>;

const commonByLocale: Record<Locale, Messages> = {
  en: enCommon,
  es: esCommon,
  pt: ptCommon,
  sv: svCommon,
};

const siteMessages: Record<SiteKey, Messages> = {
  residency,
  investorpass,
  guide,
  frontier,
  residenciaes,
  residenciapt,
  flytta,
};

export function localeFor(site: SiteKey): Locale {
  return getSite(site).locale;
}

/** The Intl tag for a brand — `formatMoney` and every date format use it. */
export function intlLocaleFor(site: SiteKey): string {
  return INTL_LOCALE[localeFor(site)];
}

export function messagesFor(site: SiteKey): Messages {
  return { ...commonByLocale[localeFor(site)], ...siteMessages[site] };
}

/**
 * `t(site, key)` — the brand's own file wins over its locale's common file.
 *
 * A missing key returns the key itself in development (obvious on screen) and
 * an empty string in production (a typo never ships visible garbage). It does
 * NOT fall back to English: a half-translated Spanish page is worse than a
 * gap, and `verify:i18n` is what actually stops either from shipping.
 */
export function t(site: SiteKey, key: string, vars?: Record<string, string | number>): string {
  const raw = siteMessages[site]?.[key] ?? commonByLocale[localeFor(site)]?.[key];
  if (raw === undefined) {
    return process.env.NODE_ENV === 'production' ? '' : key;
  }
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Curried helper for components that already know their site. */
export function translator(site: SiteKey) {
  return (key: string, vars?: Record<string, string | number>) => t(site, key, vars);
}

export function hasKey(site: SiteKey, key: string): boolean {
  return key in siteMessages[site] || key in commonByLocale[localeFor(site)];
}

/** Exposed for `verify:i18n` and the i18n tests. */
export function commonFor(locale: Locale): Messages {
  return commonByLocale[locale];
}

export function siteMessagesFor(site: SiteKey): Messages {
  return siteMessages[site];
}
