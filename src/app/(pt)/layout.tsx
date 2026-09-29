import type { ReactNode } from 'react';
import '../globals.css';

/** HTML cache ceiling; see `src/app/(en)/layout.tsx`. */
export const revalidate = 600;

/** See `src/app/(en)/layout.tsx` for why this exists per locale. */
export default function PtRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
