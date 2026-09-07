import Link from 'next/link';
import { Button, Container, Fact, Heading, Section } from '@/components';
import { LeadForm } from '@/components/LeadForm';
import { t } from '@/i18n';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';
import type { FactKey } from '@content/shared/facts';
import { decodeAnswers, encodeAnswers, ROUTE_DESTINATIONS } from './questions';
import { isRoute, sanitizeAnswers, scoreQuiz, type Route } from './scoring';

/**
 * `/route-finder/result?r=…&a=…` on any of the three brands (plan §5.2.3).
 *
 * The `r` parameter is a convenience for sharing the link; it is never
 * trusted. The answers in `a` are re-scored server-side, so a hand-edited URL
 * cannot make the page recommend something the answers do not support.
 */

/** Facts worth showing next to each recommendation — all hedged until verified. */
const ROUTE_FACTS: Record<Route, FactKey[]> = {
  temporary: ['temporary.duration', 'cedula.timeline'],
  permanent: ['permanent.presence_rule', 'cedula.timeline'],
  'investor-pass': [
    'investorpass.min_investment_usd',
    'investorpass.validity_years',
    'investorpass.launch_date',
  ],
};

export function resolveResult(params: { r?: string; a?: string }): {
  route: Route;
  answers: Record<string, string>;
  encoded: string;
  empty: boolean;
} {
  const answers = sanitizeAnswers(decodeAnswers(params.a));
  const scored = scoreQuiz(answers);
  // With no usable answers the shared link is all we have; fall back to the
  // `r` parameter only then, and only when it names a real route.
  const route = scored.empty && isRoute(params.r) ? (params.r as Route) : scored.route;
  return {
    route,
    answers: answers as Record<string, string>,
    encoded: encodeAnswers(answers),
    empty: scored.empty,
  };
}

export function QuizResultView({
  site,
  route,
  encoded,
  empty,
}: {
  site: SiteKey;
  route: Route;
  encoded: string;
  empty: boolean;
}) {
  const destination = ROUTE_DESTINATIONS[route];
  const ownsRoute = destination.site === site;
  const href = ownsRoute
    ? destination.path
    : `${siteOrigin(destination.site)}${destination.path}`;
  const destinationSite = getSite(destination.site);

  return (
    <>
      <Section>
        <Container width="narrow">
          <p className="text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
            {t(site, 'quiz.result.eyebrow')}
          </p>
          <Heading level={1} className="mt-[var(--space-4)]">
            {t(site, destination.titleKey)}
          </Heading>
          <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-[var(--fg-muted)]">
            {t(site, destination.bodyKey)}
          </p>

          <ul className="mt-[var(--space-6)] grid gap-[var(--space-2)] text-[var(--text-sm)] text-[var(--fg-muted)]">
            {ROUTE_FACTS[route].map((key) => (
              <li key={key}>
                <Fact k={key} site={site} />
              </li>
            ))}
          </ul>

          <div className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-4)]">
            <Button href={href} external={!ownsRoute}>
              {t(site, destination.ctaKey)}
            </Button>
            <Link
              href="/route-finder"
              className="text-[var(--text-sm)] underline underline-offset-4"
            >
              {t(site, 'quiz.result.retake')}
            </Link>
          </div>

          {!ownsRoute ? (
            <p className="mt-[var(--space-4)] text-[var(--text-xs)] text-[var(--fg-muted)]">
              {t(site, 'quiz.result.sibling', { brand: destinationSite.name })}
            </p>
          ) : null}

          {empty ? (
            <p className="mt-[var(--space-4)] text-[var(--text-xs)] text-[var(--fg-muted)]">
              {t(site, 'quiz.result.noAnswers')}
            </p>
          ) : null}
        </Container>
      </Section>

      <Section tone="alt" width="default">
        <Container width="narrow" className="px-0 sm:px-0">
          <Heading level={2}>{t(site, 'quiz.result.formTitle')}</Heading>
          <p className="mt-[var(--space-3)] text-[var(--fg-muted)]">
            {t(site, 'quiz.result.formBody')}
          </p>
          <div className="mt-[var(--space-8)]">
            <LeadForm
              site={site}
              variant="quiz"
              pagePath="/route-finder/result"
              quizResult={route}
              quizAnswers={encoded}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
