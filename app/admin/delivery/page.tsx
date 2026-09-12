import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
type DeliveryRow = {
  id: string;
  status: string;
  expected_delivery_date: string | null;
  orders: {
    id: string;
    order_number: string;
    shipping_full_name: string;
    shipping_city: string;
    total_amount: number;
  };
  delivery_agents: { full_name: string } | null;
};
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('delivery_assignments')
    .select(
      'id,status,expected_delivery_date,orders(id,order_number,shipping_full_name,shipping_city,total_amount),delivery_agents(full_name)',
    )
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });
  const rows = (data ?? []) as unknown as DeliveryRow[];
  const counts = {
    unassigned: rows.filter((r) => r.status === 'unassigned').length,
    assigned: rows.filter((r) => r.status === 'assigned').length,
    out: rows.filter((r) => r.status === 'out_for_delivery').length,
    delivered: rows.filter((r) => r.status === 'delivered').length,
  };
  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#6D4AFF]">Operations</p>
          <h1 className="mt-1 text-3xl font-bold">Delivery</h1>
        </div>
        <Link
          href="/admin/delivery/agents"
          prefetch={false}
          className="rounded-lg bg-[#6D4AFF] px-4 py-3 text-sm font-semibold text-white"
        >
          Manage Agents
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Unassigned', counts.unassigned],
          ['Assigned', counts.assigned],
          ['Out for Delivery', counts.out],
          ['Delivered', counts.delivered],
        ].map(([l, v]) => (
          <article key={l} className="rounded-lg border bg-white p-5">
            <strong className="text-3xl">{v}</strong>
            <p className="mt-1 text-sm text-[#667085]">{l}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 overflow-hidden rounded-lg border bg-white">
        {rows.length ? (
          rows.map((row) => (
            <Link
              key={row.id}
              href={`/admin/orders/${row.orders.id}`}
              prefetch={false}
              className="grid gap-2 border-b p-4 last:border-0 sm:grid-cols-5"
            >
              <strong>{row.orders.order_number}</strong>
              <span>{row.orders.shipping_full_name}</span>
              <span>{row.orders.shipping_city}</span>
              <span>{row.delivery_agents?.full_name || 'Unassigned'}</span>
              <span>{row.status.replaceAll('_', ' ')}</span>
            </Link>
          ))
        ) : (
          <p className="p-10 text-center text-[#667085]">No deliveries yet.</p>
        )}
      </section>
    </div>
  );
}
