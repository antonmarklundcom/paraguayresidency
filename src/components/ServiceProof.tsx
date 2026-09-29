import type { SiteKey } from '@/sites/registry';
import { CaseSnapshots } from './CaseSnapshots';
import { Guarantee } from './Guarantee';
import { Testimonials } from './Testimonials';

/**
 * The proof bands that close a service page, after the page body and its
 * form: real reviews, case snapshots, the guarantee. Every one renders
 * nothing while `content/shared/proof.ts` is empty, so with no data the page
 * simply ends at its form, with no heading left over.
 */
export function ServiceProof({ site }: { site: SiteKey }) {
  return (
    <>
      <Testimonials site={site} limit={2} tone="alt" />
      <CaseSnapshots site={site} limit={2} />
      <Guarantee site={site} tone="alt" />
    </>
  );
}
