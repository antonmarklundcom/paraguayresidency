"use client";

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { WhatsAppIcon } from './WhatsAppIcon';

/** Keep both the inquiry and the footer clear of the mobile action. */
export function StickyCta({ formId, label }: { formId: string; label: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form || !('IntersectionObserver' in window)) return;
    const footer = document.querySelector('footer');
    const targets = footer ? [form, footer] : [form];
    const inView = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
      setVisible(targets.every((target) => inView.get(target) === false));
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [formId]);
  if (!visible) return null;
  // Only ever reached on the client (visible starts false). The shell's
  // floating WhatsApp button carries the brand's href and label; on mobile it
  // hides while this bar shows, so the bar offers it instead.
  const fab = document.querySelector<HTMLAnchorElement>('[data-wa-fab]');
  const whatsapp = fab ? { href: fab.href, label: fab.getAttribute('aria-label') ?? 'WhatsApp' } : null;
  return (
    <div data-sticky-cta className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-[var(--border)] bg-[var(--bg)] px-5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
      <Button href={'#' + formId} className="min-h-11 flex-1">{label}</Button>
      {whatsapp && (
        <a href={whatsapp.href} rel="noopener" target="_blank" data-placement="sticky" aria-label={whatsapp.label} className="flex min-h-11 w-14 shrink-0 items-center justify-center rounded-[var(--radius-brand)] bg-[#1f8f4e] text-white">
          <WhatsAppIcon className="size-6" />
        </a>
      )}
    </div>
  );
}
