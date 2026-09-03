import type { SiteKey } from '@/sites/registry';
import common from './messages/en/common.json';
import residency from './messages/en/residency.json';
import investorpass from './messages/en/investorpass.json';
import guide from './messages/en/guide.json';

/**
 * Minimal i18n layer, in place from the first commit (plan §1.3). English is
 * the only shipped locale; `es`, `de`, `pt` get sibling folders under
 * `messages/` when they land — no call site changes needed.
 */
export const LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

type Messages = Record<string, string>;

const siteMessages: Record<SiteKey, Messages> = {
  residency,
  investorpass,
  guide,
};

const commonMessages: Messages = common;

export function messagesFor(site: SiteKey): Messages {
  return { ...commonMessages, ...siteMessages[site] };
}

/**
 * `t(site, key)` — site messages win over common. A missing key returns the
 * key itself in development (so it is obvious on screen) and an empty string
 * in production (so a typo never ships visible garbage). `npm run verify:i18n`
 * is what actually stops missing keys reaching a build.
 */
export function t(site: SiteKey, key: string, vars?: Record<string, string | number>): string {
  const raw = siteMessages[site]?.[key] ?? commonMessages[key];
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
  return key in siteMessages[site] || key in commonMessages;
}
