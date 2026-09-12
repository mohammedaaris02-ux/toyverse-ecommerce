import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { firstRelation, relationList } from '@/lib/order-relations';

type EmailEvent = 'order_confirmation' | 'order_delivered' | 'order_cancelled';

type OrderEmailResult = 'sent' | 'already_sent' | 'in_progress';

async function resolveOrderRecipient(
  supabase: SupabaseClient,
  orderId: string,
  authenticatedEmail?: string | null,
) {
  const preferred = authenticatedEmail?.trim();
  const { data, error } = await supabase.rpc('resolve_order_recipient_email', {
    p_order_id: orderId,
  });
  if (error) {
    console.error('Unable to resolve order recipient:', {
      orderId,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
  const resolved = typeof data === 'string' ? data.trim() : '';
  const recipient = preferred || resolved;
  if (!recipient) {
    console.error('Order email recipient is missing:', { orderId });
    throw new Error('Order recipient email is unavailable.');
  }
  return recipient;
}

const escapeHtml = (value: string | number | boolean | null | undefined) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const scalar = (value: unknown) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? value
    : null;

export const getSiteUrl = (requestOrigin: string) =>
  (
    process.env.NEXT_PUBLIC_SITE_URL ||
    requestOrigin ||
    'http://localhost:3000'
  ).replace(/\/$/, '');

async function deliverEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Email provider is not configured.');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM || 'ToyVerse <onboarding@resend.dev>',
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });
  const payload = (await response.json()) as { id?: string; message?: string };
  if (!response.ok)
    throw new Error(payload.message || 'Email provider rejected the request.');
  return payload.id ?? null;
}

async function sendOrderEmail(
  supabase: SupabaseClient,
  orderId: string,
  eventType: EmailEvent,
  origin: string,
  authenticatedEmail?: string | null,
): Promise<OrderEmailResult> {
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      '*,order_items(*),payments(id,status,provider),delivery_assignments(delivered_at)',
    )
    .eq('id', orderId)
    .single();
  if (error || !order) throw new Error('Order email data unavailable.');
  const recipient = await resolveOrderRecipient(
    supabase,
    orderId,
    authenticatedEmail,
  );

  const items = relationList(order.order_items) as Array<
    Record<string, unknown>
  >;
  const payments = relationList(order.payments) as Array<
    Record<string, unknown>
  >;
  if (
    eventType === 'order_confirmation' &&
    (items.length === 0 ||
      !payments.some(
        (payment) => payment.provider === 'demo' && payment.status === 'paid',
      ))
  ) {
    throw new Error('Order confirmation prerequisites are incomplete.');
  }

  const { data: existing } = await supabase
    .from('order_email_events')
    .select('id,status')
    .eq('order_id', orderId)
    .eq('event_type', eventType)
    .maybeSingle();
  if (existing?.status === 'sent') return 'already_sent';
  if (existing?.status === 'pending') return 'in_progress';

  let eventId = existing?.id as string | undefined;
  if (eventId) {
    await supabase
      .from('order_email_events')
      .update({
        recipient_email: recipient,
        status: 'pending',
        error_message: null,
      })
      .eq('id', eventId);
  } else {
    const result = await supabase
      .from('order_email_events')
      .insert({
        order_id: orderId,
        event_type: eventType,
        recipient_email: recipient,
        status: 'pending',
      })
      .select('id')
      .single();
    if (result.error) {
      if (result.error.code === '23505') return 'in_progress';
      throw result.error;
    }
    eventId = result.data.id;
  }

  try {
    const delivered = eventType === 'order_delivered';
    const cancelled = eventType === 'order_cancelled';
    const assignment = firstRelation(order.delivery_assignments);
    const itemRows = items
      .map(
        (item) =>
          `<tr><td>${escapeHtml(scalar(item.product_name))}</td><td>${Number(item.quantity)}</td><td>INR ${Number(item.unit_price).toFixed(2)}</td><td>INR ${Number(item.line_total).toFixed(2)}</td></tr>`,
      )
      .join('');
    const subject = delivered
      ? `ToyVerse Order Delivered — ${order.order_number}`
      : cancelled
        ? `ToyVerse Order Cancelled — ${order.order_number}`
        : `ToyVerse Order Confirmed — ${order.order_number}`;
    const heading = delivered
      ? 'Your order has been delivered'
      : cancelled
        ? 'Order Cancelled'
        : 'Order confirmed';
    const summary = delivered
      ? 'has been delivered successfully.'
      : cancelled
        ? 'was cancelled before shipment.'
        : 'was placed successfully.';
    const providerId = await deliverEmail({
      to: recipient,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#101828"><h1 style="color:#6D4AFF">ToyVerse</h1><h2>${heading}</h2><p>Hello ${escapeHtml(order.shipping_full_name)},</p><p>Your ToyVerse order <strong>${escapeHtml(order.order_number)}</strong> ${summary}</p>${delivered ? `<p>Delivered date: ${escapeHtml(assignment?.delivered_at ? new Date(assignment.delivered_at).toLocaleDateString('en-IN') : 'Delivered')}</p>` : ''}${cancelled && order.cancellation_reason ? `<p>Cancellation reason: ${escapeHtml(order.cancellation_reason)}</p>` : ''}<table style="width:100%;border-collapse:collapse"><thead><tr><th align="left">Item</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead><tbody>${itemRows}</tbody></table><p>Subtotal: INR ${Number(order.subtotal).toFixed(2)}<br>Shipping: INR ${Number(order.shipping_amount).toFixed(2)}<br><strong>Total: INR ${Number(order.total_amount).toFixed(2)}</strong><br>Payment: ${escapeHtml(order.payment_status)}<br>Order status: ${cancelled ? 'Cancelled' : delivered ? 'Delivered' : escapeHtml(order.status)}</p><p>Ship to: ${escapeHtml(order.shipping_address_line1)}, ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)} ${escapeHtml(order.shipping_postal_code)}</p>${delivered ? '<p>We hope you enjoy your ToyVerse order.</p><p>You can request a return within 7 days of delivery, subject to the ToyVerse demo return policy.</p>' : cancelled ? '<p>ToyVerse currently uses a demonstration payment flow. No real payment refund has been processed.</p>' : '<p>This order uses the ToyVerse demonstration payment flow; no real payment was charged.</p>'}<p><a href="${origin}/account/orders/${order.id}" style="display:inline-block;background:#6D4AFF;color:white;padding:12px 18px;text-decoration:none;border-radius:8px">View My Order</a></p></div>`,
    });
    await supabase
      .from('order_email_events')
      .update({ status: 'sent', provider_message_id: providerId })
      .eq('id', eventId);
    return 'sent';
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : 'Email delivery failed.';
    await supabase
      .from('order_email_events')
      .update({ status: 'failed', error_message: message.slice(0, 500) })
      .eq('id', eventId);
    throw cause;
  }
}

export const sendOrderConfirmationEmail = (
  supabase: SupabaseClient,
  orderId: string,
  origin: string,
  authenticatedEmail?: string | null,
) =>
  sendOrderEmail(
    supabase,
    orderId,
    'order_confirmation',
    origin,
    authenticatedEmail,
  );

export const sendOrderDeliveredEmail = (
  supabase: SupabaseClient,
  orderId: string,
  origin: string,
) => sendOrderEmail(supabase, orderId, 'order_delivered', origin);

export const sendOrderCancelledEmail = (
  supabase: SupabaseClient,
  orderId: string,
  origin: string,
  authenticatedEmail?: string | null,
) =>
  sendOrderEmail(
    supabase,
    orderId,
    'order_cancelled',
    origin,
    authenticatedEmail,
  );

export async function sendReturnRefundedEmail(
  supabase: SupabaseClient,
  returnRequestId: string,
  origin: string,
) {
  const { data: request, error } = await supabase
    .from('return_requests')
    .select(
      '*,orders(order_number,shipping_full_name,customer_email,total_amount)',
    )
    .eq('id', returnRequestId)
    .single();
  const order = firstRelation(request?.orders);
  const recipient = request?.order_id
    ? await resolveOrderRecipient(supabase, request.order_id)
    : null;
  if (
    error ||
    !request ||
    !order ||
    !recipient ||
    request.status !== 'refunded'
  )
    throw new Error('Return email data unavailable.');

  const { data: existing } = await supabase
    .from('return_email_events')
    .select('id,status')
    .eq('return_request_id', returnRequestId)
    .eq('event_type', 'return_refunded')
    .maybeSingle();
  if (existing?.status === 'sent' || existing?.status === 'pending') return;

  let eventId = existing?.id as string | undefined;
  if (eventId) {
    await supabase
      .from('return_email_events')
      .update({
        recipient_email: recipient,
        status: 'pending',
        error_message: null,
      })
      .eq('id', eventId);
  } else {
    const result = await supabase
      .from('return_email_events')
      .insert({
        return_request_id: returnRequestId,
        order_id: request.order_id,
        event_type: 'return_refunded',
        recipient_email: recipient,
        status: 'pending',
      })
      .select('id')
      .single();
    if (result.error) {
      if (result.error.code === '23505') return;
      throw result.error;
    }
    eventId = result.data.id;
  }

  try {
    const providerId = await deliverEmail({
      to: recipient,
      subject: `ToyVerse Demo Refund Completed — ${order.order_number}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#101828"><h1 style="color:#6D4AFF">ToyVerse</h1><h2>Demo Refund Completed</h2><p>Hello ${escapeHtml(order.shipping_full_name)},</p><p>Your return request for order <strong>${escapeHtml(order.order_number)}</strong> has been marked as demo refunded.</p><p>Order number: ${escapeHtml(order.order_number)}<br>Return reason: ${escapeHtml(request.reason)}<br>Return request date: ${escapeHtml(new Date(request.requested_at).toLocaleDateString('en-IN'))}<br>Return status: Demo Refund Completed<br>Order total: INR ${Number(order.total_amount).toFixed(2)}${request.admin_note ? `<br>Admin note: ${escapeHtml(request.admin_note)}` : ''}</p><p><strong>ToyVerse is currently a demonstration e-commerce project. This status represents a demo refund workflow and no real money transfer has been processed.</strong></p><p><a href="${origin}/account/orders/${request.order_id}" style="display:inline-block;background:#6D4AFF;color:white;padding:12px 18px;text-decoration:none;border-radius:8px">View Return / View Order</a></p></div>`,
    });
    await supabase
      .from('return_email_events')
      .update({ status: 'sent', provider_message_id: providerId })
      .eq('id', eventId);
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : 'Email delivery failed.';
    await supabase
      .from('return_email_events')
      .update({ status: 'failed', error_message: message.slice(0, 500) })
      .eq('id', eventId);
    throw cause;
  }
}
