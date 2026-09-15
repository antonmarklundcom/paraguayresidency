import type { ReactNode } from 'react';
import '../globals.css';

/** See `src/app/(en)/layout.tsx` for why this exists per locale. */
export default function SvRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
