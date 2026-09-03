import { ImageResponse } from 'next/og';
import { getSite, type SiteKey } from '@/sites/registry';
import { t } from '@/i18n';

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = 'image/png';

/** Text-only themed OG card. Colours mirror src/styles/themes/*.css. */
const palette: Record<SiteKey, { bg: string; fg: string; muted: string; accent: string }> = {
  residency: { bg: '#f7f7f4', fg: '#16181c', muted: '#565b63', accent: '#1d6b4f' },
  investorpass: { bg: '#0d0f12', fg: '#f3f1ec', muted: '#a5a49e', accent: '#c9a227' },
  guide: { bg: '#fdf8f1', fg: '#211a12', muted: '#6b5c4b', accent: '#b4471f' },
};

export function ogImage(site: SiteKey) {
  const config = getSite(site);
  const colors = palette[site];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: colors.bg,
          color: colors.fg,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 4, color: colors.accent }}>
          {config.canonicalHost.toUpperCase()}
        </div>
        <div style={{ display: 'flex', fontSize: 68, lineHeight: 1.1, maxWidth: 900 }}>
          {t(site, 'home.h1')}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: colors.muted }}>{config.name}</div>
      </div>
    ),
    ogImageSize,
  );
}
