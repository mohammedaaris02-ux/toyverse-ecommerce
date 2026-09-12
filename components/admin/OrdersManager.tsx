'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { firstRelation } from '@/lib/order-relations';

export type AdminOrder = {
  id: string;
  order_number: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_city: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  order_items: { count: number }[] | null;
  delivery_assignments:
    | {
        status: string;
        delivery_agents: { full_name: string } | null;
      }
    | {
        status: string;
        delivery_agents: { full_name: string } | null;
      }[]
    | null;
};
const filters = [
  'all',
  'pending',
  'paid',
  'processing',
  'packed',
  'assigned',
  'picked_up',
  'in_transit',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed',
  'delivery_failed',
];
export function OrdersManager({
  orders,
  error,
}: {
  orders: AdminOrder[];
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const visible = useMemo(
    () =>
      orders
        .filter((o) => {
          const delivery = firstRelation(o.delivery_assignments)?.status;
          return (
            `${o.order_number} ${o.shipping_full_name} ${o.shipping_phone}`
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (filter === 'all' ||
              o.status === filter ||
              o.payment_status === filter ||
              delivery === filter)
          );
        })
        .sort((a, b) =>
          sort === 'oldest'
            ? Date.parse(a.created_at) - Date.parse(b.created_at)
            : sort === 'highest'
              ? b.total_amount - a.total_amount
              : sort === 'lowest'
                ? a.total_amount - b.total_amount
                : Date.parse(b.created_at) - Date.parse(a.created_at),
        ),
    [filter, orders, query, sort],
  );
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold text-[#6D4AFF]">Operations</p>
        <h1 className="mt-1 text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-[#667085]">
          Manage real customer orders and delivery progress.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] p-4 text-sm text-[#B42318]"
        >
          Unable to load orders: {error}
        </p>
      )}
      <section className="overflow-hidden rounded-lg border border-[#E7EAF0] bg-white">
        <div className="grid gap-3 border-b border-[#E7EAF0] p-4 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 size-4 text-[#98A2B3]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, customer or phone"
              className="h-11 w-full rounded-lg border border-[#D0D5DD] pl-10 pr-3"
            />
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-11 rounded-lg border border-[#D0D5DD] px-3"
          >
            {filters.map((v) => (
              <option key={v} value={v}>
                {v.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-lg border border-[#D0D5DD] px-3"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest value</option>
            <option value="lowest">Lowest value</option>
          </select>
        </div>
        {!visible.length ? (
          <p className="p-10 text-center text-[#667085]">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#F9FAFB] text-xs uppercase text-[#667085]">
                <tr>
                  {[
                    'Order',
                    'Customer',
                    'Date',
                    'Total',
                    'Payment',
                    'Order status',
                    'Delivery',
                    'Agent',
                    'Items',
                    '',
                  ].map((h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]">
                {visible.map((o) => {
                  const delivery = firstRelation(o.delivery_assignments);
                  return (
                    <tr key={o.id}>
                      <td className="px-4 py-4 font-semibold">
                        {o.order_number}
                      </td>
                      <td className="px-4 py-4">
                        {o.shipping_full_name}
                        <small className="block text-[#667085]">
                          {o.shipping_phone}
                        </small>
                      </td>
                      <td className="px-4 py-4">
                        {new Date(o.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        ₹{Number(o.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4">{o.payment_status}</td>
                      <td className="px-4 py-4">
                        {o.status
                          .replaceAll('_', ' ')
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </td>
                      <td className="px-4 py-4">
                        {delivery?.status || 'unassigned'}
                      </td>
                      <td className="px-4 py-4">
                        {delivery?.delivery_agents?.full_name || '—'}
                      </td>
                      <td className="px-4 py-4">
                        {o.order_items?.[0]?.count ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          prefetch={false}
                          className="font-semibold text-[#6D4AFF]"
                        >
                          View Order
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
