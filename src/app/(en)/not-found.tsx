import { NotFoundBody } from '@/lib/not-found-body';
import { SiteShell } from '@/lib/site-shell';
import { currentSite } from '@/lib/current-site';

export default async function NotFound() {
  const site = await currentSite();
  return (
    <SiteShell site={site}>
      <NotFoundBody site={site} />
    </SiteShell>
  );
}
