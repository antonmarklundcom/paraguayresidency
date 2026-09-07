import Script from 'next/script';

/**
 * Plausible per-site pageview tracking (plan §6.4.5, §7 "default Plausible").
 * Env-gated so it never loads in dev/build/CI and degrades to nothing when
 * unset (plan §4.5) — no API key needed, Plausible identifies sites by
 * `data-domain`, which is the brand's own canonical host.
 */
export function Analytics({ domain }: { domain: string }) {
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_ENABLED !== 'true') return null;
  return (
    <Script
      strategy="afterInteractive"
      src="https://plausible.io/js/script.js"
      data-domain={domain}
    />
  );
}
