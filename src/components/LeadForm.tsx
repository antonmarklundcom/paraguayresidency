import { t } from '@/i18n';
import { issueFormTimestamp } from '@/lib/form-guard';
import { INVESTMENT_RANGES } from '@/lib/lead-schema';
import type { SiteKey } from '@/sites/registry';
import { LeadFormFields, type LeadFormLabels, type LeadVariant } from './LeadFormFields';

/**
 * Server half of the lead form (plan §5.2.2). It exists so the client bundle
 * never carries the i18n tables and so the anti-spam timestamp is issued and
 * signed on the server — a client-generated one would be worthless.
 */
export const INVESTMENT_ROUTE_IDS = [
  'real_estate',
  'productive_business',
  'financial_instruments',
  'tourism',
  'unsure',
] as const;

export function LeadForm({
  site,
  variant,
  pagePath,
  quizResult,
  quizAnswers,
}: {
  site: SiteKey;
  variant: LeadVariant;
  /** The public path this form sits on — stored on the lead for attribution. */
  pagePath: string;
  quizResult?: string;
  quizAnswers?: string;
}) {
  const labels: LeadFormLabels = {
    name: t(site, 'form.name'),
    email: t(site, 'form.email'),
    phone: t(site, 'form.phone'),
    whatsapp: t(site, 'form.whatsapp'),
    country: t(site, 'form.country'),
    nationality: t(site, 'form.nationality'),
    message: t(site, 'form.message'),
    investmentRange: t(site, 'form.investmentRange'),
    investmentRoute: t(site, 'form.investmentRoute'),
    submit: t(site, `form.submit.${variant}`),
    sending: t(site, 'form.sending'),
    successTitle: t(site, 'form.successTitle'),
    successBody: t(site, 'form.successBody'),
    optional: t(site, 'form.optional'),
    choose: t(site, 'form.choose'),
    investmentRanges: Object.fromEntries(
      INVESTMENT_RANGES.map((range) => [range, t(site, `form.range.${range}`)]),
    ) as LeadFormLabels['investmentRanges'],
    investmentRoutes: INVESTMENT_ROUTE_IDS.map((id) => ({
      id,
      label: t(site, `form.route.${id}`),
    })),
  };

  return (
    <LeadFormFields
      site={site}
      variant={variant}
      timestamp={issueFormTimestamp()}
      pagePath={pagePath}
      quizResult={quizResult}
      quizAnswers={quizAnswers}
      labels={labels}
    />
  );
}

export type { LeadVariant };
