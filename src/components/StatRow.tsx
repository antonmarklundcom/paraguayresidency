/**
 * Ported from `antonmarklundcom/flyttatillparaguay` (`components/blocks.tsx`,
 * plan §12.4) onto the shared token system. A row of short stats used inside
 * article bodies (e.g. cost-of-living figures) — never a home for a legal or
 * financial figure that belongs in `content/shared/facts.ts` (plan §4.11);
 * this is for plain, non-legal numbers (population, distance, reading time).
 */
export interface Stat {
  value: string;
  label: string;
  note?: string;
}

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid gap-[var(--space-6)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)] not-prose sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span className="block font-[family-name:var(--display-font)] text-[var(--text-3xl)] text-[var(--accent)]">
              {stat.value}
            </span>
            <span className="mt-[var(--space-1)] block text-[var(--text-sm)] font-medium">
              {stat.label}
            </span>
            {stat.note && (
              <span className="mt-[var(--space-1)] block text-[var(--text-xs)] text-[var(--fg-muted)]">
                {stat.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
