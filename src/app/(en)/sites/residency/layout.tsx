import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function ResidencyLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="residency">{children}</SiteShell>;
}
