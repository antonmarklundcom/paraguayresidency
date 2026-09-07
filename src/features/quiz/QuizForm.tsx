'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { encodeAnswers } from './questions';
import { scoreQuiz, type Answers, type QuestionId } from './scoring';

export interface QuizCopy {
  questions: {
    id: QuestionId;
    label: string;
    help: string;
    options: { id: string; label: string }[];
  }[];
  back: string;
  next: string;
  see: string;
  progress: string;
}

/**
 * One question at a time, no external state library. The scoring itself is
 * the same pure function the server uses, so the recommendation the visitor
 * sees on submit is by construction the one the result page renders.
 */
export function QuizForm({ copy }: { copy: QuizCopy }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const question = copy.questions[step];
  const total = copy.questions.length;
  const isLast = step === total - 1;
  const chosen = question ? answers[question.id] : undefined;

  const result = useMemo(() => scoreQuiz(answers), [answers]);

  function choose(option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  function advance() {
    if (!chosen) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    const params = new URLSearchParams({ r: result.route, a: encodeAnswers(answers) });
    router.push(`/route-finder/result?${params.toString()}`);
  }

  if (!question) return null;

  return (
    <div className="max-w-[var(--container-narrow)]">
      <p className="text-[var(--text-xs)] tracking-[0.14em] text-[var(--fg-muted)] uppercase">
        {copy.progress.replace('{step}', String(step + 1)).replace('{total}', String(total))}
      </p>

      <fieldset className="mt-[var(--space-6)] border-0 p-0">
        <legend className="font-[family-name:var(--display-font)] text-[var(--text-2xl)] leading-[var(--leading-tight)]">
          {question.label}
        </legend>
        <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{question.help}</p>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-3)]">
          {question.options.map((option) => {
            const selected = chosen === option.id;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-brand)] border px-4 py-3 text-[var(--text-sm)] transition-colors ${
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={selected}
                  onChange={() => choose(option.id)}
                  className="accent-[var(--accent)]"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-[var(--space-8)] flex items-center gap-[var(--space-3)]">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-[var(--text-sm)] underline underline-offset-4"
          >
            {copy.back}
          </button>
        ) : null}
        <button
          type="button"
          onClick={advance}
          disabled={!chosen}
          className="ml-auto rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isLast ? copy.see : copy.next}
        </button>
      </div>
    </div>
  );
}
