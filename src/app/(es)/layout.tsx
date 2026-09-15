import type { ReactNode } from 'react';
import '../globals.css';

/** See `src/app/(en)/layout.tsx` for why this exists per locale. */
export default function EsRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
