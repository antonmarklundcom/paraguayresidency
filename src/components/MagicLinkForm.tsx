import { t } from '@/i18n';
import { issueFormTimestamp } from '@/lib/form-guard';
import type { SiteKey } from '@/sites/registry';
import { MagicLinkFormFields, type MagicLinkLabels } from './MagicLinkFormFields';

/** Server half: brand labels and the signed render timestamp. */
export function MagicLinkForm({ site }: { site: SiteKey }) {
  const labels: MagicLinkLabels = {
    email: t(site, 'login.email'),
    submit: t(site, 'login.submit'),
    sending: t(site, 'login.sending'),
    sentTitle: t(site, 'login.sentTitle'),
    sentBody: t(site, 'login.sentBody'),
  };
  return <MagicLinkFormFields site={site} timestamp={issueFormTimestamp()} labels={labels} />;
}
