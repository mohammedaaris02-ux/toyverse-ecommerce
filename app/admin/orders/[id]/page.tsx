import { notFound } from 'next/navigation';
import { AdminOrderDetails } from '@/components/admin/AdminOrderDetails';
import type { DeliveryAgent } from '@/components/admin/DeliveryAgentsManager';
import { createClient } from '@/lib/supabase/server';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [orderResult, agentResult] = await Promise.all([
    supabase
      .from('orders')
      .select(
        '*,order_items(*),payments(*),delivery_assignments(*,delivery_agents(*)),delivery_events(*)',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('delivery_agents')
      .select('*')
      .eq('is_active', true)
      .order('full_name'),
  ]);
  if (orderResult.error) {
    console.error('Unable to load admin order', {
      message: orderResult.error.message,
      code: orderResult.error.code,
      details: orderResult.error.details,
      hint: orderResult.error.hint,
    });
    throw new Error('Unable to load this order right now. Please try again.');
  }
  if (agentResult.error) {
    console.error('Unable to load delivery agents', {
      message: agentResult.error.message,
      code: agentResult.error.code,
      details: agentResult.error.details,
      hint: agentResult.error.hint,
    });
  }
  if (!orderResult.data) notFound();
  return (
    <AdminOrderDetails
      order={orderResult.data}
      agents={(agentResult.data ?? []) as DeliveryAgent[]}
    />
  );
}
