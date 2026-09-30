import type { Instrumentation } from 'next';

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
