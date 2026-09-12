import { notFound } from 'next/navigation';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';
import { createClient } from '@/lib/supabase/server';
import { DeliveryTracker } from '@/components/account/DeliveryTracker';
import { OrderRefresh } from '@/components/account/OrderRefresh';
import { OrderActions } from '@/components/account/OrderActions';
import { firstRelation, relationList } from '@/lib/order-relations';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      '*,order_items(*),delivery_assignments(*,delivery_agents(full_name,phone,vehicle_type,vehicle_number)),delivery_events(*),return_requests(status,reason,admin_note)',
    )
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('Unable to load customer order', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Unable to load this order right now. Please try again.');
  }
  if (!order) notFound();
  const money = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  const assignment = firstRelation(order.delivery_assignments);
  const returnDeadline = assignment?.delivered_at
    ? new Date(assignment.delivered_at).getTime() + 7 * 86400000
    : 0;
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />
      <Header />
      <OrderRefresh />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-[#6D4AFF]">
          {order.order_number}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Order Details</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Products</h2>
            <div className="mt-4 divide-y divide-[#E6EAF2]">
              {(order.order_items ?? []).map(
                (item: Record<string, unknown>) => (
                  <div
                    key={String(item.id)}
                    className="flex justify-between gap-4 py-4"
                  >
                    <span>
                      <strong className="block">
                        {String(item.product_name)}
                      </strong>
                      <small className="text-[#667085]">
                        {Number(item.quantity)} ×{' '}
                        {money(Number(item.unit_price))}
                      </small>
                    </span>
                    <strong>{money(Number(item.line_total))}</strong>
                  </div>
                ),
              )}
            </div>
          </div>
          <aside className="space-y-5 rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-bold">Delivery Address</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                {order.shipping_full_name}
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
                <br />
                {order.shipping_phone}
              </p>
            </div>
            <dl className="space-y-2 border-t border-[#E6EAF2] pt-4 text-sm">
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd>{order.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Payment</dt>
                <dd>{order.payment_status}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd>{money(order.total_amount)}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <div className="mt-6">
          <DeliveryTracker
            orderStatus={order.status}
            assignment={assignment}
            events={relationList(order.delivery_events)}
          />
        </div>
        <OrderActions
          orderId={order.id}
          orderStatus={order.status}
          deliveredAt={assignment?.delivered_at ?? null}
          // The database RPC remains the authoritative eligibility check.
          // oxlint-disable-next-line react/react-compiler
          returnEligible={returnDeadline > Date.now()}
          existingReturn={firstRelation(order.return_requests)}
        />
      </section>
      <Footer />
    </main>
  );
}
