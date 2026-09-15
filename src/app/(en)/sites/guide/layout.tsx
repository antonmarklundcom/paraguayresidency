import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function GuideLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="guide">{children}</SiteShell>;
}
