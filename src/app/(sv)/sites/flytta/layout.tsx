import type { ReactNode } from 'react';
import { SiteShell } from '@/lib/site-shell';

export default function FlyttaLayout({ children }: { children: ReactNode }) {
  return <SiteShell site="flytta">{children}</SiteShell>;
}
