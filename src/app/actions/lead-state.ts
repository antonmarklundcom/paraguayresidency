/**
 * Initial `useActionState` values and their types for the public forms.
 *
 * Split out of `./lead.ts` (S14): a `'use server'` module may export ONLY
 * async functions — Next enforces this on the server action's own module
 * graph, and `lead.ts` was exporting these two objects directly. It never
 * surfaced until this phase's new "use server" route changed how the two
 * files got chunked together, which is when `A "use server" file can only
 * export async functions, found object` started throwing at request time
 * (not at build time, which is why `npm run build` never caught it). Moving
 * the plain values here, with no `'use server'` directive, is the fix Next's
 * own docs describe — nothing about `createLead`/`subscribe`'s behavior
 * changes, only where these two constants live.
 */

export interface LeadFormState {
  status: 'idle' | 'ok' | 'error';
  errors?: Record<string, string>;
  message?: string;
}

export const initialLeadState: LeadFormState = { status: 'idle' };

export interface SubscribeFormState {
  status: 'idle' | 'ok' | 'error';
  message?: string;
}

export const initialSubscribeState: SubscribeFormState = { status: 'idle' };
