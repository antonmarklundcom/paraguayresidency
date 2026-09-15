'use client';

import { useActionState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from './actions';

/** Small shared bits for the admin screens. Deliberately plain. */

export const table = 'w-full border-collapse text-[var(--text-sm)]';
export const th =
  'border-b border-[var(--border)] px-3 py-2 text-left font-medium text-[var(--fg-muted)]';
export const td = 'border-b border-[var(--border)] px-3 py-2 align-top';
export const panel = 'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]';

function Pending({ label, busyLabel }: { label: string; busyLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2.5 py-1 text-[var(--text-xs)] hover:border-[var(--accent)] disabled:opacity-50"
    >
      {pending ? busyLabel : label}
    </button>
  );
}

/**
 * A form bound to a server action, with its result shown inline. `extra`
 * carries hidden values; `children` carries visible inputs the action needs
 * (the member grant's tier select and expiry date).
 */
export function ActionButton({
  action,
  name,
  value,
  label,
  busyLabel = 'Working…',
  extra,
  children,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  name: string;
  value: string | number;
  label: string;
  busyLabel?: string;
  extra?: Record<string, string>;
  children?: ReactNode;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name={name} value={value} />
      {Object.entries(extra ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
      <Pending label={label} busyLabel={busyLabel} />
      {state.message ? (
        <span className="text-[var(--text-xs)] text-[var(--success)]">{state.message}</span>
      ) : null}
      {state.error ? (
        <span className="text-[var(--text-xs)] text-[var(--danger)]">{state.error}</span>
      ) : null}
    </form>
  );
}
