import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { verifyFactAction } from '../actions';
import { ActionButton, panel, table, td, th } from '../ui';
import { listFactVerification } from '@/lib/admin-queries';
import { factKeys, facts, factText, localized } from '@content/shared/facts';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Facts', robots: { index: false, follow: false } };

/**
 * Verification state for every legal/financial figure (plan §5.2.7 / §1.10).
 *
 * Marking a fact verified here records WHO verified it and WHEN. It does not
 * change what the sites render: `content/shared/facts.ts` still decides that,
 * and flipping a fact's `verified` flag is a reviewed edit in a PR. This screen
 * is the audit trail that makes such an edit safe to make.
 */
export default async function Page() {
  await requireAdminPage();
  const { rows, unavailable } = await listFactVerification();
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return (
    <>
      <h1 className="font-[family-name:var(--display-font)] text-[var(--text-2xl)]">Facts</h1>
      <p className="mt-2 max-w-[46rem] text-[var(--text-sm)] text-[var(--fg-muted)]">
        Every figure on the three sites renders through <code>&lt;Fact&gt;</code>. While a fact is
        unverified the pages show hedged wording instead of the number. Recording verification here
        is the signal that the hedged wording may be replaced — the copy itself still changes in a
        pull request, never from this screen.
      </p>

      {unavailable ? (
        <p className={`${panel} mt-6 p-4 text-[var(--text-sm)] text-[var(--fg-muted)]`}>
          DATABASE_URL is not set on this server, so verification cannot be recorded.
        </p>
      ) : null}

      <div className={`${panel} mt-6 overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Key</th>
              <th className={th}>Shows now</th>
              <th className={th}>Once verified</th>
              <th className={th}>Verification</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {factKeys.map((key) => {
              const fact = facts[key];
              const record = byKey.get(key);
              const verified = Boolean(record?.verifiedOn);
              return (
                <tr key={key}>
                  <td className={td}>
                    <code>{key}</code>
                    <div className="text-[var(--fg-muted)]">{fact.label}</div>
                  </td>
                  <td className={`${td} max-w-[20rem]`}>{factText(key)}</td>
                  <td className={td}>{localized(fact.display)}</td>
                  <td className={td}>
                    {verified ? (
                      <span className="text-[var(--success)]">
                        {record?.verifiedBy} · {record?.verifiedOn?.toISOString().slice(0, 10)}
                      </span>
                    ) : (
                      <span className="text-[var(--fg-muted)]">not verified</span>
                    )}
                    {record?.note ? (
                      <div className="mt-1 text-[var(--text-xs)] text-[var(--fg-muted)]">
                        {record.note}
                      </div>
                    ) : null}
                  </td>
                  <td className={td}>
                    <ActionButton
                      action={verifyFactAction}
                      name="key"
                      value={key}
                      label={verified ? 'Clear' : 'Mark verified'}
                      extra={verified ? { clear: '1' } : undefined}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
