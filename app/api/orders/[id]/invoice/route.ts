import { createClient } from '@/lib/supabase/server';
import { createTextPdf } from '@/lib/server/simple-pdf';
import { firstRelation } from '@/lib/order-relations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user)
    return Response.json({ error: 'Please sign in.' }, { status: 401 });
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      '*,order_items(*),payments(provider,status),delivery_assignments(status)',
    )
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('Invoice order query failed:', error.message);
    return Response.json({ error: 'Unable to generate PDF.' }, { status: 500 });
  }
  if (!order)
    return Response.json({ error: 'Order not found.' }, { status: 404 });

  const payment = firstRelation(order.payments);
  const delivery = firstRelation(order.delivery_assignments);
  const money = (value: unknown) => `INR ${Number(value ?? 0).toFixed(2)}`;
  const lines = [
    'TOYVERSE - ORDER INVOICE / ORDER SUMMARY',
    '',
    `Order: ${order.order_number}`,
    `Date: ${new Date(order.created_at).toLocaleString('en-IN')}`,
    `Customer: ${order.shipping_full_name}`,
    `Email: ${order.customer_email || auth.user.email || ''}`,
    `Ship to: ${order.shipping_address_line1}${order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}`,
    `${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}, ${order.shipping_country}`,
    '',
    'ITEMS',
    ...((order.order_items ?? []) as Array<Record<string, unknown>>).map(
      (item) =>
        `${typeof item.product_name === 'string' ? item.product_name : ''} | Qty ${Number(item.quantity ?? 0)} | ${money(item.unit_price)} | ${money(item.line_total)}`,
    ),
    '',
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${money(order.shipping_amount)}`,
    `Total: ${money(order.total_amount)}`,
    `Payment: ${order.payment_status} (${payment?.provider === 'demo' ? 'Demo Payment' : payment?.provider || 'Demo Payment'})`,
    `Order status: ${order.status}`,
    `Delivery status: ${delivery?.status || 'unassigned'}`,
    '',
    'ToyVerse is currently a demonstration e-commerce project.',
    'This invoice/order copy is generated for demonstration purposes.',
  ];
  const pdf = createTextPdf(lines);
  const filename = `ToyVerse-${String(order.order_number).replace(/[^A-Za-z0-9_-]/g, '')}.pdf`;
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
