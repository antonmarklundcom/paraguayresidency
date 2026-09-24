import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';
import { preloadBrandFonts } from '@/lib/fonts';

export default function InvestorpassLayout({ children }: { children: ReactNode }) {
  // Here, not in SiteShell: the root not-found also renders a (hub) shell
  // inside every page's tree, which would preload the hub's fonts everywhere.
  preloadBrandFonts('investorpass');
  return <SiteShell site="investorpass">{children}</SiteShell>;
}
