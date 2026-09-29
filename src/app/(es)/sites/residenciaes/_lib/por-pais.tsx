import Link from 'next/link';
import type { ArticleLink } from '@/lib/article-page';
import { contentHref } from '@/lib/content-href';

/**
 * The nationality programme (seo-gap.md §2): one page per nationality, whether
 * it lives in the `por-pais` hub or is one of the four older `documentos` pages
 * whose URLs are kept. One list feeds the `/guias/por-pais` selector, the
 * per-article service link and the `/documentos/lista` nationality picker, so
 * a new country is one line here.
 *
 * `mercosur` says whether the nationality is on Migraciones' Mercosur
 * residence list (`mercosur.residency_route` names them); the label under it
 * is the bloc status, which is a different thing (Colombia is an associate
 * state and still on the list; Venezuela is a suspended member and is not).
 */
export interface Nationality {
  /** ISO 3166-1 alpha-2, lower case. */
  id: string;
  country: string;
  flag: string;
  slugPath: string;
  mercosur: boolean;
  status: string;
  note: string;
}

export const NATIONALITIES: Nationality[] = [
  {
    id: 'es',
    country: 'España',
    flag: '🇪🇸',
    slugPath: 'documentos/documentos-y-apostillas-para-espanoles',
    mercosur: false,
    status: 'Vía general',
    note: 'Certificados del Registro Civil y de Justicia, apostilla española y el ángulo fiscal.',
  },
  {
    id: 'ar',
    country: 'Argentina',
    flag: '🇦🇷',
    slugPath: 'documentos/documentos-y-apostillas-para-argentinos',
    mercosur: true,
    status: 'Miembro pleno',
    note: 'Entras con DNI; partida provincial y certificado de Reincidencia.',
  },
  {
    id: 've',
    country: 'Venezuela',
    flag: '🇻🇪',
    slugPath: 'por-pais/residencia-en-paraguay-para-venezolanos',
    mercosur: false,
    status: 'Fuera de la vía Mercosur',
    note: 'Visa consular para entrar y apostilla electrónica de la Cancillería.',
  },
  {
    id: 'co',
    country: 'Colombia',
    flag: '🇨🇴',
    slugPath: 'documentos/documentos-y-apostillas-para-colombianos',
    mercosur: true,
    status: 'Estado asociado',
    note: 'Registro civil de la Registraduría y apostilla en línea.',
  },
  {
    id: 'mx',
    country: 'México',
    flag: '🇲🇽',
    slugPath: 'documentos/documentos-y-apostillas-para-mexicanos',
    mercosur: false,
    status: 'Vía general',
    note: 'Acta estatal y apostilla del estado o de la SRE.',
  },
  {
    id: 'cl',
    country: 'Chile',
    flag: '🇨🇱',
    slugPath: 'por-pais/residencia-en-paraguay-para-chilenos',
    mercosur: true,
    status: 'Estado asociado',
    note: 'Certificados del Registro Civil con la apostilla incluida en línea.',
  },
  {
    id: 'pe',
    country: 'Perú',
    flag: '🇵🇪',
    slugPath: 'por-pais/residencia-en-paraguay-para-peruanos',
    mercosur: true,
    status: 'Estado asociado',
    note: 'Antecedentes del Poder Judicial y apostilla digital de Cancillería.',
  },
  {
    id: 'uy',
    country: 'Uruguay',
    flag: '🇺🇾',
    slugPath: 'por-pais/residencia-en-paraguay-para-uruguayos',
    mercosur: true,
    status: 'Miembro pleno',
    note: 'Entras con cédula; antecedentes judiciales también desde Asunción.',
  },
  {
    id: 'bo',
    country: 'Bolivia',
    flag: '🇧🇴',
    slugPath: 'por-pais/residencia-en-paraguay-para-bolivianos',
    mercosur: true,
    status: 'Miembro pleno',
    note: 'Certificado REJAP y apostilla por el portal de Cancillería.',
  },
  {
    id: 'ec',
    country: 'Ecuador',
    flag: '🇪🇨',
    slugPath: 'por-pais/residencia-en-paraguay-para-ecuatorianos',
    mercosur: true,
    status: 'Estado asociado',
    note: 'Antecedentes penales gratis en línea; economía dolarizada.',
  },
  {
    id: 'cu',
    country: 'Cuba',
    flag: '🇨🇺',
    slugPath: 'por-pais/residencia-en-paraguay-para-cubanos',
    mercosur: false,
    status: 'Fuera de la vía Mercosur',
    note: 'Visa consular y legalización de documentos: Cuba no apostilla.',
  },
];

const MERCOSUR_LINK: ArticleLink = { label: 'Residencia Mercosur', href: '/mercosur' };
const TEMPORARY_LINK: ArticleLink = { label: 'Residencia temporal', href: '/residencia/temporal' };

/** The service page a nationality article should send its reader to, if it is one. */
export function nationalityServiceLink(slugPath: string): ArticleLink | undefined {
  const nationality = NATIONALITIES.find((n) => n.slugPath === slugPath);
  if (!nationality) return undefined;
  return nationality.mercosur ? MERCOSUR_LINK : TEMPORARY_LINK;
}

/** `/guias/por-pais`: the nationality selector (flag, Mercosur badge, link). */
export function NationalityGrid() {
  return (
    <ul className="mt-[var(--space-10)] grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
      {NATIONALITIES.map((n) => (
        <li key={n.id}>
          <Link
            href={contentHref('residenciaes', n.slugPath)}
            className="flex h-full flex-col rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-5)] shadow-[var(--shadow-sm)] transition-colors duration-[var(--duration)] hover:border-[var(--accent)]"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-3xl leading-none">
                {n.flag}
              </span>
              <span className="font-[family-name:var(--display-font)] text-(length:--text-xl) leading-[var(--leading-tight)]">
                {n.country}
              </span>
            </span>
            <span className="mt-[var(--space-3)] flex flex-wrap items-center gap-2 text-(length:--text-xs)">
              <span
                className={
                  n.mercosur
                    ? 'rounded-full bg-[var(--accent)] px-2.5 py-0.5 font-medium text-[var(--accent-fg)]'
                    : 'rounded-full border border-[var(--border)] px-2.5 py-0.5 font-medium text-[var(--fg-muted)]'
                }
              >
                {n.mercosur ? 'Vía Mercosur' : 'Fuera del Mercosur'}
              </span>
              <span className="text-[var(--fg-muted)]">{n.status}</span>
            </span>
            <span className="mt-[var(--space-3)] text-(length:--text-sm) text-[var(--fg-muted)]">{n.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * "¿De dónde eres?" on the homepage: the same list as the selector, as a dense
 * chip grid (flag, country, a Mercosur mark), so the first click already
 * knows the visitor's passport.
 */
export function NationalityPicker() {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {NATIONALITIES.map((n) => (
        <li key={n.id} className="min-w-0">
          <Link
            href={contentHref('residenciaes', n.slugPath)}
            className="group flex min-h-16 items-center gap-3 rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--elev-0)] transition-[border-color,box-shadow] duration-[var(--dur-2)] hover:border-[var(--accent)] hover:shadow-[var(--elev-1)] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span aria-hidden="true" className="text-3xl leading-none">{n.flag}</span>
            <span className="min-w-0">
              <span className="block font-[family-name:var(--display-font)] text-(length:--step-1) leading-tight">{n.country}</span>
              <span className={`block text-(length:--step--2) ${n.mercosur ? 'font-medium text-[var(--accent)]' : 'text-[var(--fg-muted)]'}`}>
                {n.mercosur ? 'Vía Mercosur' : 'Vía general'}
              </span>
            </span>
          </Link>
        </li>
      ))}
      <li className="min-w-0">
        <Link
          href="/route-finder"
          className="flex min-h-16 items-center justify-between gap-3 rounded-[var(--radius-brand)] border border-dashed border-[var(--accent)] px-4 py-3 font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span>¿Otro país? Haz el test de ruta</span>
          <span aria-hidden="true">→</span>
        </Link>
      </li>
    </ul>
  );
}
