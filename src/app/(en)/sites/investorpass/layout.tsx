import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function InvestorpassLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="investorpass">{children}</SiteShell>;
}
