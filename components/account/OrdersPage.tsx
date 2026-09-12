'use client';

/* eslint-disable next/no-html-link-for-pages */
import { Package, ShoppingBag } from 'lucide-react';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';
import { firstRelation } from '@/lib/order-relations';
import { OrderRefresh } from './OrderRefresh';

export type CustomerOrderSummary = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items: { count: number }[] | null;
  delivery_assignments: { status: string } | { status: string }[] | null;
};

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    value,
  );

export function OrdersPage({
  orders,
  error,
}: {
  orders: CustomerOrderSummary[];
  error?: string;
}) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />
      <Header />
      <OrderRefresh />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-[#6D4AFF]">My Account</p>
        <h1 className="mt-2 text-3xl font-extrabold">My Orders</h1>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-4 text-sm text-[#B42318]"
          >
            Unable to load order delivery status: {error}
          </p>
        )}
        {!orders.length ? (
          <div className="mt-8 rounded-[20px] border border-dashed border-[#D9E2F0] bg-white px-5 py-12 text-center">
            <Package className="mx-auto size-10 text-[#6D4AFF]" />
            <p className="mt-4 font-semibold">No orders yet.</p>
            <a
              href="/shop"
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#6D4AFF] px-5 font-semibold text-white!"
            >
              <ShoppingBag className="size-4" /> Shop Toys
            </a>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {orders.map((order) => (
              <a
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="grid gap-4 rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm transition hover:border-[#6D4AFF]/30 sm:grid-cols-5 sm:items-center"
              >
                <span>
                  <small className="block text-[#667085]">Order</small>
                  <strong>{order.order_number}</strong>
                </span>
                <span>
                  <small className="block text-[#667085]">Date</small>
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </span>
                <span>
                  <small className="block text-[#667085]">Items</small>
                  {order.order_items?.[0]?.count ?? 0}
                </span>
                <span>
                  <small className="block text-[#667085]">Status</small>
                  {order.status} ·{' '}
                  {firstRelation(
                    order.delivery_assignments,
                  )?.status?.replaceAll('_', ' ') || 'unassigned'}
                </span>
                <span className="sm:text-right">
                  <small className="block text-[#667085]">Total</small>
                  <strong>{money(order.total_amount)}</strong>
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
