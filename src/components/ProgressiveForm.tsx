'use client';

import dynamic from 'next/dynamic';
import { track } from '@/lib/analytics';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { EnhancementProps, FormSnapshot } from './FormEnhancement';

const BaseContext = createContext<{ base: ReactNode; capture: () => void }>({ base: null, capture: () => {} });
function Base() {
  const { base, capture } = useContext(BaseContext);
  useLayoutEffect(() => () => capture(), [capture]);
  return base;
}
const Enhancement = dynamic(() => import('./FormEnhancement'), { ssr: false, loading: Base });

function subscribeToQuery(change: () => void) {
  window.addEventListener('popstate', change);
  return () => window.removeEventListener('popstate', change);
}

/** Always loaded: query confirmation and a small visibility/focus trigger only. */
export function ProgressiveForm({ base, success, ...props }: EnhancementProps & { base: ReactNode; success: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const snapshot = useRef<FormSnapshot>({ values: [] });
  const submitted = useRef(false);
  const trackedSuccess = useRef(false);
  const [active, setActive] = useState(false);
  const result = useSyncExternalStore(subscribeToQuery, () => new URLSearchParams(window.location.search).get(props.kind), () => null);
  const capture = useCallback(() => {
    const form = root.current?.querySelector('form');
    if (!form) return;
    snapshot.current.values = Array.from(form.elements).flatMap((element) => {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) return [];
      return [{ name: element.name, value: element.value }];
    });
    const focused = document.activeElement;
    if (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement || focused instanceof HTMLSelectElement) {
      snapshot.current.focus = focused.name;
      if (focused instanceof HTMLTextAreaElement || (focused instanceof HTMLInputElement && ['text', 'tel', 'search', 'url', 'password'].includes(focused.type))) {
        snapshot.current.selection = [focused.selectionStart, focused.selectionEnd];
      }
    } else {
      snapshot.current.focus = undefined;
      snapshot.current.selection = undefined;
    }
  }, []);
  const activate = () => {
    if (submitted.current) return;
    capture();
    setActive(true);
  };
  const trackSuccess = useCallback(() => {
    if (trackedSuccess.current || props.kind === 'magic') return;
    trackedSuccess.current = true;
    track(props.kind === 'lead' ? 'lead_submitted' : 'newsletter_subscribed', {
      site: props.fields.site, kind: props.kind,
    });
  }, [props.kind, props.fields.site]);
  useEffect(() => {
    if (result === 'ok') trackSuccess();
  }, [result, trackSuccess]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    // Enhanced actions update history without a popstate event.
    const check = () => {
      if (element.querySelector('[data-enhanced] [role="status"]')) trackSuccess();
    };
    const observer = new MutationObserver(check);
    observer.observe(element, { childList: true, subtree: true });
    check();
    return () => observer.disconnect();
  }, [trackSuccess]);
  useEffect(() => {
    if (result === 'ok') return;
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        if (!submitted.current) { capture(); setActive(true); }
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [result, capture]);
  return (
    <div ref={root} onFocusCapture={activate} onInputCapture={capture} onChangeCapture={capture}
      onSubmitCapture={() => { if (!root.current?.querySelector('[data-enhanced]')) { submitted.current = true; setActive(false); } }}>
      {result === 'ok' ? success : <>
        {result === 'error' ? <p role="alert" className="mb-3 text-[var(--text-sm)] text-[var(--danger)]">Check the form and try again. If it has expired, reload the page.</p> : null}
        <BaseContext.Provider value={{ base, capture }}>
          {active ? <Enhancement {...props} snapshot={snapshot} /> : <Base />}
        </BaseContext.Provider>
      </>}
    </div>
  );
}
