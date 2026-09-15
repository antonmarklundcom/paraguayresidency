import { NotFoundBody } from '@/lib/not-found-body';
import { SiteShell } from '@/lib/site-shell';
import { HUB_SITE } from '@/sites/registry';

export default function NotFound() {
  const site = HUB_SITE;
  return (
    <SiteShell site={site}>
      <NotFoundBody site={site} />
    </SiteShell>
  );
}
