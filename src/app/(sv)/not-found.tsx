import { NotFoundBody } from '@/lib/not-found-body';
import { SiteShell } from '@/lib/site-shell';


export default function NotFound() {
  const site = 'flytta' as const;
  return (
    <SiteShell site={site}>
      <NotFoundBody site={site} />
    </SiteShell>
  );
}
