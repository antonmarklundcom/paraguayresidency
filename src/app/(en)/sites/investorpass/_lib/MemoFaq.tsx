import type { ReactNode } from 'react';
import { JsonLd } from '@/components';

export interface MemoFaqItem {
  question: string;
  /** Plain text: this is also the FAQPage structured-data answer. */
  answer: string;
  /** Optional links shown under the answer (not in the structured data). */
  after?: ReactNode;
}

/** Native <details> accordion (no JS), with the FAQPage JSON-LD built from the same items. */
export function MemoFaq({ items }: { items: MemoFaqItem[] }) {
  return (
    <div className="ipm-faq">
      {items.map((item, index) => (
        <details key={item.question}>
          <summary>
            <span>
              <span className="ipm-n">{String(index + 1).padStart(2, '0')}</span>
              {item.question}
            </span>
          </summary>
          <div className="ipm-ans">
            <p>{item.answer}</p>
            {item.after}
          </div>
        </details>
      ))}
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
