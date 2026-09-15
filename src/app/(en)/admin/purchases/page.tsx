import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { resendDownloadAction } from '../actions';
import { ActionButton, panel, table, td, th } from '../ui';
import { listPurchases, listSubscriptions } from '@/lib/admin-queries';
import { formatPrice } from '@/lib/purchases';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Purchases', robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdminPage();
  const { rows, unavailable } = await listPurchases();
  const subs = await listSubscriptions();

  return (
    <>
      <h1 className="font-[family-name:var(--display-font)] text-[var(--text-2xl)]">Purchases</h1>
      <p className="mt-2 text-[var(--text-sm)] text-[var(--fg-muted)]">
        One-time checkouts from either provider. Recurring memberships are in the
        subscriptions table below.
      </p>

      {unavailable ? (
        <p className={`${panel} mt-6 p-4 text-[var(--text-sm)] text-[var(--fg-muted)]`}>
          DATABASE_URL is not set on this server, so there is nothing to list.
        </p>
      ) : (
        <div className={`${panel} mt-6 overflow-x-auto`}>
          <table className={table}>
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>When</th>
                <th className={th}>Buyer</th>
                <th className={th}>Product</th>
                <th className={th}>Provider</th>
                <th className={th}>Amount</th>
                <th className={th}>Status</th>
                <th className={th}>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.id}>
                  <td className={td}>{order.id}</td>
                  <td className={td}>
                    {(order.paidAt ?? order.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
                  </td>
                  <td className={td}>
                    {order.name ?? '—'}
                    <br />
                    <a href={`mailto:${order.email}`} className="underline underline-offset-2">
                      {order.email}
                    </a>
                  </td>
                  <td className={td}>{order.productName ?? '—'}</td>
                  <td className={td}>
                    {order.provider}
                    <br />
                    <span className="text-[var(--text-xs)] text-[var(--fg-muted)]">
                      {order.providerOrderId ?? order.providerCheckoutId}
                    </span>
                  </td>
                  <td className={td}>{formatPrice(order.amountCents, order.currency)}</td>
                  <td className={td}>
                    <span
                      className={
                        order.status === 'paid'
                          ? 'text-[var(--success)]'
                          : order.status === 'refunded'
                            ? 'text-[var(--danger)]'
                            : 'text-[var(--fg-muted)]'
                      }
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className={td}>
                    {order.status === 'paid' ? (
                      <ActionButton
                        action={resendDownloadAction}
                        name="purchaseId"
                        value={order.id}
                        label="Resend link"
                        busyLabel="Sending…"
                      />
                    ) : (
                      <span className="text-[var(--fg-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className={td} colSpan={8}>
                    No purchases yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 font-[family-name:var(--display-font)] text-[var(--text-xl)]">
        Subscriptions
      </h2>
      {subs.unavailable ? null : (
        <div className={`${panel} mt-4 overflow-x-auto`}>
          <table className={table}>
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>Member</th>
                <th className={th}>Product</th>
                <th className={th}>Status</th>
                <th className={th}>Period ends</th>
                <th className={th}>Provider id</th>
              </tr>
            </thead>
            <tbody>
              {subs.rows.map((sub) => (
                <tr key={sub.id}>
                  <td className={td}>{sub.id}</td>
                  <td className={td}>{sub.email ?? '—'}</td>
                  <td className={td}>{sub.productName ?? '—'}</td>
                  <td className={td}>
                    <span
                      className={
                        sub.status === 'active'
                          ? 'text-[var(--success)]'
                          : sub.status === 'expired' || sub.status === 'cancelled'
                            ? 'text-[var(--danger)]'
                            : 'text-[var(--fg-muted)]'
                      }
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className={td}>
                    {(sub.endsAt ?? sub.currentPeriodEnd)?.toISOString().slice(0, 10) ?? '—'}
                  </td>
                  <td className={td}>
                    {sub.provider}:{sub.providerSubscriptionId}
                  </td>
                </tr>
              ))}
              {subs.rows.length === 0 ? (
                <tr>
                  <td className={td} colSpan={6}>
                    No subscriptions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
