import { describe, expect, it } from 'vitest';
import { commonFor, hasKey, localeFor, messagesFor, siteMessagesFor, t } from '@/i18n';
import { HTML_LANG, INTL_LOCALE, LOCALES, OG_LOCALE } from '@/i18n/locales';
import { SITE_KEYS, sites } from '@/sites/registry';
import { formatMoney, formatMoneyFor, minorUnitFactor, primaryCurrency } from '@/lib/money';

describe('i18n', () => {
  it('resolves a common key on every site', () => {
    for (const site of SITE_KEYS) expect(t(site, 'nav.contact')).not.toBe('');
  });

  it('lets a site message win over the common one', () => {
    for (const site of SITE_KEYS) {
      const msgs = messagesFor(site);
      expect(msgs['home.h1']).toBeTruthy();
    }
    const h1s = SITE_KEYS.map((s) => t(s, 'home.h1'));
    expect(new Set(h1s).size).toBe(SITE_KEYS.length);
  });

  it('interpolates vars', () => {
    expect(t('residency', 'nav.contact', { unused: 1 })).toBeTruthy();
  });

  it('echoes an unknown key in development', () => {
    expect(t('residency', 'totally.missing.key')).toBe('totally.missing.key');
    expect(hasKey('residency', 'totally.missing.key')).toBe(false);
  });

  it('has a message for every nav and footer key in the registry', () => {
    for (const site of SITE_KEYS) {
      const config = sites[site];
      const keys = [
        ...config.nav.map((n) => n.labelKey),
        ...config.footer.columns.flatMap((c) => [c.titleKey, ...c.items.map((i) => i.labelKey)]),
        ...config.footer.legal.map((n) => n.labelKey),
        config.tagline,
      ];
      for (const key of keys) {
        expect(hasKey(site, key), `${site} is missing "${key}"`).toBe(true);
      }
    }
  });

  /* ------------------------------------------------ O9: four real locales */

  it('ships a complete common.json for every locale', () => {
    const reference = Object.keys(commonFor('en')).sort();
    expect(reference.length).toBeGreaterThan(100);
    for (const locale of LOCALES) {
      expect(Object.keys(commonFor(locale)).sort(), `${locale}/common.json drifted`).toEqual(
        reference,
      );
      for (const [key, value] of Object.entries(commonFor(locale))) {
        expect(value, `${locale}/common.json "${key}" is empty`).toBeTruthy();
      }
    }
  });

  it('gives all seven brand files the same key set', () => {
    const reference = Object.keys(siteMessagesFor('residency')).sort();
    for (const site of SITE_KEYS) {
      expect(Object.keys(siteMessagesFor(site)).sort(), `${site}.json drifted`).toEqual(reference);
    }
  });

  it('loads each brand in its own locale, never English by accident', () => {
    expect(localeFor('residenciaes')).toBe('es');
    expect(localeFor('residenciapt')).toBe('pt');
    expect(localeFor('flytta')).toBe('sv');
    expect(localeFor('frontier')).toBe('en');
    // The common string differs per locale, so a wrong folder is visible here.
    expect(t('residenciaes', 'nav.contact')).toBe('Contacto');
    expect(t('residenciapt', 'nav.contact')).toBe('Contato');
    expect(t('flytta', 'nav.contact')).toBe('Kontakt');
    expect(t('residency', 'nav.contact')).toBe('Contact');
  });

  it('does not fall back to English for a key the locale is missing', () => {
    // `t` returns the key in development rather than an English string; the
    // build gate is `verify:i18n`, not a runtime fallback (plan §5.4.2).
    expect(t('residenciaes', 'totally.missing.key')).toBe('totally.missing.key');
  });

  it('covers every locale in the html/Intl/OG tables', () => {
    for (const locale of LOCALES) {
      expect(HTML_LANG[locale]).toBeTruthy();
      expect(INTL_LOCALE[locale]).toBeTruthy();
      expect(OG_LOCALE[locale]).toBeTruthy();
    }
    expect(HTML_LANG.pt).toBe('pt-BR');
  });

  it('merges the brand file over its own locale common file', () => {
    for (const site of SITE_KEYS) {
      const merged = messagesFor(site);
      const common = commonFor(localeFor(site));
      expect(Object.keys(merged).length).toBe(
        new Set([...Object.keys(common), ...Object.keys(siteMessagesFor(site))]).size,
      );
    }
  });

  /* ------------------------------------------------------ O9: formatMoney */

  it('formats money in the brand locale and currency', () => {
    expect(formatMoney(700, 'USD', 'en')).toBe('$7');
    expect(formatMoney(1234, 'USD', 'en')).toBe('$12.34');
    // Guaraní has no minor unit: 50000 cents would be a 500x error.
    expect(minorUnitFactor('PYG')).toBe(1);
    expect(minorUnitFactor('EUR')).toBe(100);
    expect(formatMoney(50_000, 'PYG', 'es')).toContain('50');
    expect(formatMoney(50_000, 'PYG', 'es')).not.toContain('500,00');
  });

  it('picks the brand first declared currency', () => {
    expect(primaryCurrency('residenciaes')).toBe('EUR');
    expect(primaryCurrency('residenciapt')).toBe('BRL');
    expect(primaryCurrency('flytta')).toBe('SEK');
    expect(primaryCurrency('guide')).toBe('USD');
    for (const site of SITE_KEYS) {
      expect(sites[site].currencies.length).toBeGreaterThan(0);
      expect(formatMoneyFor(700, primaryCurrency(site), site)).toBeTruthy();
    }
  });

  it('never throws on an unknown currency code', () => {
    // Intl renders unknown ISO codes as the code itself with a non-breaking
    // space; the `catch` in formatMoney is the belt for the cases it rejects.
    expect(formatMoney(700, 'XYZ', 'en').replace(/\s/g, ' ')).toBe('XYZ 7');
    expect(() => formatMoney(700, 'not a currency', 'en')).not.toThrow();
  });
});
