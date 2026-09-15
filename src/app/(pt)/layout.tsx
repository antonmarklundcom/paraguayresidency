import type { ReactNode } from 'react';
import '../globals.css';

/** See `src/app/(en)/layout.tsx` for why this exists per locale. */
export default function PtRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
