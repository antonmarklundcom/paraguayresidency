import type { ReactNode } from 'react';
import '../globals.css';

/**
 * HTML is cached for 10 minutes, not a year. Fully static pages otherwise go out
 * with `s-maxage=31536000`, and the Hostinger CDN kept serving week-old HTML that
 * pointed at CSS chunks the next deploy had deleted (the ES homepage rendered
 * unstyled; docs/audit/2026-10/seo-gap.md T2). The lowest `revalidate` in a route
 * wins, so this is a ceiling every page under the group inherits; `expireTime`
 * in next.config.ts caps the stale window. Same in the other three root layouts.
 */
export const revalidate = 600;

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
