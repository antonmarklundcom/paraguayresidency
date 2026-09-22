"use client";

import { useEffect, useState } from 'react';
import { Button } from './Button';

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
  return (
    <div data-sticky-cta className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)] px-5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
      <Button href={'#' + formId} className="min-h-11 w-full">{label}</Button>
    </div>
  );
}
