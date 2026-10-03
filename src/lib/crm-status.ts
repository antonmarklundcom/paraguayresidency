/**
 * What `/admin/leads` shows in the CRM column (O26 bug 7).
 *
 * VenderCRM's `/api/v1/leads` requires a phone — it is the contact identity
 * (`vendercrm-lead-capture` skill, "Phone is required, and it is the
 * identity") — so a lead without one is never sent. `setCrmStatus` keeps such a
 * lead at `pending` because a later retry can still mean something (the
 * not-configured case), which made a phoneless lead look like it was merely
 * waiting. The reason is on `crm_response`; this reads it back so the admin
 * sees "skipped: no phone" instead of a silent "pending".
 *
 * Pure (no `server-only`) so the test can call it directly.
 */
export function crmStatusLabel(status: string, response: unknown): string {
  if (status !== 'pending' || !response || typeof response !== 'object') return status;
  const { status: outcome, reason } = response as { status?: unknown; reason?: unknown };
  if (outcome !== 'skipped') return status;
  if (reason === 'no-phone') return 'skipped: no phone';
  if (reason === 'not-configured') return 'skipped: CRM not configured';
  return 'skipped';
}
