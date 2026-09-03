import type { ReactNode } from 'react';
import './globals.css';

/**
 * Root layout only owns <html>/<body>. The visible chrome (theme, nav,
 * footer) belongs to the per-site layouts under src/app/sites/<key>/.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
