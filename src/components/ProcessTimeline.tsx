import { Fact } from './Fact';
import { t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';

export type ProcessRoute = 'temporary' | 'permanent' | 'cedula' | 'tax' | 'family' | 'standard' | 'investor';

/** Presentational only: processing estimates and card validity are separate facts. */
export function ProcessTimeline({ site, route }: { site: SiteKey; route: ProcessRoute }) {
  const timeline = route === 'cedula' ? 'cedula.timeline'
    : route === 'tax' ? 'tax.timeline'
    : route === 'investor' ? 'investorpass.timeline' : 'residency.timeline';
  const steps = [
    { title: 'prepare', body: route === 'investor' ? 'prepareInvestor' : route === 'family' ? 'prepareFamily' : 'prepareBody', duration: t(site, 'process.prepareDuration') },
    { title: 'file', body: 'fileBody', duration: t(site, 'process.fileDuration') },
    { title: 'decision', body: 'decisionBody', duration: <Fact k={timeline} site={site} /> },
    ...(route !== 'cedula' && route !== 'tax' ? [{ title: 'cedula', body: 'cedulaBody', duration: <Fact k="cedula.timeline" site={site} /> }] : []),
    ...(['temporary', 'permanent', 'standard'].includes(route) ? [{ title: 'term', body: 'termBody', duration: <Fact k="temporary.duration" site={site} /> }] : []),
  ];

  return (
    <section aria-label={t(site, 'process.title')} className="not-prose my-[var(--space-12)] space-y-[var(--space-8)]">
      <h2 className="font-[family-name:var(--display-font)] text-(length:--text-2xl)">{t(site, 'process.title')}</h2>
      <ol className="grid list-decimal gap-[var(--space-6)] pl-[var(--space-6)]">
        {steps.map(step => (
          <li key={step.title} className="pl-[var(--space-2)]">
            <h3 className="font-semibold">{t(site, `process.${step.title}`)}</h3>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{t(site, `process.${step.body}`)}</p>
            <p className="mt-[var(--space-2)] text-(length:--text-sm)"><strong>{t(site, 'process.duration')}: </strong>{step.duration}</p>
          </li>
        ))}
      </ol>
      <aside className="rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-6)]">
        <h2 className="font-[family-name:var(--display-font)] text-(length:--text-xl)">{t(site, 'process.trustTitle')}</h2>
        <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">{t(site, 'process.trustBody')}</p>
      </aside>
    </section>
  );
}
