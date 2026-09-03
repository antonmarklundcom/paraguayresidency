import { JsonLd } from './JsonLd';
import { Heading } from './primitives';

export interface FaqItem {
  question: string;
  answer: string;
}

/** Renders the questions and the matching FAQPage JSON-LD from one source. */
export function FAQ({ items, title }: { items: FaqItem[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div>
      {title && <Heading level={2}>{title}</Heading>}
      <dl className="mt-[var(--space-8)] divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {items.map((item) => (
          <div key={item.question} className="py-[var(--space-6)]">
            <dt className="font-[family-name:var(--display-font)] text-[var(--text-lg)]">
              {item.question}
            </dt>
            <dd className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </div>
  );
}
