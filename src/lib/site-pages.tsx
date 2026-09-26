import Link from 'next/link';
import { contentHref } from './content-href';
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
            <p className="text-(length:--text-xs) tracking-[0.16em] uppercase">
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

export { contentHref };
