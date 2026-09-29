import { notFound } from 'next/navigation';
import {
  AfterYouMessage,
  ArticleCards,
  BookMockup,
  Button,
  ForWhom,
  Guarantee,
  MobileWhatsAppBar,
  OfficeStrip,
  PhotoHero,
  PriceTable,
  SamplePages,
  ServiceUpsell,
  TeamSection,
  Testimonials,
  CaseSnapshots,
  CompareTable,
  TocPreview,
  TrustBar,
  WhatsAppButton,
  heroTrust,
  type HeroLayout,
} from '@/components';
import { getPages } from '@/content';
import { t } from '@/i18n';
import { contentHref } from '@/lib/site-pages';
import { getSite, isSiteKey, SITE_KEYS, type SiteKey } from '@/sites/registry';
import { PROOF_FIXTURE } from './fixture';

export const dynamic = 'force-dynamic';

/**
 * Dev-only showcase of the overhaul components (plan §2) on every brand theme,
 * with FIXTURE proof data. `/dev/*` is blocked by the proxy in production
 * (src/sites/resolve.ts) and this page 404s there too. `?site=<key>` shows one
 * brand (and its mobile bar); no parameter shows all seven.
 */
export default async function ComponentsDemo({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { site } = await searchParams;
  const one = isSiteKey(site) ? site : undefined;
  return (
    <div>
      {(one ? [one] : SITE_KEYS).map((key) => (
        <Demo key={key} site={key} withBar={Boolean(one)} />
      ))}
    </div>
  );
}

const HERO: Record<SiteKey, { image: string; layout: HeroLayout; focus?: string }> = {
  residency: { image: 'investorpass-hero-asuncion-river-dusk', layout: 'split', focus: '30% center' },
  investorpass: { image: 'investorpass-hero-asuncion-river-dusk', layout: 'editorial-dark' },
  guide: { image: 'guide-hero-reading-terrace-asuncion', layout: 'overlay' },
  frontier: { image: 'frontier-hero-red-earth-road', layout: 'overlay' },
  residenciaes: { image: 'guide-hero-reading-terrace-asuncion', layout: 'split', focus: '15% center' },
  residenciapt: { image: 'frontier-hero-red-earth-road', layout: 'overlay' },
  flytta: { image: 'guide-hero-reading-terrace-asuncion', layout: 'overlay', focus: '15% center' },
};

function DevBanner({ site }: { site: SiteKey }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#101418] px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-[#e9edf1]">
      <strong className="text-[#ffd479]">FIXTURE DATA · DEV ONLY · NOT REAL</strong>
      <span>theme: {site}</span>
      <nav aria-label="Brands" className="flex flex-wrap gap-3">
        {SITE_KEYS.map((key) => (
          <a key={key} href={`/dev/components?site=${key}`} className={key === site ? 'underline' : 'opacity-70 hover:opacity-100'}>
            {key}
          </a>
        ))}
      </nav>
    </div>
  );
}

function Demo({ site, withBar }: { site: SiteKey; withBar: boolean }) {
  const config = getSite(site);
  const hero = HERO[site];
  const locale = config.locale;
  const articles = getPages(site)
    .filter((page) => !page.frontmatter.draft)
    .slice(0, 3)
    .map((page) => ({ title: page.frontmatter.title, description: page.frontmatter.description, href: contentHref(site, page.slugPath), hub: page.hub }));
  const isGuide = site === 'guide';

  return (
    <div data-site={site} data-theme={site} lang={locale} className="border-b-8 border-black">
      <DevBanner site={site} />
      {isGuide ? (
        <section className="bg-[var(--bg)]">
          <div className="mx-auto grid w-full max-w-[var(--container)] items-center gap-14 px-[var(--space-gutter)] py-[var(--space-section)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <h1 className="font-[family-name:var(--display-font)] text-(length:--step-6) leading-[1.02] text-balance">{t(site, 'home.h1')}</h1>
              <p className="mt-7 max-w-xl text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">{t(site, 'home.sub')}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="#price" className="min-h-12 px-7">{t(site, 'home.ctaPrimary')}</Button>
                <Button href="#inside" variant="secondary" className="min-h-12 px-7">{t(site, 'home.ctaSecondary')}</Button>
              </div>
            </div>
            <BookMockup site={site} />
          </div>
        </section>
      ) : (
        <PhotoHero
          image={hero.image}
          layout={hero.layout}
          focus={hero.focus}
          locale={locale}
          eyebrow={config.name}
          title={t(site, 'home.h1')}
          sub={t(site, 'home.sub')}
          trust={hero.layout === 'editorial-dark' ? undefined : heroTrust(site)}
          actions={
            <>
              <Button href={config.cta.href}>{t(site, config.cta.labelKey)}</Button>
              <WhatsAppButton site={site} variant={hero.layout === 'split' ? 'secondary' : 'onDark'} placement="hero" />
            </>
          }
        />
      )}
      <TrustBar site={site} proof={PROOF_FIXTURE} />
      {isGuide ? (
        <>
          <TocPreview site={site} />
          <SamplePages site={site} />
          <ForWhom site={site} />
          <Guarantee site={site} proof={PROOF_FIXTURE} tone="alt" />
          <Testimonials site={site} proof={PROOF_FIXTURE} />
          <TeamSection site={site} proof={PROOF_FIXTURE} tone="alt" />
          <ServiceUpsell site={site} />
        </>
      ) : (
        <>
          <PriceTable site={site} />
          <CompareTable site={site} tone="alt" />
          <AfterYouMessage site={site} tone="alt" />
          <Testimonials site={site} proof={PROOF_FIXTURE} />
          <CaseSnapshots site={site} proof={PROOF_FIXTURE} tone="alt" />
          <TeamSection site={site} proof={PROOF_FIXTURE} />
          <Guarantee site={site} proof={PROOF_FIXTURE} tone="alt" />
          <OfficeStrip site={site} proof={PROOF_FIXTURE} tone="alt" />
        </>
      )}
      <ArticleCards site={site} title={t(site, 'nav.guides')} articles={articles} />
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-[var(--space-gutter)] py-10 text-(length:--step--1) text-[var(--fg-muted)]">
        Footer stand-in: the mobile bar reserves its height below this line.
      </footer>
      {withBar && <MobileWhatsAppBar site={site} />}
    </div>
  );
}
