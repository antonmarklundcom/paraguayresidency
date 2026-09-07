import { optionIds, QUESTION_IDS, type Answers, type QuestionId, type Route } from './scoring';
import type { SiteKey } from '@/sites/registry';

/**
 * Question/answer *copy* is i18n (plan §5.2.3: "questions in
 * messages/en/common.json"); this module only names the keys and the shape.
 */
export interface QuizOption {
  id: string;
  labelKey: string;
}

export interface QuizQuestion {
  id: QuestionId;
  labelKey: string;
  helpKey: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = QUESTION_IDS.map((id) => ({
  id,
  labelKey: `quiz.${id}.label`,
  helpKey: `quiz.${id}.help`,
  options: optionIds(id).map((option) => ({
    id: option,
    labelKey: `quiz.${id}.option.${option}`,
  })),
}));

/** `nationality:eu,goal:invest` — short enough for a shareable result URL. */
export function encodeAnswers(answers: Answers): string {
  return QUESTION_IDS.filter((q) => answers[q]).map((q) => `${q}:${answers[q]}`).join(',');
}

export function decodeAnswers(encoded: string | null | undefined): Answers {
  if (!encoded) return {};
  const out: Record<string, string> = {};
  for (const pair of encoded.split(',')) {
    const [question, option] = pair.split(':');
    if (question && option) out[question] = option;
  }
  return out as Answers;
}

/**
 * Where a recommended route actually lives. Two of the three routes belong to
 * the hub; the Investor Pass is its own brand, so the result page deep-links
 * across domains (plan §5.2.3) rather than pretending the page exists here.
 */
export interface RouteDestination {
  /** Which brand owns the page for this route. */
  site: SiteKey;
  /** Path on that brand's own host. */
  path: string;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
}

export const ROUTE_DESTINATIONS: Record<Route, RouteDestination> = {
  temporary: {
    site: 'residency',
    path: '/residency/temporary-residency',
    titleKey: 'quiz.result.temporary.title',
    bodyKey: 'quiz.result.temporary.body',
    ctaKey: 'quiz.result.temporary.cta',
  },
  permanent: {
    site: 'residency',
    path: '/residency/permanent-residency',
    titleKey: 'quiz.result.permanent.title',
    bodyKey: 'quiz.result.permanent.body',
    ctaKey: 'quiz.result.permanent.cta',
  },
  'investor-pass': {
    site: 'investorpass',
    path: '/investor-pass/requirements',
    titleKey: 'quiz.result.investor-pass.title',
    bodyKey: 'quiz.result.investor-pass.body',
    ctaKey: 'quiz.result.investor-pass.cta',
  },
};
