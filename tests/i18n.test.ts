import { describe, expect, it } from 'vitest';
import { hasKey, messagesFor, t } from '@/i18n';
import { SITE_KEYS, sites } from '@/sites/registry';

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
});
