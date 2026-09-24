import { t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';

const TEAM = ['Anton Marklund', 'Yanina Alvarez', 'Diana Davalos'];

export function TeamStrip({ site }: { site: SiteKey }) {
  return (
    <section aria-label={t(site, 'team.label')} className="border-y border-[var(--border)] bg-[var(--surface-alt)] py-16 md:py-20">
      <div className="mx-auto grid max-w-[var(--container)] items-center gap-10 px-5 sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="max-w-md">
          <p className="text-(length:--text-xs) font-medium uppercase tracking-[.18em] text-[var(--accent)]">{t(site, 'team.label')}</p>
          <p className="mt-3 font-[family-name:var(--display-font)] text-(length:--text-2xl) leading-[var(--leading-tight)] text-balance">{t(site, 'team.promise')}</p>
          <p className="mt-3 text-(length:--text-sm) text-[var(--fg-muted)]">{t(site, 'team.place')}</p>
        </div>
        <ul className="flex gap-5 sm:gap-10">
          {TEAM.map(name => (
            <li key={name} className="min-w-0 flex-1 text-center">
              <span aria-hidden="true" className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-[var(--accent)] font-[family-name:var(--display-font)] text-xl text-[var(--accent-fg)] ring-4 ring-[var(--surface)] sm:size-20 sm:text-2xl">{name.split(' ').map(part => part[0]).join('')}</span>
              <p className="text-sm font-medium">{name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
