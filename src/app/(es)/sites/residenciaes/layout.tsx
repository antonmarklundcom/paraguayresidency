import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function ResidenciaEsLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="residenciaes">{children}</SiteShell>;
}
