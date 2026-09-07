/**
 * The locale list, kept in its own dependency-free module so the site registry
 * can type `SiteConfig.locale` without importing the message loader (which
 * imports the registry back).
 */
export const LOCALES = ['en', 'es', 'pt', 'sv'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * BCP-47 tag for `<html lang>` and `Intl`. Portuguese ships as Brazilian
 * Portuguese (plan §1.11 — the brand is aimed at Brazil), which `pt` alone
 * does not say.
 */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt-BR',
  sv: 'sv',
};

/** Locale used for `Intl.NumberFormat` / `Intl.DateTimeFormat`. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  sv: 'sv-SE',
};

/** OpenGraph `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  sv: 'sv_SE',
};
