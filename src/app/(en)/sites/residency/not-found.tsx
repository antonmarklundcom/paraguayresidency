import { NotFoundBody } from '@/lib/not-found-body';

// This segment's layout.tsx already wraps children in SiteShell, so this
// nested not-found renders only the body (avoids doubling nav/footer).
export default function NotFound() {
  return <NotFoundBody site="residency" />;
}
