import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function ResidenciaPtLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="residenciapt">{children}</SiteShell>;
}
