import { createClient } from '@/lib/supabase/server';
import { getSiteUrl, sendReturnRefundedEmail } from '@/lib/server/order-email';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  const { id } = await params;
  const body = (await request.json()) as { status?: string; note?: string };
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_update_return', {
    p_return_id: id,
    p_status: body.status,
    p_note: body.note || null,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  if (body.status === 'refunded') {
    try {
      await sendReturnRefundedEmail(
        supabase,
        id,
        getSiteUrl(new URL(request.url).origin),
      );
    } catch (emailError) {
      console.error('Demo refund email failed:', emailError);
    }
  }
  return Response.json({ success: true });
}
