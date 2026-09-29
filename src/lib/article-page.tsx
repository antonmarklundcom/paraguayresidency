import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs, Container, FAQ, Heading, NextSteps, Prose, Section, WhatsAppButton } from '@/components';
import { whatsappHref } from '@/lib/whatsapp';
import { Mdx } from '@/content/mdx';
import { getPage } from '@/content';
import { siteMetadata } from '@/lib/metadata';
import { contentHref } from '@/lib/site-pages';
import { t, INTL_LOCALE } from '@/i18n';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';
import { JsonLd } from '@/components/JsonLd';
import { TEAM, personJsonLd } from '@/content/team';
import { arrivalPicture } from '@/lib/arrival-files';
import { articleImage } from '@/lib/article-images';
import { facts, interpolateFacts, localized, type Fact as FactEntry } from '@content/shared/facts';

/** The lead photo of an article: its own, else its hub's. Never blocks the page. */
function ArticleLead({ site, slugPath }: { site: SiteKey; slugPath: string }) {
  let picture: ReturnType<typeof arrivalPicture>;
  try {
    picture = arrivalPicture(articleImage(site, slugPath).id, getSite(site).locale, { maxWidth: 1200 });
  } catch {
    return null;
  }
  const sizes = '(min-width: 1024px) 768px, 100vw';
  return (
      <figure data-article-image className="mt-[var(--space-8)]">
        <picture>
          {picture.avifSrcSet && <source type="image/avif" srcSet={picture.avifSrcSet} sizes={sizes} />}
          <img
            src={picture.src}
            srcSet={picture.srcSet}
            sizes={sizes}
            width={picture.width}
            height={picture.height}
            alt={picture.alt}
            loading="eager"
            fetchPriority="high"
            className="aspect-[16/9] w-full rounded-[var(--radius-brand)] object-cover shadow-[var(--elev-0)]"
          />
        </picture>
      </figure>
  );
}

/** Fact keys an article body renders, in order of first use. */
export function factKeysIn(body: string): string[] {
  const seen = new Set<string>();
  for (const match of body.matchAll(/<Fact\b[^>]*\bk=["']([^"']+)["']/g)) seen.add(match[1]);
  return [...seen].filter((key) => key in facts);
}

function formatDate(iso: string, site: SiteKey): string {
  const locale = INTL_LOCALE[getSite(site).locale];
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** Shared renderer for every brand's MDX article route. */
export function articleMetadata(site: SiteKey, slugPath: string): Metadata {
  const page = getPage(site, slugPath);
  if (!page) return {};
  return siteMetadata(site, {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    path: contentHref(site, slugPath),
    type: 'article',
    publishedTime: page.frontmatter.publishedAt,
    modifiedTime: page.frontmatter.updatedAt,
  });
}

export interface ArticleLink {
  label: string;
  href: string;
}

/**
 * Optional "continue reading" block (plan §6.1 quality bar: every article
 * links to its hub + 2 related + one service page + the Route Finder). Purely
 * additive — a brand that passes nothing renders exactly as before.
 */
export function ArticlePage({
  site,
  slugPath,
  relatedLinks,
  serviceLink,
  routeFinderHref = '/route-finder',
}: {
  site: SiteKey;
  slugPath: string;
  relatedLinks?: ArticleLink[];
  serviceLink?: ArticleLink;
  routeFinderHref?: string;
}) {
  const page = getPage(site, slugPath);
  if (!page) notFound();

  const { frontmatter } = page;
  const locale = getSite(site).locale;
  const updated = frontmatter.updatedAt ?? frontmatter.publishedAt;
  const author = TEAM[frontmatter.author];
  const reviewer = frontmatter.reviewedBy ? TEAM[frontmatter.reviewedBy] : undefined;
  const url = `${siteOrigin(site)}${contentHref(site, slugPath)}`;
  const fill = (text: string) => interpolateFacts(text, locale);
  const summary = frontmatter.summary ? fill(frontmatter.summary) : undefined;
  const takeaways = frontmatter.takeaways.map(fill);
  const faq = frontmatter.faq.map((item) => ({ question: item.question, answer: fill(item.answer) }));
  // Frontmatter tokens count as uses too, so their sources get listed.
  const tokenKeys = [frontmatter.summary ?? '', ...frontmatter.takeaways, ...frontmatter.faq.map((i) => i.answer)]
    .join(' ')
    .matchAll(/\{\{fact:([\w.]+)\}\}/g);
  // Figures with a citation get listed under the article: the named source
  // and the date it was checked are what an answer engine quotes back.
  const cited = [...new Set([...factKeysIn(page.body), ...[...tokenKeys].map((m) => m[1]).filter((k) => k in facts)])]
    .map((key) => facts[key as keyof typeof facts] as FactEntry)
    .filter((fact) => fact.sourced);

  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs
          site={site}
          items={[{ label: frontmatter.title, href: contentHref(site, slugPath) }]}
        />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>{frontmatter.title}</Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            {frontmatter.description}
          </p>
          <p className="mt-[var(--space-5)] flex flex-wrap gap-x-3 gap-y-1 text-(length:--text-sm) text-[var(--fg-muted)]">
            <span>{t(site, 'article.writtenBy', { name: author.name })}</span>
            {reviewer && reviewer.key !== author.key && (
              <>
                <span aria-hidden="true">·</span>
                <span>{t(site, 'article.reviewedBy', { name: reviewer.name })}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={updated}>{t(site, 'article.updated', { date: formatDate(updated, site) })}</time>
          </p>
        </header>
        <ArticleLead site={site} slugPath={slugPath} />
        {summary && (
          <section
            aria-labelledby="short-answer"
            className="mt-[var(--space-10)] rounded-[var(--radius-lg)] border-l-4 border-[var(--accent)] bg-[var(--surface-alt)] p-[var(--space-6)]"
          >
            <h2 id="short-answer" className="text-(length:--text-xs) font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">
              {t(site, 'article.shortAnswer')}
            </h2>
            <p className="mt-[var(--space-2)] text-(length:--text-lg) leading-[var(--leading-body)]">{summary}</p>
          </section>
        )}
        <Prose className="mt-[var(--space-12)]">
          <Mdx source={page.body} site={site} />
        </Prose>
        {takeaways.length > 0 && (
          <section aria-labelledby="key-takeaways" className="mt-[var(--space-12)] rounded-[var(--radius-lg)] border border-[var(--border)] p-[var(--space-6)]">
            <h2 id="key-takeaways" className="font-[family-name:var(--display-font)] text-(length:--text-xl)">
              {t(site, 'article.keyTakeaways')}
            </h2>
            <ul className="mt-[var(--space-4)] list-disc space-y-[var(--space-2)] pl-6">
              {takeaways.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}
        {cited.length > 0 && (
          <section aria-labelledby="sources" className="mt-[var(--space-10)] text-(length:--text-sm) text-[var(--fg-muted)]">
            <h2 id="sources" className="font-semibold text-[var(--fg)]">{t(site, 'article.sourcesTitle')}</h2>
            <ul className="mt-[var(--space-2)] space-y-[var(--space-1)]">
              {cited.map((fact) => (
                <li key={fact.key}>
                  {localized(fact.title ?? fact.label, locale)}: {localized(fact.display, locale)} —{' '}
                  {fact.sourced!.url ? (
                    <a href={fact.sourced!.url} rel="noopener nofollow" className="underline underline-offset-2">
                      {localized(fact.sourced!.label, locale)}
                    </a>
                  ) : (
                    localized(fact.sourced!.label, locale)
                  )}
                  , {t(site, 'article.sourceChecked', { date: formatDate(fact.sourced!.checkedOn, site) })}
                </li>
              ))}
            </ul>
          </section>
        )}
        {faq.length > 0 && (
          <div className="mt-[var(--space-16)]">
            <FAQ title={t(site, 'common.faqTitle')} items={faq} />
          </div>
        )}
        <NextSteps site={site} path={slugPath} />
        {/* Every article ends on the two contact paths: WhatsApp or the form. */}
        <aside className="mt-[var(--space-16)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-6)] sm:p-[var(--space-8)]">
          <h2 className="font-[family-name:var(--display-font)] text-(length:--text-xl)">{t(site, 'article.ctaTitle')}</h2>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{t(site, 'article.ctaBody')}</p>
          <div className="mt-[var(--space-5)] flex flex-wrap items-center gap-x-4 gap-y-3">
            {whatsappHref(t(site, 'whatsapp.prefill')) ? (
              <>
                <WhatsAppButton site={site} placement="article" />
                <Link href="/contact" className="text-(length:--text-sm) text-[var(--accent)] underline underline-offset-4">
                  {t(site, 'article.orForm')}
                </Link>
              </>
            ) : (
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-(length:--text-sm) font-medium text-[var(--accent-fg)] hover:opacity-90"
              >
                {t(site, 'contact.cta')}
              </Link>
            )}
          </div>
        </aside>
        {(relatedLinks?.length || serviceLink) && (
          <nav
            aria-label="Continue reading"
            className="mt-[var(--space-16)] grid gap-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-8)] sm:grid-cols-2"
          >
            {relatedLinks?.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-5)] transition-colors duration-[var(--duration)] hover:border-[var(--accent)]"
              >
                <span className="text-(length:--text-xs) tracking-[0.14em] text-[var(--fg-muted)] uppercase">
                  {t(site, 'common.readMore')}
                </span>
                <span className="mt-[var(--space-1)] block font-[family-name:var(--display-font)]">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        )}
        {(serviceLink || routeFinderHref) && (
          <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
            {serviceLink && (
              <Link
                href={serviceLink.href}
                className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-(length:--text-sm) font-medium text-[var(--accent-fg)] hover:opacity-90"
              >
                {serviceLink.label}
              </Link>
            )}
            {routeFinderHref && (
              <Link
                href={routeFinderHref}
                className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] border border-[var(--border)] px-5 py-3 text-(length:--text-sm) font-medium hover:border-[var(--accent)]"
              >
                {t(site, 'nav.routeFinder')}
              </Link>
            )}
          </div>
        )}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: frontmatter.title,
            description: frontmatter.description,
            ...(summary ? { abstract: summary } : {}),
            datePublished: frontmatter.publishedAt,
            dateModified: updated,
            inLanguage: locale,
            mainEntityOfPage: url,
            url,
            author: personJsonLd(author.key, locale),
            ...(reviewer ? { reviewedBy: personJsonLd(reviewer.key, locale) } : {}),
            publisher: { '@type': 'Organization', name: getSite(site).name, url: siteOrigin(site) },
            image: `${siteOrigin(site)}/opengraph-image`,
            ...(cited.length
              ? { citation: cited.map((fact) => fact.sourced!.url ?? localized(fact.sourced!.label, locale)) }
              : {}),
          }}
        />
      </Container>
    </Section>
  );
}
