import {
  OrdersManager,
  type AdminOrder,
} from '@/components/admin/OrdersManager';
import { createClient } from '@/lib/supabase/server';
export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id,order_number,shipping_full_name,shipping_phone,shipping_city,total_amount,payment_status,status,created_at,order_items(count),delivery_assignments(status,delivery_agents(full_name))',
    )
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Unable to load admin orders', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
  return (
    <OrdersManager
      orders={(data ?? []) as unknown as AdminOrder[]}
      error={error?.message}
    />
  );
}
