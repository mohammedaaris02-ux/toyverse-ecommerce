import {
  ReturnsManager,
  type AdminReturn,
} from '@/components/admin/ReturnsManager';
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('return_requests')
    .select(
      '*,orders(order_number,shipping_full_name,customer_email,total_amount,delivery_assignments(delivered_at))',
    )
    .order('requested_at', { ascending: false });
  if (error) console.error('Unable to load returns:', error.message);
  return (
    <ReturnsManager
      initialItems={(data ?? []) as unknown as AdminReturn[]}
      error={error?.message}
    />
  );
}
