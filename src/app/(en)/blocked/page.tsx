import { notFound } from 'next/navigation';

/**
 * Middleware rewrites here for anything that must not exist publicly: direct
 * `/sites/...` hits (so every page has exactly one public URL), `/admin` on a
 * non-hub host, and `/dev/*` in production.
 */
export default function Blocked() {
  notFound();
}
