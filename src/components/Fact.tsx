import { factKeys, facts, type FactKey } from '@content/shared/facts';

/**
 * The ONLY way a legal or financial figure reaches a page (plan §1.10).
 * While a fact is unverified it renders hedged wording, marked up so the
 * launch review (F7) can find every one of them.
 */
export function Fact({ k, className = '' }: { k: FactKey; className?: string }) {
  const fact = facts[k];
  if (!fact) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `Unknown fact key "${k}". Known keys: ${factKeys.join(', ')}. Add it to content/shared/facts.ts.`,
      );
    }
    return null;
  }
  return (
    <span
      data-fact={fact.key}
      data-verified={fact.verified ? 'true' : 'false'}
      title={fact.verified ? undefined : 'Not yet verified by our legal partner.'}
      className={className}
    >
      {fact.verified ? fact.display : fact.hedged}
    </span>
  );
}
