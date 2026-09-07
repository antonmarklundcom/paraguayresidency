import { t } from '@/i18n';
import { issueFormTimestamp } from '@/lib/form-guard';
import type { SiteKey } from '@/sites/registry';
import { NewsletterFormFields, type NewsletterLabels } from './NewsletterFormFields';

/** Double opt-in signup (plan §5.2.5). Server half: labels + signed timestamp. */
export function NewsletterForm({ site, source = 'inline' }: { site: SiteKey; source?: string }) {
  const labels: NewsletterLabels = {
    email: t(site, 'newsletter.email'),
    submit: t(site, 'newsletter.submit'),
    sending: t(site, 'newsletter.sending'),
    note: t(site, 'newsletter.note'),
  };
  return (
    <NewsletterFormFields
      site={site}
      timestamp={issueFormTimestamp()}
      source={source}
      labels={labels}
    />
  );
}
