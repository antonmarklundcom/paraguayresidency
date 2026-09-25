'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LeadForm } from './LeadForm';
import type { SiteKey } from '@/sites/registry';

export interface ChecklistRoute {
  id: string;
  label: string;
  /** i18n-resolved doc line items, already translated by the caller. */
  docs: string[];
}

export interface ChecklistNationality {
  id: string;
  label: string;
  /** Link to a dedicated nationality document guide, when one exists. */
  href?: string;
}

const field =
  'mt-[var(--space-2)] w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-(length:--text-sm) text-[var(--fg)] outline-none focus:border-[var(--accent)]';
const label = 'block text-(length:--text-sm) font-medium text-[var(--fg)]';

/**
 * Interactive nationality × route document checklist. A lead magnet, not a
 * legal reference: every route renders the same hedge note, and the police
 * certificate row always links to the Interpol/police-certificate explainer
 * rather than asserting a country's process inline.
 */
export function DocumentChecklist({
  site,
  pagePath,
  routes,
  nationalities,
  policeCertHref,
  copy,
}: {
  site: SiteKey;
  pagePath: string;
  routes: ChecklistRoute[];
  nationalities: ChecklistNationality[];
  policeCertHref: string;
  copy: {
    routeLabel: string;
    nationalityLabel: string;
    checklistHeading: string;
    note: string;
    policeCertCta: string;
    nationalityArticleCta: string;
    formTitle: string;
    formBody: string;
  };
}) {
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [natId, setNatId] = useState(nationalities[0]?.id ?? '');
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const route = routes.find((r) => r.id === routeId) ?? routes[0];
  const nationality = nationalities.find((n) => n.id === natId) ?? nationalities[0];

  return (
    <div className="not-prose">
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <label>
          <span className={label}>{copy.routeLabel}</span>
          <select
            className={field}
            value={route?.id}
            onChange={(e) => setRouteId(e.target.value)}
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {nationalities.length > 0 ? (
          <label>
            <span className={label}>{copy.nationalityLabel}</span>
            <select
              className={field}
              value={nationality?.id}
              onChange={(e) => setNatId(e.target.value)}
            >
              {nationalities.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="mt-[var(--space-8)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)]">
        <h2 className="font-[family-name:var(--display-font)] text-(length:--text-xl)">
          {copy.checklistHeading}
        </h2>
        <ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
          {route?.docs.map((doc) => (
            <li key={doc} className="flex items-start gap-[var(--space-3)]">
              <input
                type="checkbox"
                checked={!!checked[doc]}
                onChange={() =>
                  setChecked((prev) => ({ ...prev, [doc]: !prev[doc] }))
                }
                className="mt-1 size-4 shrink-0 rounded border-[var(--border)] accent-[var(--accent)]"
                aria-label={doc}
              />
              <span className={checked[doc] ? 'text-[var(--fg-muted)] line-through' : ''}>
                {doc}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-[var(--space-6)] text-(length:--text-sm) text-[var(--fg-muted)]">
          {copy.note}
        </p>

        <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)]">
          <Link
            href={policeCertHref}
            className="text-(length:--text-sm) underline underline-offset-4"
          >
            {copy.policeCertCta}
          </Link>
          {nationality?.href ? (
            <Link
              href={nationality.href}
              className="text-(length:--text-sm) underline underline-offset-4"
            >
              {copy.nationalityArticleCta}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-[var(--space-12)]">
        <h2 className="font-[family-name:var(--display-font)] text-(length:--text-xl)">
          {copy.formTitle}
        </h2>
        <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">{copy.formBody}</p>
        <div className="mt-[var(--space-6)]">
          <LeadForm site={site} variant="quiz" pagePath={pagePath} />
        </div>
      </div>
    </div>
  );
}
