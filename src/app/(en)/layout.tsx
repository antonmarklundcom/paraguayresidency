import type { ReactNode } from 'react';
import '../globals.css';

/**
 * One of four root layouts (plan §14.3) — Next's "multiple root layouts"
 * pattern via route groups. `lang` is now a build-time constant instead of a
 * `headers()` read, which is what lets every page under this group be static.
 * See `docs/platform.md` "Adding the eighth domain" for the group ↔ locale map.
 */
export default function EnRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
