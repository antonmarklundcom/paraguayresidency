'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A muted ambient loop laid over a hero photo. The photo stays the LCP element:
 * nothing here renders a `<video>` until the page has finished loading, and it
 * never loads on narrow screens, with `prefers-reduced-motion`, or with the
 * browser's data saver on, so phones and Lighthouse only ever see the still.
 * Files live in `public/videos/` as `<id>-720.mp4`/`.webm` and `<id>-1080.mp4`/`.webm`
 * (see `docs/design/video-2026-10.md`). `loop={false}` plays once and holds the
 * last frame, for clips that don't loop seamlessly.
 */
export function HeroVideo({ id, focus = 'center', loop = true, className = 'absolute inset-0 -z-20 h-full w-full object-cover' }: {
  id: string; focus?: string; loop?: boolean;
  /** Positioning; defaults to the full-bleed layer PhotoHero's photo uses. */
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!wide.matches || still.matches || saveData) return;
    const pick = () => setSrc(`/videos/${id}-${window.innerWidth * window.devicePixelRatio > 1700 ? 1080 : 720}`);
    const start = () => ('requestIdleCallback' in window ? window.requestIdleCallback(pick, { timeout: 2500 }) : setTimeout(pick, 1200));
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    const stop = () => { if (still.matches) { ref.current?.pause(); setVisible(false); } };
    still.addEventListener('change', stop);
    return () => { window.removeEventListener('load', start); still.removeEventListener('change', stop); };
  }, [id]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      muted
      autoPlay
      playsInline
      loop={loop}
      preload="auto"
      disablePictureInPicture
      onPlaying={() => setVisible(true)}
      style={{ objectPosition: focus }}
      className={`pointer-events-none ${className} transition-opacity duration-[var(--dur-4)] ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}
