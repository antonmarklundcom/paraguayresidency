import type { Locale } from '@/i18n/locales';

/**
 * The named people behind every brand (the same team answers all seven). An
 * article names an author and, optionally, a reviewer from this list; both
 * render as a visible byline and as `Person` JSON-LD, which is the E-E-A-T
 * signal answer engines look for.
 *
 * Roles are deliberately plain until Anton supplies titles and credentials:
 * nothing here claims a qualification nobody has confirmed.
 */
export const TEAM_KEYS = ['anton', 'yanina', 'diana'] as const;
export type TeamKey = (typeof TEAM_KEYS)[number];

export interface TeamMember {
  key: TeamKey;
  name: string;
  role: Record<Locale, string>;
  /** Public profile URLs (LinkedIn etc.) for `sameAs`; empty until supplied. */
  sameAs: string[];
}

export const TEAM: Record<TeamKey, TeamMember> = {
  anton: {
    key: 'anton',
    name: 'Anton Marklund',
    role: {
      en: 'Founder, Paraguay Residency Group',
      es: 'Fundador, Paraguay Residency Group',
      pt: 'Fundador, Paraguay Residency Group',
      sv: 'Grundare, Paraguay Residency Group',
    },
    sameAs: [],
  },
  yanina: {
    key: 'yanina',
    name: 'Yanina Alvarez',
    role: {
      en: 'Residency case team, Asunción',
      es: 'Equipo de trámites de residencia, Asunción',
      pt: 'Equipe de processos de residência, Assunção',
      sv: 'Handläggarteamet för uppehållstillstånd, Asunción',
    },
    sameAs: [],
  },
  diana: {
    key: 'diana',
    name: 'Diana Davalos',
    role: {
      en: 'Residency case team, Asunción',
      es: 'Equipo de trámites de residencia, Asunción',
      pt: 'Equipe de processos de residência, Assunção',
      sv: 'Handläggarteamet för uppehållstillstånd, Asunción',
    },
    sameAs: [],
  },
};

export function personJsonLd(key: TeamKey, locale: Locale) {
  const member = TEAM[key];
  return {
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role[locale],
    worksFor: { '@type': 'Organization', name: 'Paraguay Residency Group' },
    ...(member.sameAs.length ? { sameAs: member.sameAs } : {}),
  };
}
