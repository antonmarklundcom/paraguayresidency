import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function FrontierLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="frontier">{children}</SiteShell>;
}
