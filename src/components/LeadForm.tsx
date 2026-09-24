import { randomUUID } from 'node:crypto';
import { ProgressiveForm } from './ProgressiveForm';
import { submitLeadFormAction } from '@/app/actions/lead';
import { COUNTRIES } from '@/lib/countries';
import { t } from '@/i18n';
import { issueFormTimestamp } from '@/lib/form-guard';
import { INVESTMENT_RANGES } from '@/lib/lead-schema';
import { getSite, type SiteKey } from '@/sites/registry';
import { whatsappHref } from '@/lib/whatsapp';
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
    phoneOrWhatsapp: t(site, 'form.phoneOrWhatsapp'),
    nextStep: t(site, 'form.nextStep'),
    whatsapp: t(site, 'form.whatsapp'),
    nationality: t(site, 'form.nationality'),
    message: t(site, 'form.message'),
    investmentRange: t(site, 'form.investmentRange'),
    investmentRoute: t(site, 'form.investmentRoute'),
    submit: t(site, `form.submit.${variant === 'whatsapp' ? 'contact' : variant}`),
    sending: t(site, 'form.sending'),
    successTitle: t(site, 'form.successTitle'),
    successBody: t(site, 'form.successBody'),
    // After the form, the fastest next step is a WhatsApp from the same phone:
    // VenderCRM threads it onto the contact the form just created.
    whatsappContinueHref: whatsappHref(t(site, 'whatsapp.afterForm', { domain: getSite(site).canonicalHost })),
    whatsappContinue: t(site, 'whatsapp.continue'),
    whatsappContinueHint: t(site, 'whatsapp.continueHint'),
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

  const fields = {
    site, variant, pagePath, quizResult, quizAnswers, labels,
    timestamp: issueFormTimestamp(), id: 'lead-' + randomUUID(),
    countryOptions: COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.name}</option>),
  };
  return <ProgressiveForm kind="lead" fields={fields}
    base={<LeadFormFields {...fields} action={submitLeadFormAction} />}
    success={<LeadFormFields {...fields} action={submitLeadFormAction} state={{ status: 'ok' }} />} />;
}

export type { LeadVariant };
