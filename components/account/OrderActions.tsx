'use client';

import { useState, type SubmitEvent } from 'react';
import { Ban, Download, RotateCcw, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ReturnRequest = {
  status: string;
  reason: string;
  admin_note: string | null;
};
const labels: Record<string, string> = {
  requested: 'Return Requested',
  approved: 'Return Approved',
  rejected: 'Return Rejected',
  received: 'Return Received',
  refunded: 'Demo Refund Completed',
  closed: 'Return Closed',
};
const errorMessages: Record<string, string> = {
  RETURN_NOT_DELIVERED: 'Return is available after delivery.',
  RETURN_WINDOW_EXPIRED: 'The seven-day return window has expired.',
  RETURN_ALREADY_EXISTS: 'A return request already exists for this order.',
  ORDER_NOT_FOUND: 'Order not found.',
  UNAUTHORIZED: 'You cannot request a return for this order.',
  ORDER_NOT_CANCELLABLE: 'This order can no longer be cancelled.',
  ORDER_ALREADY_CANCELLED: 'This order has already been cancelled.',
};

export function OrderActions({
  orderId,
  orderStatus,
  deliveredAt,
  returnEligible,
  existingReturn,
}: {
  orderId: string;
  orderStatus: string;
  deliveredAt: string | null;
  returnEligible: boolean;
  existingReturn: ReturnRequest | null;
}) {
  const [open, setOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDetails, setCancelDetails] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');
  const deadline = deliveredAt
    ? new Date(new Date(deliveredAt).getTime() + 7 * 86400000)
    : null;
  const eligible =
    orderStatus === 'delivered' && returnEligible && !existingReturn;
  const cancellable = orderStatus === 'processing';

  async function cancelOrder(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason || null,
          details: cancelDetails || null,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok) {
        const friendly = Object.entries(errorMessages).find(([code]) =>
          result.error?.includes(code),
        )?.[1];
        setMessage(friendly || result.error || 'Unable to cancel this order.');
        return;
      }
      setCancelOpen(false);
      setMessage('Order cancelled successfully.');
      window.location.reload();
    } catch {
      setMessage('Unable to cancel this order. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function requestReturn(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason || busy) return;
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const { error } = await supabase.rpc('request_order_return', {
      p_order_id: orderId,
      p_reason: reason,
      p_details: details || null,
    });
    if (error)
      setMessage(
        Object.entries(errorMessages).find(([code]) =>
          error.message.includes(code),
        )?.[1] || 'Unable to submit your return request.',
      );
    else {
      setOpen(false);
      window.location.reload();
    }
    setBusy(false);
  }

  async function downloadInvoice() {
    setDownloading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        response.headers
          .get('Content-Disposition')
          ?.match(/filename="([^"]+)"/)?.[1] || 'ToyVerse-order.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage('Unable to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-[#E6EAF2] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Order Actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void downloadInvoice()}
          disabled={downloading}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D9E2F0] px-4 font-semibold hover:border-[#6D4AFF]/40 disabled:opacity-60"
        >
          <Download className="size-4" />{' '}
          {downloading ? 'Generating PDF...' : 'Download Order PDF'}
        </button>
        {eligible && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6D4AFF] px-4 font-semibold text-white"
          >
            <RotateCcw className="size-4" /> Request Return
          </button>
        )}
        {cancellable && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#FDA29B] bg-white px-4 font-semibold text-[#B42318] transition-colors hover:bg-[#FEF3F2] focus:outline-none focus:ring-2 focus:ring-[#D92D20]/25"
          >
            <Ban className="size-4" /> Cancel Order
          </button>
        )}
      </div>
      {existingReturn ? (
        <div className="mt-4 rounded-lg bg-[#F2EFFF] p-4 text-sm">
          <strong>
            {labels[existingReturn.status] || existingReturn.status}
          </strong>
          <p className="mt-1 text-[#667085]">Reason: {existingReturn.reason}</p>
          {existingReturn.admin_note && (
            <p className="mt-1 text-[#667085]">
              Admin note: {existingReturn.admin_note}
            </p>
          )}
        </div>
      ) : orderStatus === 'cancelled' ? (
        <p className="mt-3 text-sm font-semibold text-[#B42318]">
          Order Cancelled
        </p>
      ) : deliveredAt ? (
        <p className="mt-3 text-sm text-[#667085]">
          {eligible
            ? `Return available until ${deadline!.toLocaleDateString('en-IN')}.`
            : 'Return window has expired.'}
        </p>
      ) : (
        <p className="mt-3 text-sm text-[#667085]">
          Return available after delivery.
        </p>
      )}
      {message && (
        <p role="alert" className="mt-4 text-sm text-[#B42318]">
          {message}
        </p>
      )}
      {open && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 grid size-full max-h-none max-w-none place-items-center bg-black/45 p-4"
        >
          <form
            onSubmit={requestReturn}
            aria-labelledby="return-title"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="return-title" className="text-xl font-bold">
                Request Return
              </h2>
              <button
                type="button"
                aria-label="Close return form"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-lg hover:bg-[#F2F4F7]"
              >
                <X className="size-5" />
              </button>
            </div>
            <label
              htmlFor="return-reason"
              className="mt-5 block text-sm font-semibold"
            >
              Reason
            </label>
            <select
              id="return-reason"
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border px-3"
            >
              <option value="">Select a reason</option>
              {[
                'Damaged item',
                'Wrong item received',
                'Product not as expected',
                'Missing parts',
                'Changed mind',
                'Other',
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label
              htmlFor="return-details"
              className="mt-4 block text-sm font-semibold"
            >
              Additional details{' '}
              <span className="font-normal text-[#667085]">(optional)</span>
            </label>
            <textarea
              id="return-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border p-3"
            />
            <button
              type="submit"
              disabled={busy || !reason}
              className="mt-5 min-h-12 w-full rounded-xl bg-[#6D4AFF] font-bold text-white disabled:opacity-60"
            >
              {busy ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </form>
        </dialog>
      )}
      {cancelOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 grid size-full max-h-none max-w-none place-items-center bg-black/45 p-4"
        >
          <form
            onSubmit={cancelOrder}
            aria-labelledby="cancel-title"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="cancel-title" className="text-xl font-bold">
                  Cancel Order
                </h2>
                <p className="mt-2 text-sm text-[#667085]">
                  Are you sure you want to cancel this order?
                </p>
              </div>
              <button
                type="button"
                aria-label="Close cancellation dialog"
                onClick={() => setCancelOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-[#F2F4F7]"
              >
                <X className="size-5" />
              </button>
            </div>
            <label
              htmlFor="cancel-reason"
              className="mt-5 block text-sm font-semibold"
            >
              Reason{' '}
              <span className="font-normal text-[#667085]">(optional)</span>
            </label>
            <select
              id="cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border px-3"
            >
              <option value="">Select a reason</option>
              {[
                'Ordered by mistake',
                'Changed my mind',
                'Wrong delivery address',
                'Found another product',
                'Other',
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label
              htmlFor="cancel-details"
              className="mt-4 block text-sm font-semibold"
            >
              Additional details{' '}
              <span className="font-normal text-[#667085]">(optional)</span>
            </label>
            <textarea
              id="cancel-details"
              value={cancelDetails}
              onChange={(event) => setCancelDetails(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border p-3"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setCancelOpen(false)}
                className="min-h-12 rounded-xl border border-[#D0D5DD] font-semibold hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={busy}
                className="min-h-12 rounded-xl bg-[#D92D20] font-bold text-white hover:bg-[#B42318] disabled:opacity-60"
              >
                {busy ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </section>
  );
}
