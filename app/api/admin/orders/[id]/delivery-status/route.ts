import { createClient } from '@/lib/supabase/server';
import { getSiteUrl, sendOrderDeliveredEmail } from '@/lib/server/order-email';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_update_delivery_status', {
    p_order_id: id,
    p_status: body.status,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  if (body.status === 'delivered') {
    try {
      await sendOrderDeliveredEmail(
        supabase,
        id,
        getSiteUrl(new URL(request.url).origin),
      );
    } catch (emailError) {
      console.error('Delivered order email failed:', emailError);
    }
  }
  return Response.json({ success: true });
}
