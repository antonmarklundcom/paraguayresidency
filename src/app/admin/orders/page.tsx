import type { Metadata } from 'next';
import { requireAdminPage } from '../guard';
import { resendDownloadAction } from '../actions';
import { ActionButton, panel, table, td, th } from '../ui';
import { listOrders } from '@/lib/admin-queries';
import { formatPrice } from '@/lib/orders';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Orders', robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdminPage();
  const { rows, unavailable } = await listOrders();

  return (
    <>
      <h1 className="font-[family-name:var(--display-font)] text-[var(--text-2xl)]">Orders</h1>

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
                        name="orderId"
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
                  <td className={td} colSpan={7}>
                    No orders yet.
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
