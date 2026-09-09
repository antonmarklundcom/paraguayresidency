import Link from 'next/link';
import { Button, Container, EditorialHero, Heading, Section, SplitHero, Fact, Card, Bento } from '@/components';
import { t } from '@/i18n';
import { getPages } from '@/content';
import { getSite, type SiteKey } from '@/sites/registry';

/**
 * Placeholder homes for the foundation phase. S3–S5 replace these entirely —
 * they exist so the three hosts render distinct themed pages and so the
 * content pipeline and <Fact> are exercised end to end.
 */
export function PlaceholderHome({ site }: { site: SiteKey }) {
  const config = getSite(site);
  const pages = getPages(site).slice(0, 3);

  const actions = (
    <>
      <Button href="/route-finder">{t(site, 'home.ctaPrimary')}</Button>
      <Button href="/contact" variant="secondary">
        {t(site, 'home.ctaSecondary')}
      </Button>
    </>
  );

  const hero =
    site === 'investorpass' ? (
      <EditorialHero
        eyebrow={config.name}
        title={t(site, 'home.h1')}
        sub={t(site, 'home.sub')}
        actions={actions}
      />
    ) : (
      <SplitHero
        eyebrow={config.name}
        title={t(site, 'home.h1')}
        sub={t(site, 'home.sub')}
        actions={actions}
        aside={
          <div className="text-[var(--fg-muted)]">
            <p className="text-[var(--text-xs)] tracking-[0.16em] uppercase">
              {t(site, 'placeholder.factsHeading')}
            </p>
            <p className="mt-[var(--space-3)]">
              {t(site, 'facts.label.minInvestment')}:{' '}
              <Fact k="investorpass.min_investment_usd" site={site} />.
            </p>
            <p className="mt-[var(--space-3)]">
              {t(site, 'facts.label.temporaryDuration')}:{' '}
              <Fact k="temporary.duration" site={site} />.
            </p>
          </div>
        }
      />
    );

  return (
    <>
      {hero}
      <Section tone="alt">
        <Heading level={2}>{t(site, 'placeholder.notice')}</Heading>
        <div className="mt-[var(--space-8)]">
          <Bento>
            {pages.map((page) => (
              <Card
                key={page.slugPath}
                eyebrow={page.hub}
                title={page.frontmatter.title}
                href={contentHref(site, page.slugPath)}
              >
                {page.frontmatter.description}
              </Card>
            ))}
            {pages.length === 0 && <Card title={t(site, 'placeholder.noArticles')} />}
          </Bento>
        </div>
      </Section>
      <Section>
        <Container width="narrow">
          <p className="text-[var(--fg-muted)]">
            {t(site, 'facts.label.presenceRule')}:{' '}
            <Fact k="permanent.presence_rule" site={site} />.{' '}
            <Link href="/contact" className="text-[var(--accent)] underline underline-offset-2">
              {t(site, 'nav.contact')}
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}

/** Public URL for a content page, per brand (plan §6). */
export function contentHref(site: SiteKey, slugPath: string): string {
  switch (site) {
    case 'residency':
      return `/guides/${slugPath}`;
    case 'investorpass':
      return `/insights/${slugPath.split('/').slice(1).join('/')}`;
    case 'guide':
      return `/blog/${slugPath.split('/').slice(1).join('/')}`;
    // The four consolidated brands keep the hub's `<hub>/<slug>` shape under a
    // locale-appropriate prefix; S10–S13 own the pages behind these paths.
    // `frontier` is the exception: plan §6.5 gives it one flat hub
    // (`/stories/[slug]`, no hub segment in the URL — same shape as
    // investorpass's `/insights` and guide's `/blog`).
    case 'frontier':
      return `/stories/${slugPath.split('/').slice(1).join('/')}`;
    case 'residenciaes':
      return `/guias/${slugPath}`;
    case 'residenciapt':
      return `/guias/${slugPath}`;
    // flytta has exactly two hubs (`guider`, `stader`), each its own top-level
    // route (plan §6.8), so the hub segment already is the route prefix.
    case 'flytta':
      return `/${slugPath}`;
  }
}
