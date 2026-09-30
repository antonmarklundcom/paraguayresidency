'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { withPageMessage } from '@/lib/reply-window';

/**
 * O24 (item 2): every WhatsApp click is also posted as a beacon to `/api/track`,
 * which stores it with the brand, page, article slug, A/B variant and
 * first-touch source (`site_events`), so `/admin/attribution` can show which
 * pages start WhatsApp conversations without Plausible. Path and placement
 * only; the server adds the rest from its own cookies. The link itself never
 * waits on this — with JavaScript off it is a plain `wa.me` link.
 */
function beacon(placement: string) {
  const body = JSON.stringify({ type: 'whatsapp_click', path: window.location.pathname, placement });
  try {
    const sent = typeof navigator.sendBeacon === 'function'
      && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    if (!sent) {
      void fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
    }
  } catch {
    // A tracking failure must never get between the visitor and WhatsApp.
  }
}

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
      const placement = link.getAttribute('data-placement') ?? 'link';
      track('whatsapp_click', {
        site,
        path: window.location.pathname,
        placement,
      });
      beacon(placement);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [site, pageTemplate]);
  return null;
}
