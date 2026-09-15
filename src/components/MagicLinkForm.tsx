import { randomUUID } from 'node:crypto';
import { ProgressiveForm } from './ProgressiveForm';
import { magicLinkFormAction } from '@/app/actions/lead';
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
  const fields = { site, labels, timestamp: issueFormTimestamp(), id: 'magic-' + randomUUID() };
  return <ProgressiveForm kind="magic" fields={fields}
    base={<MagicLinkFormFields {...fields} action={magicLinkFormAction} />}
    success={<MagicLinkFormFields {...fields} action={magicLinkFormAction} state={{ status: 'ok' }} />} />;
}
