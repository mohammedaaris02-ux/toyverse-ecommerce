'use client';

import { useState } from 'react';
import { firstRelation } from '@/lib/order-relations';

type OrderRelation = {
  order_number: string;
  shipping_full_name: string;
  customer_email: string | null;
  total_amount: number;
  delivery_assignments:
    | { delivered_at: string | null }
    | { delivered_at: string | null }[]
    | null;
};
export type AdminReturn = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  admin_note: string | null;
  requested_at: string;
  orders: OrderRelation | OrderRelation[] | null;
};
const transitions: Record<string, string[]> = {
  requested: ['approved', 'rejected'],
  approved: ['received'],
  received: ['refunded', 'closed'],
  rejected: ['closed'],
  refunded: ['closed'],
  closed: [],
};
const statuses = [
  'all',
  'requested',
  'approved',
  'rejected',
  'received',
  'refunded',
  'closed',
];

export function ReturnsManager({
  initialItems,
  error,
}: {
  initialItems: AdminReturn[];
  error?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(error || '');
  const visible = items.filter(
    (item) => filter === 'all' || item.status === filter,
  );

  async function update(item: AdminReturn) {
    const next = selected[item.id];
    if (!next) return;
    setBusy(item.id);
    setMessage('');
    const response = await fetch(`/api/admin/returns/${item.id}/status`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next, note: notes[item.id] || null }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok)
      setMessage(result.error || 'Unable to update return status.');
    else {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: next, admin_note: notes[item.id] || null }
            : entry,
        ),
      );
      setSelected((current) => ({ ...current, [item.id]: '' }));
      setMessage(
        next === 'refunded'
          ? 'Demo refund marked complete.'
          : 'Return status updated.',
      );
    }
    setBusy('');
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold text-[#6D4AFF]">Customer Care</p>
        <h1 className="mt-1 text-3xl font-bold">Returns</h1>
        <p className="mt-2 text-[#667085]">
          Review customer return requests and demo refund progress.
        </p>
      </div>
      {message && (
        <output className="mb-5 block rounded-lg border bg-white p-3 text-sm">
          {message}
        </output>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => setFilter(status)}
            className={`min-h-10 rounded-lg border px-3 text-sm font-semibold ${filter === status ? 'bg-[#6D4AFF] text-white' : 'bg-white'}`}
          >
            {status.replaceAll('_', ' ')}
          </button>
        ))}
      </div>
      <section className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-[#F9FAFB] text-xs uppercase text-[#667085]">
            <tr>
              {[
                'Order',
                'Customer',
                'Reason',
                'Requested',
                'Total',
                'Delivered',
                'Status',
                'Update',
              ].map((heading) => (
                <th key={heading} className="px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map((item) => {
              const order = firstRelation(item.orders);
              const delivered = firstRelation(order?.delivery_assignments);
              return (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-semibold">
                    {order?.order_number || '—'}
                  </td>
                  <td className="px-4 py-4">
                    {order?.shipping_full_name}
                    <small className="block text-[#667085]">
                      {order?.customer_email}
                    </small>
                  </td>
                  <td className="px-4 py-4">
                    {item.reason}
                    <small className="block max-w-56 text-[#667085]">
                      {item.details}
                    </small>
                  </td>
                  <td className="px-4 py-4">
                    {new Date(item.requested_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-4">
                    ₹{Number(order?.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4">
                    {delivered?.delivered_at
                      ? new Date(delivered.delivered_at).toLocaleDateString(
                          'en-IN',
                        )
                      : '—'}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {item.status === 'refunded' ? 'demo refunded' : item.status}
                  </td>
                  <td className="px-4 py-4">
                    <div className="grid min-w-56 gap-2">
                      <select
                        aria-label={`Update return status for ${order?.order_number || item.id}`}
                        value={selected[item.id] || ''}
                        onChange={(event) =>
                          setSelected({
                            ...selected,
                            [item.id]: event.target.value,
                          })
                        }
                        disabled={!transitions[item.status]?.length}
                        className="h-10 rounded-lg border px-2"
                      >
                        <option value="">Select status</option>
                        {(transitions[item.status] || []).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <input
                        value={notes[item.id] || ''}
                        onChange={(event) =>
                          setNotes({ ...notes, [item.id]: event.target.value })
                        }
                        placeholder="Admin note"
                        className="h-10 rounded-lg border px-2"
                      />
                      <button
                        type="button"
                        disabled={busy === item.id || !selected[item.id]}
                        onClick={() => void update(item)}
                        className="min-h-10 rounded-lg bg-[#6D4AFF] px-3 font-semibold text-white disabled:opacity-50"
                      >
                        {busy === item.id ? 'Updating...' : 'Update Return'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-10 text-center text-[#667085]">
            No return requests found.
          </p>
        )}
      </section>
    </div>
  );
}
