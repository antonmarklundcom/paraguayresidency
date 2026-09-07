import { t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';
import { QUESTIONS } from './questions';
import { QuizForm, type QuizCopy } from './QuizForm';

/**
 * Server half of the Route Finder: it resolves every string through i18n so
 * the client bundle carries no message tables, and so the same quiz renders on
 * all three brands with each brand's own theme (plan §3 — "the strongest
 * cross-brand link").
 */
export function Quiz({ site }: { site: SiteKey }) {
  const copy: QuizCopy = {
    questions: QUESTIONS.map((question) => ({
      id: question.id,
      label: t(site, question.labelKey),
      help: t(site, question.helpKey),
      options: question.options.map((option) => ({
        id: option.id,
        label: t(site, option.labelKey),
      })),
    })),
    back: t(site, 'quiz.back'),
    next: t(site, 'quiz.next'),
    see: t(site, 'quiz.see'),
    progress: t(site, 'quiz.progress'),
  };
  return <QuizForm copy={copy} />;
}
