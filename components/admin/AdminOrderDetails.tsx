'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { DeliveryAgent } from './DeliveryAgentsManager';
import { firstRelation, relationList } from '@/lib/order-relations';
type OrderItem = {
  id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};
type DeliveryEvent = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
};
type Assignment = {
  delivery_agent_id: string | null;
  expected_delivery_date: string | null;
  status: string;
  delivery_agents?: { full_name: string } | null;
};
type Payment = { status: string };
type AdminOrderDetailsData = {
  id: string;
  order_number: string;
  created_at: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  total_amount: number;
  payment_status: string;
  status: string;
  order_items: OrderItem[] | null;
  delivery_assignments: Assignment | Assignment[] | null;
  delivery_events: DeliveryEvent | DeliveryEvent[] | null;
  payments?: Payment | Payment[] | null;
};

const deliveryTransitions: Record<string, string[]> = {
  assigned: ['picked_up', 'delivery_failed', 'cancelled'],
  picked_up: ['in_transit', 'delivery_failed', 'cancelled'],
  in_transit: ['out_for_delivery', 'delivery_failed', 'cancelled'],
  out_for_delivery: ['delivered', 'delivery_failed', 'cancelled'],
  delivered: [],
  delivery_failed: [],
  cancelled: [],
};

const orderTransitions: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['cancelled'],
};

const formatStatus = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function AdminOrderDetails({
  order,
  agents,
}: {
  order: AdminOrderDetailsData;
  agents: DeliveryAgent[];
}) {
  const assignment = firstRelation(order.delivery_assignments);
  const payment = firstRelation(order.payments);
  const [agentId, setAgentId] = useState(assignment?.delivery_agent_id || '');
  const [expected, setExpected] = useState(
    assignment?.expected_delivery_date || '',
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState('');
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  async function assign() {
    if (!agentId) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_assign_delivery', {
      p_order_id: order.id,
      p_agent_id: agentId,
      p_expected: expected || null,
    });
    setMessage(error?.message ?? 'Delivery assigned successfully.');
    setBusy(false);
    if (!error) router.refresh();
  }
  async function updateDeliveryStatus() {
    if (!selectedDeliveryStatus) return;
    setBusy(true);
    const response = await fetch(
      `/api/admin/orders/${order.id}/delivery-status`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedDeliveryStatus }),
      },
    );
    const result = (await response.json()) as { error?: string };
    setMessage(result.error ?? 'Delivery status updated.');
    setBusy(false);
    if (response.ok) {
      setSelectedDeliveryStatus('');
      router.refresh();
    }
  }
  async function updateOrderStatus() {
    if (!selectedOrderStatus) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_update_order_status', {
      p_order_id: order.id,
      p_status: selectedOrderStatus,
    });
    setMessage(
      error?.message ?? `Order marked ${formatStatus(selectedOrderStatus)}.`,
    );
    setBusy(false);
    if (!error) {
      setSelectedOrderStatus('');
      router.refresh();
    }
  }
  const validDeliveryStatuses = assignment
    ? order.status === 'cancelled'
      ? []
      : (deliveryTransitions[assignment.status] ?? [])
    : [];
  const validOrderStatuses = orderTransitions[order.status] ?? [];
  const orderIsTerminal = validOrderStatuses.length === 0;
  const money = (v: number) => `₹${Number(v).toLocaleString('en-IN')}`;
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold text-[#6D4AFF]">
          {order.order_number}
        </p>
        <h1 className="mt-1 text-3xl font-bold">Order Details</h1>
        <p className="mt-2 text-[#667085]">
          {new Date(order.created_at).toLocaleString('en-IN')}
        </p>
      </div>
      {message && (
        <output className="mb-5 block rounded-lg border bg-white p-3 text-sm">
          {message}
        </output>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-bold">Order Items</h2>
            {(order.order_items ?? []).map((i) => (
              <div
                key={i.id}
                className="flex justify-between gap-3 border-b py-4 last:border-0"
              >
                <span>
                  <strong className="block">{i.product_name}</strong>
                  <small>
                    {i.sku || 'No SKU'} · {i.quantity} × {money(i.unit_price)}
                  </small>
                </span>
                <strong>{money(i.line_total)}</strong>
              </div>
            ))}
          </section>
          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-bold">Tracking History</h2>
            {relationList(order.delivery_events).length ? (
              relationList(order.delivery_events).map((e) => (
                <div
                  key={e.id}
                  className="border-l-2 border-[#6D4AFF] py-2 pl-4"
                >
                  <strong>{e.status.replaceAll('_', ' ')}</strong>
                  <p className="text-sm text-[#667085]">{e.message}</p>
                  <small>
                    {new Date(e.created_at).toLocaleString('en-IN')}
                  </small>
                </div>
              ))
            ) : (
              <p className="mt-3 text-[#667085]">No delivery events yet.</p>
            )}
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-bold">Customer & Shipping</h2>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              {order.shipping_full_name}
              <br />
              {order.shipping_phone}
              <br />
              {order.shipping_address_line1}
              <br />
              {order.shipping_address_line2 && (
                <>
                  {order.shipping_address_line2}
                  <br />
                </>
              )}
              {order.shipping_city}, {order.shipping_state}{' '}
              {order.shipping_postal_code}
              <br />
              {order.shipping_country}
            </p>
          </section>
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-bold">Totals</h2>
            <p className="mt-3 flex justify-between">
              <span>Total</span>
              <strong>{money(order.total_amount)}</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-[#ECFDF3] px-3 py-1 font-semibold text-[#027A48]">
                Payment: {order.payment_status || payment?.status || 'pending'}
              </span>
              <span className="rounded-full bg-[#F2F4F7] px-3 py-1 font-semibold">
                Order: {formatStatus(order.status)}
              </span>
            </div>
            <div className="mt-4">
              <label htmlFor="order-status" className="text-sm font-semibold">
                Order Status
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                <select
                  id="order-status"
                  value={selectedOrderStatus}
                  onChange={(event) =>
                    setSelectedOrderStatus(event.target.value)
                  }
                  disabled={busy || orderIsTerminal}
                  className="h-11 w-full rounded-lg border px-3 focus:border-[#6D4AFF] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20"
                >
                  <option value="">Select order status</option>
                  {validOrderStatuses.map((value) => (
                    <option key={value} value={value}>
                      {formatStatus(value)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy || !selectedOrderStatus || orderIsTerminal}
                  aria-busy={busy}
                  onClick={() => void updateOrderStatus()}
                  className="min-h-11 rounded-lg bg-[#6D4AFF] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? 'Updating...' : 'Update Order Status'}
                </button>
              </div>
            </div>
          </section>
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-bold">Assign Delivery</h2>
            {order.status !== 'packed' && !assignment && (
              <p className="mt-3 text-sm text-[#667085]">
                Mark this order as packed before assigning a delivery partner.
              </p>
            )}
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={orderIsTerminal}
              className="mt-4 h-11 w-full rounded-lg border px-3 disabled:bg-[#F2F4F7]"
            >
              <option value="">Select active agent</option>
              {agents
                .filter((a) => a.is_active)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name}
                  </option>
                ))}
            </select>
            <input
              type="date"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              disabled={orderIsTerminal}
              className="mt-3 h-11 w-full rounded-lg border px-3 disabled:bg-[#F2F4F7]"
            />
            <button
              type="button"
              disabled={
                busy || !agentId || order.status !== 'packed' || orderIsTerminal
              }
              onClick={() => void assign()}
              className="mt-3 min-h-11 w-full rounded-lg bg-[#6D4AFF] font-semibold text-white"
            >
              Assign Delivery
            </button>
            {assignment && (
              <div className="mt-5 border-t pt-5">
                <p className="mb-4 text-sm">
                  Agent:{' '}
                  <strong>
                    {assignment.delivery_agents?.full_name || 'Assigned'}
                  </strong>
                  <br />
                  Current Delivery Status:{' '}
                  <strong className="inline-flex rounded-full bg-[#F2F4F7] px-2.5 py-1">
                    {formatStatus(assignment.status)}
                  </strong>
                </p>
                <label
                  htmlFor="delivery-status"
                  className="text-sm font-semibold"
                >
                  Delivery Status
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select
                    id="delivery-status"
                    value={selectedDeliveryStatus}
                    onChange={(event) =>
                      setSelectedDeliveryStatus(event.target.value)
                    }
                    disabled={busy || validDeliveryStatuses.length === 0}
                    className="h-11 w-full rounded-lg border px-3 focus:border-[#6D4AFF] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 disabled:bg-[#F2F4F7]"
                  >
                    <option value="">Select delivery status</option>
                    {validDeliveryStatuses.map((value) => (
                      <option key={value} value={value}>
                        {formatStatus(value)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy || !selectedDeliveryStatus}
                    aria-busy={busy}
                    onClick={() => void updateDeliveryStatus()}
                    className="min-h-11 rounded-lg bg-[#6D4AFF] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? 'Updating...' : 'Update Delivery Status'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
