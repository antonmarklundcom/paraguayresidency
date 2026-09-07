/**
 * Route Finder scoring (plan §5.2.3).
 *
 * A pure function with no imports, no i18n and no DB, so it can be unit-tested
 * on its own and so a Sonnet phase can never change an outcome by editing a
 * page. Question copy lives in `src/i18n/messages/en/common.json`; only the
 * ids and the weights live here.
 *
 * Nothing in this file is a legal claim. The weights express *fit* — which
 * route is worth talking about first — and the result page hedges every figure
 * through `<Fact>` (plan §1.10).
 */

export const ROUTES = ['temporary', 'permanent', 'investor-pass'] as const;
export type Route = (typeof ROUTES)[number];

/**
 * Tie-break order, lowest-commitment first: with no answers, or on a tie, the
 * standard first step wins. The Investor Pass must be earned outright.
 */
const TIE_BREAK: readonly Route[] = ['temporary', 'permanent', 'investor-pass'];

export const QUESTION_IDS = [
  'nationality',
  'goal',
  'timeline',
  'capital',
  'family',
  'tax',
] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

type Weights = Partial<Record<Route, number>>;

/**
 * `WEIGHTS[question][option]` — points added to each route. An option that
 * discriminates nothing carries an empty object rather than being omitted, so
 * the option list here stays the single source of what is answerable.
 */
export const WEIGHTS: Record<QuestionId, Record<string, Weights>> = {
  // Where the applicant's passport is from. Only used as a mild nudge: the
  // paperwork differs by nationality, the route itself mostly does not.
  nationality: {
    mercosur: { permanent: 1 },
    eu: {},
    us_ca: {},
    other: {},
  },
  // What they actually want out of it. The strongest signal by design.
  goal: {
    relocate: { temporary: 2, permanent: 1 },
    base: { permanent: 3 },
    invest: { 'investor-pass': 4 },
  },
  timeline: {
    asap: { 'investor-pass': 2, permanent: 1 },
    year: { temporary: 2 },
    exploring: { temporary: 1 },
  },
  // Capital available for a qualifying investment. Bands, never thresholds —
  // the actual figures are unverified (`facts.ts`) and are never quoted here.
  capital: {
    under_50k: { temporary: 2 },
    band_50k_150k: { permanent: 1, 'investor-pass': 1 },
    over_150k: { 'investor-pass': 3 },
  },
  family: {
    alone: {},
    partner: { temporary: 1 },
    family: { temporary: 1, permanent: 1 },
  },
  tax: {
    yes: { permanent: 2 },
    no: {},
    unsure: { temporary: 1 },
  },
};

export type Answers = Partial<Record<QuestionId, string>>;
export type Scores = Record<Route, number>;

export interface QuizResult {
  route: Route;
  scores: Scores;
  /** Ids of the questions that carried a recognised answer. */
  answered: QuestionId[];
  /** True when nothing scored — the caller should send the visitor back. */
  empty: boolean;
}

export function isQuestionId(value: unknown): value is QuestionId {
  return typeof value === 'string' && (QUESTION_IDS as readonly string[]).includes(value);
}

export function isRoute(value: unknown): value is Route {
  return typeof value === 'string' && (ROUTES as readonly string[]).includes(value);
}

export function optionIds(question: QuestionId): string[] {
  return Object.keys(WEIGHTS[question]);
}

/** Drops unknown questions and unknown options instead of throwing. */
export function sanitizeAnswers(input: unknown): Answers {
  const out: Answers = {};
  if (!input || typeof input !== 'object') return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!isQuestionId(key)) continue;
    if (typeof value !== 'string') continue;
    if (!(value in WEIGHTS[key])) continue;
    out[key] = value;
  }
  return out;
}

export function scoreQuiz(input: Answers): QuizResult {
  const answers = sanitizeAnswers(input);
  const scores: Scores = { temporary: 0, permanent: 0, 'investor-pass': 0 };
  const answered: QuestionId[] = [];

  for (const question of QUESTION_IDS) {
    const option = answers[question];
    if (!option) continue;
    answered.push(question);
    for (const [route, points] of Object.entries(WEIGHTS[question][option]) as [Route, number][]) {
      scores[route] += points;
    }
  }

  let route: Route = TIE_BREAK[0];
  for (const candidate of TIE_BREAK) {
    if (scores[candidate] > scores[route]) route = candidate;
  }

  return { route, scores, answered, empty: answered.length === 0 };
}
