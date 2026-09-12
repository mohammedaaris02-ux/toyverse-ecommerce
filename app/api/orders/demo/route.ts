import { createClient } from '@/lib/supabase/server';
import {
  getSiteUrl,
  sendOrderConfirmationEmail,
} from '@/lib/server/order-email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json'))
    return Response.json({ error: 'Invalid request.' }, { status: 400 });

  try {
    const shipping = await request.json();
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
      return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    // Development demo payment flow. Replace with real payment verification before production.
    const { data, error } = await supabase.rpc('place_demo_order', {
      p_shipping: shipping,
    });
    if (error) {
      console.error('Demo order creation failed:', error.message);
      return Response.json(
        {
          error:
            process.env.NODE_ENV === 'development'
              ? error.message
              : 'Unable to place order. Please try again.',
        },
        { status: 400 },
      );
    }
    const order = data as { id?: string } | null;
    if (order?.id) {
      try {
        const emailResult = await sendOrderConfirmationEmail(
          supabase,
          order.id,
          getSiteUrl(new URL(request.url).origin),
          auth.user.email,
        );
        console.info('Order confirmation email result:', {
          orderId: order.id,
          result: emailResult,
        });
      } catch (emailError) {
        console.error('Order confirmation email failed:', emailError);
      }
    }
    return Response.json({ success: true, order: data });
  } catch (error) {
    console.error('Demo order request failed:', error);
    return Response.json(
      { error: 'Unable to place order. Please try again.' },
      { status: 500 },
    );
  }
}
