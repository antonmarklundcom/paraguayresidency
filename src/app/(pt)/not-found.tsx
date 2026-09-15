import { NotFoundBody } from '@/lib/not-found-body';
import { SiteShell } from '@/lib/site-shell';


export default function NotFound() {
  const site = 'residenciapt' as const;
  return (
    <SiteShell site={site}>
      <NotFoundBody site={site} />
    </SiteShell>
  );
}
