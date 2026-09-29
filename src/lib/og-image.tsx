import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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
  frontier: { bg: '#f8f5f2', fg: '#261c17', muted: '#6b5a50', accent: '#9c4221' },
  residenciaes: { bg: '#fdfaf5', fg: '#241c12', muted: '#6d5f4d', accent: '#c1121f' },
  residenciapt: { bg: '#f5faf7', fg: '#10241b', muted: '#4e6a5c', accent: '#006b3c' },
  flytta: { bg: '#f7f8fa', fg: '#131a24', muted: '#55606f', accent: '#0b4f8a' },
};

/** Each brand's own hero photo (public/images/arrival/<id>-1200.webp). */
const HERO: Record<SiteKey, string> = {
  residency: 'residency-hero-asuncion-colonnade',
  investorpass: 'investorpass-hero-business-district-blue-hour',
  guide: 'guide-hero-reading-desk-asuncion',
  frontier: 'frontier-hero-red-earth-ranch-gate',
  residenciaes: 'residenciaes-hero-cafe-arcade-plaza',
  residenciapt: 'residenciapt-hero-family-veranda-terere',
  flytta: 'flytta-hero-veranda-moving-boxes',
};

/**
 * The hero as a 1200x630 JPEG data URI (Satori cannot read WebP). Any failure
 * (no file, no sharp) returns undefined and the card stays text-only.
 */
async function heroDataUri(site: SiteKey): Promise<string | undefined> {
  try {
    const file = join(process.cwd(), 'public/images/arrival', `${HERO[site]}-1200.webp`);
    const { default: sharp } = await import('sharp');
    // One libvips thread: every thread counts against the Hostinger account's
    // 200 "Max Processes" cap (see next.config.ts).
    sharp.concurrency(1);
    const jpeg = await sharp(await readFile(file)).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function ogImage(site: SiteKey) {
  const config = getSite(site);
  const colors = palette[site];
  const photo = await heroDataUri(site);

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
          color: photo ? '#ffffff' : colors.fg,
          padding: 72,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {photo && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img tags. */}
            <img src={photo} width={1200} height={630} alt="" style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630 }} />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1200,
                height: 630,
                display: 'flex',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%)',
              }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 630, display: 'flex', background: colors.accent }} />
          </>
        )}
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 4, color: photo ? '#ffffff' : colors.accent }}>
          {config.canonicalHost.toUpperCase()}
        </div>
        <div style={{ display: 'flex', fontSize: 68, lineHeight: 1.1, maxWidth: 900 }}>
          {t(site, 'home.h1')}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: photo ? 'rgba(255,255,255,0.85)' : colors.muted }}>{config.name}</div>
      </div>
    ),
    ogImageSize,
  );
}
