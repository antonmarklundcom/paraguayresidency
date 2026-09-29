/**
 * PROOF — the one file where real-world proof lives (overhaul plan §2, §7).
 *
 * Every value below ships EMPTY on purpose. Each proof component on the
 * sites (TrustBar, Testimonials, TeamSection photos, OfficeStrip, Guarantee)
 * reads this file and renders NOTHING for a field that is still null or [].
 * So the sites never show a made-up number, review, face or guarantee: fill a
 * field and the matching block appears on every brand at the next deploy.
 *
 * ─── How to fill it in (Anton) ──────────────────────────────────────────────
 *
 * stats.residenciesFiled   The number of residency cases the team has filed,
 *                          as a plain whole number (no quotes). Count only
 *                          filings you could show a receipt for. Shows as
 *                          "<number> residencies filed".
 * stats.yearsInBusiness    Whole years the team has been doing this, as a
 *                          plain whole number.
 * stats.googleRating       Only once the Google Business Profile has reviews:
 *                          `{ rating: <number>, count: <number>, url: '<link>' }`,
 *                          copied from the profile itself (rating to one
 *                          decimal exactly as Google shows it, count = number
 *                          of Google reviews, url = the public reviews link).
 *                          Update it when it moves.
 *
 * team[].photo             A real portrait you have the right to publish. Put
 *                          the file in `public/images/team/` (a 4:5 crop, at
 *                          least 800×1000, WebP) and write
 *                          `{ src: '/images/team/anton.webp', width: 800, height: 1000 }`.
 *                          Never a stock or generated face. With `photo: null`
 *                          the site shows the typographic monogram instead.
 * team[].languages         Language codes the person answers in, most fluent
 *                          first: `['sv', 'en', 'es']`. The sites print the
 *                          language names in the reader's own language.
 * team[].bio               One or two plain sentences per locale, first
 *                          person or third, no claims you cannot back up. A
 *                          locale left `null` shows no bio on that brand.
 *
 * reviews                  One entry per review, ONLY with the client's
 *                          permission to publish (`permission: true` is a
 *                          required literal: no permission, no entry).
 *                          `quote`   the review's own words, unedited except
 *                                    for trimming; in the language it was written.
 *                          `locale`  that language: 'en' | 'es' | 'pt' | 'sv'.
 *                          `name`    first name + initial, e.g. 'Maria L.'.
 *                          `countryCode` ISO code of their nationality, e.g.
 *                                    'GB', 'ES', 'BR', 'SE' (shows as a flag).
 *                          `route`   which service it was (see ReviewRoute).
 *                          `month`   when they wrote it, 'YYYY-MM'.
 *                          `source`  'google' | 'whatsapp' | 'email' | 'video'.
 *                          `url`     link to the original (a Google review
 *                                    link, a video); leave out for WhatsApp/email.
 *                          `translations` optional, a translation YOU made or
 *                                    approved, e.g. `{ es: '…' }`. A brand
 *                                    shows reviews written in its own language,
 *                                    plus translated ones marked "Translated
 *                                    from …". Nothing is ever machine-translated
 *                                    on the fly.
 *
 * cases                  One entry per finished case you may describe, ONLY with
 *                          the client's permission (`permission: true`, a
 *                          required literal, like reviews). Anonymous by
 *                          design: no name, only nationality.
 *                          `countryCode` ISO code of their nationality ('GB').
 *                          `route`   which service it was (see ReviewRoute).
 *                          `weeks`   whole weeks from the day the file was
 *                                    filed to the outcome named below.
 *                          `outcome` one plain sentence per locale, e.g.
 *                                    `{ en: 'Temporary residency approved, cédula issued.' }`.
 *                                    A brand shows only cases that have a
 *                                    sentence in its own language.
 *                          `month`   when it finished, 'YYYY-MM'.
 *
 * office.address           The street address exactly as it should print.
 * office.mapsUrl           The Google Maps link for that address.
 * office.photos            Real photos of the office or the team at work, in
 *                          `public/images/office/`, each with alt text in all
 *                          four languages:
 *                          `{ src, width, height, alt: { en, es, pt, sv } }`.
 *
 * credentials              Registrations or memberships you are allowed to
 *                          publish (e.g. the escribano's registration):
 *                          `{ label: { en, es, pt, sv }, issuer, url? }`.
 * press                    Articles that actually mention you:
 *                          `{ outlet, title, url, date: 'YYYY-MM-DD' }`.
 * guarantee                The service guarantee wording, if you decide to
 *                          offer one: `{ en, es, pt, sv }`. Leave `null` and
 *                          the service brands show no guarantee block. (The
 *                          guide's 14-day refund is separate, already approved.)
 *
 * `tests/proof.test.ts` fails if any field below is filled without the shape
 * above, and proves every component stays hidden while the data is empty.
 */

export type ProofLocale = 'en' | 'es' | 'pt' | 'sv';

/** Keys match `TEAM_KEYS` in `src/content/team.ts` (a test keeps them in step). */
export type ProofTeamKey = 'anton' | 'yanina' | 'diana';

export interface ProofImage {
  /** Path under `public/`, e.g. `/images/team/anton.webp`. */
  src: string;
  width: number;
  height: number;
}

export interface ProofPhoto extends ProofImage {
  alt: Record<ProofLocale, string>;
}

export interface GoogleRating {
  /** As Google shows it, to one decimal, e.g. 4.9. */
  rating: number;
  /** Number of Google reviews behind that rating. */
  count: number;
  /** Public link to the reviews. */
  url: string;
}

export interface ProofStats {
  residenciesFiled: number | null;
  yearsInBusiness: number | null;
  googleRating: GoogleRating | null;
}

export interface ProofTeamMember {
  key: ProofTeamKey;
  photo: ProofImage | null;
  /** BCP 47 language codes, most fluent first: `['sv', 'en', 'es']`. */
  languages: string[];
  bio: Record<ProofLocale, string | null>;
}

export type ReviewSource = 'google' | 'whatsapp' | 'email' | 'video';

export type ReviewRoute =
  | 'temporary'
  | 'permanent'
  | 'cedula'
  | 'investor_pass'
  | 'mercosur'
  | 'tax_residency'
  | 'family';

export interface Review {
  quote: string;
  locale: ProofLocale;
  /** First name + initial only. */
  name: string;
  /** ISO 3166-1 alpha-2, upper case: 'GB', 'ES', 'BR', 'SE'. */
  countryCode: string;
  route: ReviewRoute;
  /** 'YYYY-MM'. */
  month: string;
  source: ReviewSource;
  url?: string;
  /** Required and always true: no written permission, no entry. */
  permission: true;
  /** Translations Anton made or approved; never machine-generated at runtime. */
  translations?: Partial<Record<ProofLocale, string>>;
}

/** A finished case, anonymous, shown by `<CaseSnapshots>`. */
export interface CaseSnapshot {
  /** Nationality, ISO 3166-1 alpha-2, upper case. */
  countryCode: string;
  route: ReviewRoute;
  /** Whole weeks from filing to the outcome. */
  weeks: number;
  /** One plain sentence per locale; a locale left out shows no case on that brand. */
  outcome: Partial<Record<ProofLocale, string>>;
  /** 'YYYY-MM'. */
  month: string;
  /** Required and always true: no written permission, no entry. */
  permission: true;
}

export interface ProofOffice {
  address: string | null;
  mapsUrl: string | null;
  photos: ProofPhoto[];
}

export interface Credential {
  label: Record<ProofLocale, string>;
  issuer: string;
  url?: string;
}

export interface PressMention {
  outlet: string;
  title: string;
  url: string;
  /** 'YYYY-MM-DD'. */
  date: string;
}

export interface Proof {
  stats: ProofStats;
  team: ProofTeamMember[];
  reviews: Review[];
  cases: CaseSnapshot[];
  office: ProofOffice;
  credentials: Credential[];
  press: PressMention[];
  guarantee: Record<ProofLocale, string> | null;
}

const noBio = (): Record<ProofLocale, string | null> => ({ en: null, es: null, pt: null, sv: null });

export const PROOF: Proof = {
  stats: {
    residenciesFiled: null,
    yearsInBusiness: null,
    googleRating: null,
  },
  team: [
    { key: 'anton', photo: null, languages: [], bio: noBio() },
    { key: 'yanina', photo: null, languages: [], bio: noBio() },
    { key: 'diana', photo: null, languages: [], bio: noBio() },
  ],
  reviews: [],
  cases: [],
  office: {
    address: null,
    mapsUrl: null,
    photos: [],
  },
  credentials: [],
  press: [],
  guarantee: null,
};
