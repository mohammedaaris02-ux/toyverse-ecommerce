import { getSiteUrl, sendOrderCancelledEmail } from '@/lib/server/order-email';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json'))
    return Response.json({ error: 'Invalid request.' }, { status: 400 });

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      reason?: string;
      details?: string;
    };
    const reason = [body.reason, body.details]
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value!.trim())
      .join(': ');
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
      return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { error } = await supabase.rpc('cancel_customer_order', {
      p_order_id: id,
      p_reason: reason || null,
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });

    try {
      await sendOrderCancelledEmail(
        supabase,
        id,
        getSiteUrl(new URL(request.url).origin),
        auth.user.email,
      );
    } catch (emailError) {
      console.error('Order cancellation email failed:', emailError);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Customer order cancellation failed:', error);
    return Response.json(
      { error: 'Unable to cancel this order. Please try again.' },
      { status: 500 },
    );
  }
}
