'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { WhatsAppIcon } from './WhatsAppIcon';

export interface BarAction {
  href: string;
  label: string;
  kind: 'whatsapp' | 'buy' | 'contact';
}

/**
 * The fixed frame both mobile bars share (the shell's MobileWhatsAppBar and a
 * form page's StickyCta): phones only, above the home indicator
 * (safe-area inset), its height is `--mobile-bar-h`, which the shell reserves
 * under the footer (globals.css) so the bar never covers the page's end.
 */
export function MobileBarFrame({ children, hidden = false, label, ...data }: {
  children: ReactNode;
  hidden?: boolean;
  label?: string;
} & { [key: `data-${string}`]: string | boolean | undefined }) {
  return (
    <div
      role={label ? 'region' : undefined}
      aria-label={label}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      data-state={hidden ? 'hidden' : 'shown'}
      {...data}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-[var(--space-gutter)] pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(16_24_40/0.25)] backdrop-blur-md transition-[transform,opacity] duration-[var(--dur-3)] ease-[var(--ease-out)] data-[state=hidden]:translate-y-full data-[state=hidden]:opacity-0 md:hidden"
    >
      <div className="mx-auto flex max-w-md gap-2">{children}</div>
    </div>
  );
}

const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-brand)] px-4 text-(length:--step--1) font-medium transition-colors duration-[var(--dur-2)]';

export const barStyles = {
  whatsapp: `${button} flex-1 bg-[var(--wa)] text-[var(--wa-fg)] active:bg-[var(--wa-hover)]`,
  primary: `${button} flex-1 bg-[var(--accent)] text-[var(--accent-fg)]`,
  icon: 'inline-flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] text-[var(--wa)]',
};

/**
 * The shell's bar (mounted by MobileWhatsAppBar on every page of every
 * brand). It steps aside while a form, the footer, or the section its own
 * button points at is on screen, so it never sits over a field or repeats
 * the button the reader is looking at. WhatsApp clicks are counted by
 * WhatsAppClickTracker (`data-placement="mobile-bar"`); the other actions
 * send `cta_click` with the same site/path/placement shape.
 */
export function MobileBarClient({ site, label, primary, secondary }: {
  site: string;
  label: string;
  primary: BarAction;
  /** A WhatsApp icon button next to a non-WhatsApp primary (the guide). */
  secondary?: { href: string; label: string } | null;
}) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    // Watch the section around each form, not the form: a progressive form
    // swaps its <form> element when it enhances, and a detached element
    // reports "not visible" for good.
    const forms = [...document.querySelectorAll('main form')].map((form) => form.closest('section') ?? form.parentElement ?? form);
    const targets: Element[] = [...new Set([...forms, ...document.querySelectorAll('footer')])];
    const url = new URL(primary.href, window.location.href);
    if (url.hash && url.pathname === window.location.pathname) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) targets.push(target);
    }
    if (targets.length === 0) return;
    const inView = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
      setHidden([...inView.values()].some(Boolean));
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname, primary.href]);

  const onClick = () => {
    if (primary.kind !== 'whatsapp') track('cta_click', { site, path: window.location.pathname, placement: 'mobile-bar', action: primary.kind });
  };

  return (
    <MobileBarFrame hidden={hidden} label={label} data-mobile-bar>
      {primary.kind === 'whatsapp' ? (
        <a href={primary.href} rel="noopener" target="_blank" data-whatsapp data-placement="mobile-bar" className={barStyles.whatsapp}>
          <WhatsAppIcon className="size-5" />
          {primary.label}
        </a>
      ) : (
        <Link href={primary.href} onClick={onClick} className={barStyles.primary}>
          {primary.label}
        </Link>
      )}
      {secondary && (
        <a href={secondary.href} rel="noopener" target="_blank" data-whatsapp data-placement="mobile-bar" aria-label={secondary.label} className={barStyles.icon}>
          <WhatsAppIcon className="size-6" />
        </a>
      )}
    </MobileBarFrame>
  );
}
