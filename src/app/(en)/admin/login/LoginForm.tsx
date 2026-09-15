'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '../actions';

const input =
  'mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text-sm)] outline-none focus:border-[var(--accent)]';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2.5 text-[var(--text-sm)] font-medium text-[var(--accent-fg)] disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-6 grid gap-4">
      <label className="block text-[var(--text-sm)]">
        Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="block text-[var(--text-sm)]">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={input}
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {state.error}
        </p>
      ) : null}
      <Submit />
    </form>
  );
}
