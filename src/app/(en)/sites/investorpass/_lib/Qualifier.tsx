import { Quiz } from '@/features/quiz/Quiz';
import { QUESTIONS } from '@/features/quiz/questions';

/**
 * The hero's qualifier: the real Route Finder quiz (one question at a time,
 * scored by src/features/quiz/scoring.ts, result on /route-finder/result),
 * restyled with CSS only under `.ipm-quiz`. The title counts the questions
 * from the quiz itself, so it cannot drift from what the visitor answers.
 */
export function Qualifier() {
  return (
    <div className="ipm-qcard">
      <div className="ipm-qcard-head">
        <span>Qualify in {QUESTIONS.length} questions</span>
      </div>
      <div className="ipm-quiz">
        <Quiz site="investorpass" />
      </div>
      <p className="ipm-qcard-foot" style={{ margin: 0 }}>
        Your answers point at a route to look at first. Thresholds are quoted in writing, with the source and date of the rule.
      </p>
    </div>
  );
}
