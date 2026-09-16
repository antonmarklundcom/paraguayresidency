import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Where the report-only CSP reports to (KNOWN-ISSUES "the report-only CSP has
 * nowhere to report to", raised by O18; the policy itself is plan §14.2.4).
 *
 * `next.config.ts` has shipped `Content-Security-Policy-Report-Only` on the
 * public tree since O18 so that S6/S15 can flip it to enforcing "after a week
 * of clean reports". The policy carried no destination, so the reports reached
 * each visitor's own console and nowhere else — there was no week of reports to
 * read, and "no reports came in" was not evidence of anything. This is that
 * destination: it logs and answers 204, nothing more.
 *
 * Deliberately NOT a step towards enforcing. Flipping the header is still a
 * separate, evidence-gated decision (`report-uri`/`report-to` are how the
 * evidence arrives).
 *
 * ## Two wire formats, because browsers disagree
 *
 * 1. `application/csp-report` — the original `report-uri` shape, one object:
 *    `{"csp-report": {"document-uri": …, "violated-directive": …, …}}`.
 *    Still what Safari and Firefox send, and what Chrome sends for `report-uri`.
 * 2. `application/reports+json` — the Reporting API shape `report-to` uses, an
 *    ARRAY of `{type, age, url, user_agent, body}` envelopes which may batch
 *    several violations (and may carry non-CSP report types, e.g. `deprecation`,
 *    if the endpoint group is ever reused).
 *
 * Both directives are set, so both shapes will arrive. The body is therefore
 * read as text and parsed defensively: a collector that 500s on a shape it did
 * not expect is worse than no collector, because the browser then has nowhere
 * to report AND we get a noisy error log about our own endpoint.
 *
 * ## Logging, not a logging service
 *
 * There is no log sink wired up in this repo (plan §14.2.3 keeps ops output on
 * the process log), so this writes `console.error` — the app's one channel that
 * reaches the hosting slot's log. Volume is bounded three ways: the middleware's
 * coarse 120/min per-IP ceiling on `POST /api/*` covers this route like every
 * other, the body is truncated before it is read, and each violation logs one
 * flat line rather than the whole payload.
 */

/** Plenty for a batch of reports; anything larger is not a browser. */
const MAX_BODY_BYTES = 64 * 1024;

/** Kept short so one violation is one grep-able line, not a wall of JSON. */
const FIELD_LIMIT = 300;

interface CspReportBody {
  'document-uri'?: unknown;
  documentURL?: unknown;
  'violated-directive'?: unknown;
  effectiveDirective?: unknown;
  'effective-directive'?: unknown;
  'blocked-uri'?: unknown;
  blockedURL?: unknown;
  disposition?: unknown;
  'script-sample'?: unknown;
  sample?: unknown;
  'source-file'?: unknown;
  sourceFile?: unknown;
  'line-number'?: unknown;
  lineNumber?: unknown;
}

function clip(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = typeof value === 'string' ? value : String(value);
  return text.length > FIELD_LIMIT ? `${text.slice(0, FIELD_LIMIT)}…` : text;
}

/**
 * The fields worth a log line, from either format. The Reporting API renames
 * every one of them (`document-uri` → `documentURL`, `blocked-uri` →
 * `blockedURL`, …), so both spellings are read rather than guessed at.
 */
export function summariseCspReport(body: CspReportBody): Record<string, string> {
  const fields: Record<string, string | undefined> = {
    documentUri: clip(body['document-uri'] ?? body.documentURL),
    directive: clip(
      body['violated-directive'] ?? body.effectiveDirective ?? body['effective-directive'],
    ),
    blockedUri: clip(body['blocked-uri'] ?? body.blockedURL),
    disposition: clip(body.disposition),
    sourceFile: clip(body['source-file'] ?? body.sourceFile),
    line: clip(body['line-number'] ?? body.lineNumber),
    sample: clip(body['script-sample'] ?? body.sample),
  };
  const summary: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== '') summary[key] = value;
  }
  return summary;
}

/**
 * One payload → zero or more violations to log. Pure, so the shape handling is
 * testable without a request: this is the part that has to not throw.
 */
export function extractReports(parsed: unknown): CspReportBody[] {
  if (!parsed || typeof parsed !== 'object') return [];

  // `application/reports+json`: an array of envelopes, each with a `body`.
  if (Array.isArray(parsed)) {
    const out: CspReportBody[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const envelope = entry as { type?: unknown; body?: unknown };
      // Ignore a `deprecation`/`intervention` report if the group is reused;
      // this endpoint only claims to understand CSP.
      if (envelope.type !== undefined && envelope.type !== 'csp-violation') continue;
      if (envelope.body && typeof envelope.body === 'object') out.push(envelope.body as CspReportBody);
    }
    return out;
  }

  // `application/csp-report`: one object under `csp-report`.
  const single = parsed as { 'csp-report'?: unknown; body?: unknown };
  if (single['csp-report'] && typeof single['csp-report'] === 'object') {
    return [single['csp-report'] as CspReportBody];
  }
  // A lone Reporting-API envelope, or a bare body some agent posts unwrapped.
  if (single.body && typeof single.body === 'object') return [single.body as CspReportBody];
  return [parsed as CspReportBody];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: string;
  try {
    raw = (await request.text()).slice(0, MAX_BODY_BYTES);
  } catch {
    // A truncated or aborted upload is the browser's problem, not ours, and
    // there is nothing useful to say about it.
    return new NextResponse(null, { status: 204 });
  }

  if (!raw.trim()) return new NextResponse(null, { status: 204 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Not JSON at all. Log the first part verbatim — if something is posting
    // junk here, that string is the only clue about what.
    console.error('[csp-report] unparseable body:', clip(raw));
    return new NextResponse(null, { status: 204 });
  }

  const reports = extractReports(parsed);
  if (reports.length === 0) {
    console.error('[csp-report] no recognisable report in body:', clip(raw));
    return new NextResponse(null, { status: 204 });
  }

  for (const report of reports) {
    console.error('[csp-report]', JSON.stringify(summariseCspReport(report)));
  }

  // 204, always. The browser does not read the body and does not retry, and a
  // non-2xx here would only make a violating page look like it also has a
  // broken endpoint.
  return new NextResponse(null, { status: 204 });
}

/**
 * Anything else is a person or a scanner, not a browser reporting a violation.
 * 405 rather than a 404 so `/api/csp-report` is visibly a live endpoint when
 * someone is checking whether the policy has a destination at all.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: true, endpoint: 'csp-report', method: 'POST' },
    { status: 405, headers: { allow: 'POST', 'cache-control': 'no-store' } },
  );
}
