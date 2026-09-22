import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { t } from '@/i18n';
import { NotFoundBody } from '@/lib/not-found-body';
import { SiteShell } from '@/lib/site-shell';
import { getSite, HUB_SITE, isSiteKey } from '@/sites/registry';
import './globals.css';

async function requestSite() {
  const value = (await headers()).get('x-site');
  return getSite(isSiteKey(value) ? value : HUB_SITE);
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await requestSite();
  // Next injects robots noindex on every 404 itself; adding it here duplicates the tag.
  return { title: t(site.key, 'notFound.title') };
}

export default async function GlobalNotFound() {
  const site = await requestSite();
  const lang = site.locale === 'pt' ? 'pt-BR' : site.locale;
  return (
    <html lang={lang}>
      <body>
        <SiteShell site={site.key}>
          <NotFoundBody site={site.key} />
        </SiteShell>
      </body>
    </html>
  );
}
