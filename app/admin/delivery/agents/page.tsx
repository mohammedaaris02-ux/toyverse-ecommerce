import {
  DeliveryAgentsManager,
  type DeliveryAgent,
} from '@/components/admin/DeliveryAgentsManager';
import { createClient } from '@/lib/supabase/server';
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('delivery_agents')
    .select('*')
    .order('full_name');
  return (
    <DeliveryAgentsManager initialItems={(data ?? []) as DeliveryAgent[]} />
  );
}
