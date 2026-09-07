import { describe, expect, it } from 'vitest';
import {
  QUESTION_IDS,
  ROUTES,
  optionIds,
  sanitizeAnswers,
  scoreQuiz,
  type Answers,
} from '@/features/quiz/scoring';
import { decodeAnswers, encodeAnswers, ROUTE_DESTINATIONS } from '@/features/quiz/questions';

/**
 * Plan §5.2 exit criterion: "quiz produces the three route outcomes for
 * documented answer sets". The three sets below are the documentation — they
 * are reproduced verbatim in `docs/route-finder.md`.
 */
const TEMPORARY: Answers = {
  nationality: 'other',
  goal: 'relocate',
  timeline: 'year',
  capital: 'under_50k',
  family: 'partner',
  tax: 'no',
};

const PERMANENT: Answers = {
  nationality: 'mercosur',
  goal: 'base',
  timeline: 'asap',
  capital: 'band_50k_150k',
  family: 'family',
  tax: 'yes',
};

const INVESTOR_PASS: Answers = {
  nationality: 'us_ca',
  goal: 'invest',
  timeline: 'asap',
  capital: 'over_150k',
  family: 'alone',
  tax: 'yes',
};

describe('scoreQuiz — the three documented outcomes', () => {
  it('recommends temporary residency for the standard relocation case', () => {
    const result = scoreQuiz(TEMPORARY);
    expect(result.route).toBe('temporary');
    expect(result.scores.temporary).toBeGreaterThan(result.scores.permanent);
    expect(result.scores.temporary).toBeGreaterThan(result.scores['investor-pass']);
  });

  it('recommends permanent residency for the low-presence legal-base case', () => {
    const result = scoreQuiz(PERMANENT);
    expect(result.route).toBe('permanent');
    expect(result.scores.permanent).toBeGreaterThan(result.scores['investor-pass']);
  });

  it('recommends the Investor Pass for capital plus a short timeline', () => {
    const result = scoreQuiz(INVESTOR_PASS);
    expect(result.route).toBe('investor-pass');
    expect(result.scores['investor-pass']).toBeGreaterThan(result.scores.permanent);
  });

  it('reaches every route from some answer set', () => {
    const reached = new Set([
      scoreQuiz(TEMPORARY).route,
      scoreQuiz(PERMANENT).route,
      scoreQuiz(INVESTOR_PASS).route,
    ]);
    expect([...reached].sort()).toEqual([...ROUTES].sort());
  });
});

describe('scoreQuiz — defaults and robustness', () => {
  it('falls back to the lowest-commitment route with no answers', () => {
    const result = scoreQuiz({});
    expect(result.route).toBe('temporary');
    expect(result.empty).toBe(true);
    expect(result.answered).toEqual([]);
  });

  it('is pure: the same answers always score the same', () => {
    expect(scoreQuiz(INVESTOR_PASS)).toEqual(scoreQuiz({ ...INVESTOR_PASS }));
  });

  it('does not mutate the answers it is given', () => {
    const answers = { ...INVESTOR_PASS };
    scoreQuiz(answers);
    expect(answers).toEqual(INVESTOR_PASS);
  });

  it('ignores unknown questions and unknown options', () => {
    const result = scoreQuiz({
      ...TEMPORARY,
      goal: 'become-president',
      favourite_colour: 'green',
    } as unknown as Answers);
    expect(result.answered).not.toContain('goal');
    expect(result.route).toBe('temporary');
  });

  it('never throws on rubbish input', () => {
    for (const input of [null, undefined, 42, 'nope', [], { nationality: 7 }]) {
      expect(() => scoreQuiz(input as unknown as Answers)).not.toThrow();
    }
    expect(sanitizeAnswers(null)).toEqual({});
  });

  it('an unanswered quiz never reaches the Investor Pass by tie-break', () => {
    // Every question left blank scores zero everywhere; the tie must not fall
    // to the highest-commitment route.
    expect(scoreQuiz({}).route).not.toBe('investor-pass');
  });
});

describe('answer encoding', () => {
  it('round-trips through the result URL', () => {
    expect(decodeAnswers(encodeAnswers(PERMANENT))).toEqual(PERMANENT);
  });

  it('survives a mangled parameter', () => {
    expect(() => decodeAnswers('garbage,::,goal:invest')).not.toThrow();
    expect(sanitizeAnswers(decodeAnswers('garbage,::,goal:invest'))).toEqual({ goal: 'invest' });
  });
});

describe('question and route wiring', () => {
  it('every question has at least two options', () => {
    for (const id of QUESTION_IDS) {
      expect(optionIds(id).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('asks between five and seven questions (plan §5.2.3)', () => {
    expect(QUESTION_IDS.length).toBeGreaterThanOrEqual(5);
    expect(QUESTION_IDS.length).toBeLessThanOrEqual(7);
  });

  it('routes the Investor Pass to its own brand and the rest to the hub', () => {
    expect(ROUTE_DESTINATIONS['investor-pass'].site).toBe('investorpass');
    expect(ROUTE_DESTINATIONS.temporary.site).toBe('residency');
    expect(ROUTE_DESTINATIONS.permanent.site).toBe('residency');
  });
});
