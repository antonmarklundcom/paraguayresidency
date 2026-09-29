"use client";

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { MobileBarFrame, barStyles } from './MobileBar';
import { WhatsAppIcon } from './WhatsAppIcon';

/**
 * The mobile bar on a page with an inquiry form (service and pricing pages):
 * "jump to the form" plus WhatsApp. It takes the place of the shell's
 * MobileWhatsAppBar on these pages (the marker below hides that one, see
 * globals.css), so there is only ever one bar, in the same frame and style.
 * It keeps both the inquiry and the footer clear, as before.
 */
export function StickyCta({ formId, label }: { formId: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const [whatsapp, setWhatsapp] = useState<{ href: string; label: string } | null>(null);
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form || !('IntersectionObserver' in window)) return;
    const footer = document.querySelector('footer');
    const targets = footer ? [form, footer] : [form];
    const inView = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
      // The shell's WhatsApp link carries the brand's number, text and label.
      const link = document.querySelector<HTMLAnchorElement>('[data-mobile-bar] a[data-whatsapp], [data-wa-fab]');
      setWhatsapp(link ? { href: link.href, label: link.getAttribute('aria-label') ?? link.textContent?.trim() ?? 'WhatsApp' } : null);
      setVisible(targets.every((target) => inView.get(target) === false));
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [formId]);
  return (
    <>
      <span hidden data-sticky-cta-page />
      {visible && (
        <MobileBarFrame data-sticky-cta>
          <Button href={'#' + formId} className={barStyles.primary}>{label}</Button>
          {whatsapp && (
            <a href={whatsapp.href} rel="noopener" target="_blank" data-whatsapp data-placement="sticky" aria-label={whatsapp.label} className={barStyles.icon}>
              <WhatsAppIcon className="size-6" />
            </a>
          )}
        </MobileBarFrame>
      )}
    </>
  );
}
