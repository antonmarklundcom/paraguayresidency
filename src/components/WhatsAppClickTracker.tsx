'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { withPageMessage } from '@/lib/reply-window';

/**
 * Counts every click on a WhatsApp link as a Plausible `whatsapp_click` event
 * with the brand, the page and which button it was (`data-placement`), so
 * the dashboards show which pages start conversations. One delegated listener
 * catches every wa.me link, including ones inside MDX articles. Sends no
 * personal data; a no-op unless Plausible is enabled.
 */
export function WhatsAppClickTracker({ site, pageTemplate }: { site: string; pageTemplate?: string }) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="https://wa.me/"]');
      if (!link) return;
      // The sticky bar and floating button name the page being read: the
      // server-rendered link keeps the generic text, this swaps it at click.
      if (pageTemplate && link.hasAttribute('data-wa-page') && window.location.pathname !== '/') {
        (link as HTMLAnchorElement).href = withPageMessage((link as HTMLAnchorElement).href, pageTemplate, document.title);
      }
      track('whatsapp_click', {
        site,
        path: window.location.pathname,
        placement: link.getAttribute('data-placement') ?? 'link',
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [site, pageTemplate]);
  return null;
}
