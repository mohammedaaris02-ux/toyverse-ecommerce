import {
  OrdersPage,
  type CustomerOrderSummary,
} from '@/components/account/OrdersPage';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'My Orders | ToyVerse' };

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id,order_number,total_amount,status,payment_status,created_at,order_items(count),delivery_assignments(status)',
    )
    .order('created_at', { ascending: false });
  if (error)
    console.error(
      'Customer orders query failed:',
      error.message,
      error.code,
      error.details,
      error.hint,
    );
  return (
    <OrdersPage
      orders={(data ?? []) as CustomerOrderSummary[]}
      error={error?.message}
    />
  );
}
