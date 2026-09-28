/* eslint-disable @next/next/no-img-element -- Local team portraits with fixed dimensions. */
import { PROOF, type Proof, type ProofTeamMember } from '@content/shared/proof';
import { intlLocaleFor, localeFor, t } from '@/i18n';
import { TEAM, TEAM_KEYS, type TeamKey } from '@/content/team';
import type { SiteKey } from '@/sites/registry';
import { Band, SectionHeader } from './SectionKit';

function initials(name: string): string {
  return name.split(' ').map((part) => part[0]).join('');
}

/**
 * The people who answer (overhaul plan §2): a portrait slot, name, role from
 * `src/content/team.ts`, the languages they answer in and a short bio, all
 * from `content/shared/proof.ts`. Without a real photo the slot is a
 * typographic monogram: never a stock or generated face.
 */
export function TeamSection({ site, proof = PROOF, tone = 'default' }: { site: SiteKey; proof?: Proof; tone?: 'default' | 'alt' }) {
  const locale = localeFor(site);
  const intl = intlLocaleFor(site);
  const languageNames = new Intl.DisplayNames([intl], { type: 'language' });
  const list = new Intl.ListFormat(intl, { type: 'conjunction' });
  const byKey = new Map<TeamKey, ProofTeamMember>(proof.team.map((member) => [member.key, member]));

  return (
    <Band tone={tone} labelledBy="team-title" data-team-section>
      <SectionHeader id="team-title" eyebrow={t(site, 'team.label')} title={t(site, 'about.teamTitle')} intro={t(site, 'team.promise')} />
      <ul className="mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-12 md:mt-16 lg:grid-cols-3 lg:gap-x-10">
        {TEAM_KEYS.map((key) => {
          const person = TEAM[key];
          const extra = byKey.get(key);
          const languages = (extra?.languages ?? []).map((code) => languageNames.of(code) ?? code);
          const bio = extra?.bio[locale];
          return (
            <li key={key} className="grid min-w-0 grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-5 sm:block">
              <div className="@container relative aspect-[4/5] overflow-hidden rounded-[var(--radius-brand)] bg-[var(--surface)] shadow-[var(--elev-0)]">
                {extra?.photo ? (
                  <img
                    src={extra.photo.src}
                    width={extra.photo.width}
                    height={extra.photo.height}
                    alt={t(site, 'team.photoAlt', { name: person.name })}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Monogram name={person.name} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--display-font)] text-(length:--step-2) leading-tight sm:mt-6">{person.name}</h3>
                <p className="mt-1.5 text-(length:--step--1) text-[var(--fg-muted)]">{person.role[locale]}</p>
                {languages.length > 0 && (
                  <p className="mt-3 text-(length:--step--1) text-[var(--fg)]">{t(site, 'team.languages', { languages: list.format(languages) })}</p>
                )}
                {bio && <p className="mt-4 max-w-[46ch] leading-relaxed text-[var(--fg-muted)]">{bio}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

/**
 * The no-photo slot: initials set large in the display face, bottom left, on
 * the brand surface with a hairline frame and an accent rule, all sized to
 * the slot (container units). Deliberately a typographic plate, not a
 * tinted circle.
 */
function Monogram({ name }: { name: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between p-[9cqw]">
      <span className="h-[2px] w-[15cqw] bg-[var(--accent)]" />
      <span className="font-[family-name:var(--display-font)] text-[38cqw] leading-[.8] tracking-[-.04em] text-[var(--fg)]">
        {initials(name)}
      </span>
      <span className="pointer-events-none absolute inset-[4.5cqw] rounded-[calc(var(--radius-brand)-4px)] border border-[var(--border)]" />
    </div>
  );
}
