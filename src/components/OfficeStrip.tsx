/* eslint-disable @next/next/no-img-element -- Local office photos with fixed dimensions. */
import { PROOF, type Proof } from '@content/shared/proof';
import { localeFor, t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';
import { Band, SectionHeader } from './SectionKit';

/**
 * Real photos of the office and the team at work in Asunción, the address
 * and a map link, from `proof.office` (overhaul plan §2). Hidden until there
 * is at least one photo or an address: never a generated "office".
 */
export function OfficeStrip({ site, proof = PROOF, tone = 'default' }: { site: SiteKey; proof?: Proof; tone?: 'default' | 'alt' }) {
  const { address, mapsUrl, photos } = proof.office;
  if (photos.length === 0 && !address) return null;
  const locale = localeFor(site);
  const shown = photos.slice(0, 3);

  return (
    <Band tone={tone} labelledBy="office-title" data-office-strip>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-end lg:gap-16">
        <div>
          <SectionHeader id="office-title" eyebrow={t(site, 'team.place')} title={t(site, 'office.title')} />
          {address && (
            <address className="mt-8 border-t border-[var(--border)] pt-6 not-italic leading-relaxed text-[var(--fg)]">
              {address.split('\n').map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </address>
          )}
          {mapsUrl && (
            <a href={mapsUrl} rel="noopener" target="_blank" className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline-offset-4 hover:underline">
              {t(site, 'office.map')} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        {shown.length > 0 && (
          <ul className={`grid gap-3 sm:gap-4 ${shown.length === 1 ? '' : 'grid-cols-2'} ${shown.length === 3 ? 'md:grid-cols-[2fr_1fr] md:grid-rows-2' : ''}`}>
            {shown.map((photo, index) => (
              <li
                key={photo.src}
                className={`relative overflow-hidden rounded-[var(--radius-brand)] bg-[var(--surface-alt)] ${
                  shown.length === 3 && index === 0 ? 'col-span-2 aspect-[16/10] md:col-span-1 md:row-span-2 md:aspect-auto' : 'aspect-[4/3]'
                }`}
              >
                <img
                  src={photo.src}
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt[locale]}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Band>
  );
}
