import type { ReactNode } from 'react';
import '../globals.css';

/** HTML cache ceiling; see `src/app/(en)/layout.tsx`. */
export const revalidate = 600;

/** See `src/app/(en)/layout.tsx` for why this exists per locale. */
export default function EsRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
