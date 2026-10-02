import type { Instrumentation } from 'next';

/**
 * Runs once per server process, Node runtime only (the import is lazy so the
 * proxy's edge-style bundle never sees `node:diagnostics_channel`).
 * `installProcessLifecycle` ends a copy whose launcher is gone and caps SIGTERM
 * at 10 s — see `src/lib/process-lifecycle.ts` and
 * `docs/hosting-process-cap-plan.md`.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { installProcessLifecycle } = await import('@/lib/process-lifecycle');
    installProcessLifecycle();
  }
}

/**
 * Unhandled errors from every server component, route handler, server action
 * and the proxy, reported once, as one structured line (O24, item 8) —
 * with the request id the proxy stamped, the host and the route, and never the
 * request's cookies, body or query. `src/lib/log.ts` counts them for the
 * `/admin/readiness` screen and ships them to `LOG_SINK_URL` when set.
 *
 * Next calls this in the Node runtime for server errors; the import is lazy so
 * the module stays cheap to load at boot.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { log, REQUEST_ID_HEADER } = await import('@/lib/log');
  const header = (name: string) => {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  log.error('unhandled request error', {
    reqId: header(REQUEST_ID_HEADER) ?? null,
    host: header('x-forwarded-host') ?? header('host') ?? null,
    route: context.routePath,
    routeType: context.routeType,
    method: request.method,
    // Path only: a query string can carry a token or someone's details.
    path: request.path.split('?')[0],
    err: error,
  });
};
