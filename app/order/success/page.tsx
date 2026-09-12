/* eslint-disable next/no-html-link-for-pages */
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Order Placed | ToyVerse' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const supabase = await createClient();
  const { data: order } = orderNumber
    ? await supabase
        .from('orders')
        .select('order_number,total_amount,status,payment_status')
        .eq('order_number', orderNumber)
        .maybeSingle()
    : { data: null };
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />
      <Header />
      <section className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <CheckCircle2 className="size-16 text-[#039855]" />
        <p className="mt-5 text-sm font-semibold text-[#6D4AFF]">
          Development Demo Checkout
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">
          {order ? 'Order Placed Successfully' : 'Order Not Found'}
        </h1>
        <p className="mt-4 text-[#667085]">
          {order
            ? 'Thank you for shopping with ToyVerse.'
            : 'This order is unavailable or does not belong to your account.'}
        </p>
        {order && (
          <dl className="mt-8 w-full space-y-3 border-y border-[#E6EAF2] py-6 text-left text-sm">
            {[
              ['Order Number', order.order_number],
              [
                'Total Amount',
                new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(order.total_amount),
              ],
              ['Order Status', order.status],
              ['Payment Status', order.payment_status],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-[#667085]">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/shop"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-5 font-semibold text-white!"
          >
            <ShoppingBag className="size-4" />
            Continue Shopping
          </a>
          <a
            href="/account/orders"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#E6EAF2] bg-white px-5 font-semibold"
          >
            My Orders
          </a>
        </div>
        <p className="mt-5 text-xs text-[#667085]">
          Demo checkout only. No real payment was charged.
        </p>
      </section>
      <Footer />
    </main>
  );
}
