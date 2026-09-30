/**
 * Structured logging and error reporting (O24, item 8).
 *
 * One JSON object per line — `time`, `level`, `msg`, plus whatever context
 * the call has: `reqId`, `host`, `route`, `leadId`, `site`. Hostinger keeps the
 * process's stdout/stderr, and a JSON line is searchable there and parseable
 * by any hosted log service.
 *
 * Sinks, env-driven:
 *  - always the console (`console.error` for warn/error, `console.log` below);
 *  - additionally `LOG_SINK_URL` when set: batches of JSON lines POSTed there
 *    (Better Stack, Axiom, a Logtail source, anything that ingests JSON),
 *    with `Authorization: Bearer $LOG_SINK_TOKEN` if that is set. Shipping is
 *    fire-and-forget and bounded: a dead sink costs dropped log lines, never a
 *    slow or failed request.
 *
 * Never log lead PII beyond ids: keys that carry personal data (email, phone,
 * name, message, IP …) are redacted wherever they appear in the fields, and
 * error messages are scrubbed of email addresses and phone-like digit runs.
 *
 * Errors are also counted in-process (`recentErrorCount`) for the admin
 * readiness screen. The count resets on a restart, which the screen says.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown> & {
  reqId?: string | null;
  host?: string | null;
  route?: string | null;
  leadId?: number | null;
  err?: unknown;
};

const PII_KEYS = new Set([
  'email',
  'phone',
  'whatsapp',
  'name',
  'message',
  'ip',
  'password',
  'token',
  'authorization',
  'cookie',
  'to',
  'replyto',
]);

/** Masks what a log line must never carry. Exported for tests. */
export function scrubText(text: string): string {
  return text
    .replace(/[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, (run) => {
      // A phone has 9+ digits; a date, a time or an id does not look like one.
      if (/^\d{4}-\d{2}-\d{2}/.test(run) || /^\d{1,2}:\d{2}/.test(run)) return run;
      return run.replace(/\D/g, '').length >= 9 ? '[number]' : run;
    });
}

/** Our own identifiers and routing context: never personal, never masked. */
const SAFE_KEYS = new Set(['reqid', 'route', 'routetype', 'path', 'host', 'method', 'site', 'leadid', 'digest', 'code', 'channel', 'status', 'mode']);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[deep]';
  if (typeof value === 'string') return scrubText(value).slice(0, 2000);
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      out[key] = PII_KEYS.has(lower)
        ? '[redacted]'
        : SAFE_KEYS.has(lower) && (typeof inner === 'string' || typeof inner === 'number')
          ? typeof inner === 'string' ? inner.slice(0, 500) : inner
          : redact(inner, depth + 1);
    }
    return out;
  }
  return value;
}

export function serializeError(error: unknown): Record<string, unknown> | undefined {
  if (error === undefined || error === null) return undefined;
  if (error instanceof Error) {
    const withCode = error as Error & { code?: unknown; digest?: unknown; cause?: unknown };
    return {
      name: error.name,
      message: scrubText(error.message).slice(0, 1000),
      ...(typeof withCode.code === 'string' ? { code: withCode.code } : {}),
      ...(typeof withCode.digest === 'string' ? { digest: withCode.digest } : {}),
      stack: error.stack?.split('\n').slice(0, 8).map(scrubText).join('\n'),
      ...(withCode.cause ? { cause: serializeError(withCode.cause) } : {}),
    };
  }
  return { message: scrubText(String(error)).slice(0, 1000) };
}

/** The line that gets written. Pure; exported for tests. */
export function formatLine(level: LogLevel, msg: string, fields: LogFields = {}, now = new Date()): string {
  const { err, ...rest } = fields;
  const clean = redact(rest) as Record<string, unknown>;
  for (const key of Object.keys(clean)) if (clean[key] === undefined || clean[key] === null) delete clean[key];
  return JSON.stringify({
    time: now.toISOString(),
    level,
    msg: scrubText(msg),
    ...clean,
    ...(err !== undefined ? { err: serializeError(err) } : {}),
  });
}

/* ---------------------------------------------------- recent error count */

const ERROR_RING_MAX = 1000;
const errorTimes: number[] = [];
const bootedAt = Date.now();

function noteError(at: number): void {
  errorTimes.push(at);
  if (errorTimes.length > ERROR_RING_MAX) errorTimes.splice(0, errorTimes.length - ERROR_RING_MAX);
}

/** Errors logged by THIS process in the window (it resets on restart). */
export function recentErrorCount(windowMs = 86_400_000, now = Date.now()): number {
  return errorTimes.filter((t) => now - t <= windowMs).length;
}

export function processStartedAt(): Date {
  return new Date(bootedAt);
}

/* ----------------------------------------------------------------- sink */

const SINK_BATCH = 20;
const SINK_FLUSH_MS = 2000;
const SINK_QUEUE_MAX = 500;
let queue: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function sinkConfigured(): boolean {
  return Boolean(process.env.LOG_SINK_URL);
}

function flush(): void {
  timer = null;
  const url = process.env.LOG_SINK_URL;
  if (!url || !queue.length) {
    queue = [];
    return;
  }
  const batch = queue.splice(0, queue.length);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (process.env.LOG_SINK_TOKEN) headers.authorization = `Bearer ${process.env.LOG_SINK_TOKEN}`;
  try {
    void fetch(url, {
      method: 'POST',
      headers,
      body: `[${batch.join(',')}]`,
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      /* A dead sink must never become an error that is itself logged. */
    });
  } catch {
    /* same */
  }
}

function ship(line: string): void {
  if (!process.env.LOG_SINK_URL) return;
  if (queue.length >= SINK_QUEUE_MAX) queue.shift();
  queue.push(line);
  if (queue.length >= SINK_BATCH) flush();
  else if (!timer) {
    timer = setTimeout(flush, SINK_FLUSH_MS);
    (timer as { unref?: () => void }).unref?.();
  }
}

/* --------------------------------------------------------------- logger */

function write(level: LogLevel, msg: string, fields?: LogFields): void {
  if (level === 'debug' && process.env.LOG_LEVEL !== 'debug') return;
  const line = formatLine(level, msg, fields);
  if (level === 'error') noteError(Date.now());
  if (level === 'error' || level === 'warn') console.error(line);
  else console.log(line);
  ship(line);
}

export interface Logger {
  debug(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
  /** A logger that adds these fields to every line (request id, route …). */
  child(fields: LogFields): Logger;
}

function make(base: LogFields): Logger {
  const merge = (fields?: LogFields): LogFields => ({ ...base, ...(fields ?? {}) });
  return {
    debug: (msg, fields) => write('debug', msg, merge(fields)),
    info: (msg, fields) => write('info', msg, merge(fields)),
    warn: (msg, fields) => write('warn', msg, merge(fields)),
    error: (msg, fields) => write('error', msg, merge(fields)),
    child: (fields) => make(merge(fields)),
  };
}

export const log: Logger = make({});

/** Request id header the proxy sets on every request (`src/proxy.ts`). */
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * A logger carrying the current request's id, host and route, for server
 * actions and route handlers. Outside a request (a script, a test) it is the
 * plain logger.
 */
export async function requestLogger(route?: string): Promise<Logger> {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return log.child({
      reqId: h.get(REQUEST_ID_HEADER),
      host: h.get('x-forwarded-host') ?? h.get('host'),
      route: route ?? null,
    });
  } catch {
    return route ? log.child({ route }) : log;
  }
}
