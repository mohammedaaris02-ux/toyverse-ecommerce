'use client';

/* eslint-disable next/no-html-link-for-pages, next/no-img-element */
import { useId, useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  LockKeyhole,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';
import { useCustomerAuth } from '@/components/account/CustomerAuth';
import { useCustomerStore } from '@/components/customer/CustomerStore';

const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';
const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
const iconButton = `grid size-11 shrink-0 place-items-center rounded-lg transition hover:bg-[#F2EFFF] disabled:cursor-not-allowed disabled:opacity-35 ${focus}`;
type Shipping = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
  country: string;
};

function Field({
  label,
  value,
  onChange,
  error,
  disabled,
  type = 'text',
  readOnly = false,
  required = true,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#344054]"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        type={type}
        readOnly={readOnly}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full min-w-0 rounded-xl border border-[#D9E2F0] bg-white px-3 text-base read-only:bg-[#F8FAFC] disabled:opacity-70 aria-invalid:border-[#D92D20] ${focus}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-[#B42318]">
          {error}
        </p>
      )}
    </div>
  );
}
function Thumbnail({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#F2EFFF] text-[#6D4AFF]">
      {failed ? (
        <Package className="size-7" />
      ) : (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      )}
    </div>
  );
}
async function post(
  url: string,
  body: unknown,
): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });
  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'The order service returned an unexpected response. Please try again.',
    );
  }
  if (!response.ok)
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : 'Unable to place order. Please try again.',
    );
  return data;
}

function CheckoutContent() {
  const { user, ready } = useCustomerAuth();
  const store = useCustomerStore();
  const router = useRouter();
  const [shipping, setShipping] = useState<Shipping>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pin: '',
    country: 'India',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Shipping, string>>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function placeOrder(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !user || !store.cart.length) return;
    const next: typeof errors = {};
    for (const field of [
      'fullName',
      'phone',
      'line1',
      'city',
      'state',
      'pin',
      'country',
    ] as const)
      if (!shipping[field].trim()) next[field] = 'This field is required.';
    if (
      !/^(?:\+91|91)?[6-9]\d{9}$/.test(shipping.phone.replace(/[\s()-]/g, ''))
    )
      next.phone = 'Enter a valid Indian mobile number.';
    if (!/^[1-9]\d{5}$/.test(shipping.pin.trim()))
      next.pin = 'Enter a valid 6-digit PIN code.';
    if (shipping.country.trim().toLowerCase() !== 'india')
      next.country = 'Delivery is currently available within India.';
    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await post('/api/orders/demo', {
        full_name: shipping.fullName.trim(),
        phone: shipping.phone.trim(),
        address_line1: shipping.line1.trim(),
        address_line2: shipping.line2.trim(),
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postal_code: shipping.pin.trim(),
        country: shipping.country.trim(),
      });
      const order = result.order as Record<string, unknown> | undefined;
      if (result.success !== true || typeof order?.order_number !== 'string')
        throw new Error('Unable to place order. Please try again.');
      store.clearCart(store.cart.map((item) => ({ ...item })));
      store.notify('Order placed successfully.');
      router.replace(
        `/order/success?order=${encodeURIComponent(order.order_number)}`,
      );
    } catch (cause) {
      const message =
        cause instanceof Error && cause.name !== 'TimeoutError'
          ? cause.message
          : 'Unable to place order. Please try again.';
      setError(message);
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <output className="block py-20 text-center">Loading checkout...</output>
    );
  if (!user) return null;
  if (!store.cart.length && !busy)
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <ShoppingCart className="size-12 text-[#6D4AFF]" />
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <a
          href="/shop"
          className={`inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#6D4AFF] px-6 font-semibold text-white! ${focus}`}
        >
          Continue Shopping
          <ArrowRight className="size-4" />
        </a>
      </section>
    );
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#6D4AFF]">
            Secure Checkout
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Make Their Day</h1>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-[#667085]">
          <ShieldCheck className="size-4 text-[#039855]" />
          Development Demo Checkout
        </span>
      </div>
      <form
        onSubmit={placeOrder}
        noValidate
        className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      >
        <section
          aria-labelledby="delivery-title"
          className="min-w-0 rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm sm:p-7"
        >
          <h2
            id="delivery-title"
            className="mb-6 flex items-center gap-2 text-xl font-bold"
          >
            <MapPin className="size-5 text-[#6D4AFF]" />
            Delivery Details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full Name"
              value={shipping.fullName}
              onChange={(value) =>
                setShipping({ ...shipping, fullName: value })
              }
              error={errors.fullName}
              disabled={busy}
            />
            <Field
              label="Email"
              value={user.email || ''}
              type="email"
              readOnly
            />
            {(
              [
                ['phone', 'Phone Number', 'tel'],
                ['line1', 'Address Line 1', 'text'],
                ['line2', 'Address Line 2', 'text'],
                ['city', 'City', 'text'],
                ['state', 'State', 'text'],
                ['pin', 'PIN Code', 'text'],
                ['country', 'Country', 'text'],
              ] as const
            ).map(([field, label, type]) => (
              <Field
                key={field}
                label={label}
                value={shipping[field]}
                type={type}
                onChange={(value) =>
                  setShipping({ ...shipping, [field]: value })
                }
                required={field !== 'line2'}
                disabled={busy}
                error={errors[field]}
              />
            ))}
          </div>
        </section>
        <section
          aria-labelledby="summary-title"
          className="min-w-0 rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm sm:p-7"
        >
          <h2 id="summary-title" className="mb-6 text-xl font-bold">
            Order Summary
          </h2>
          <div className="divide-y divide-[#E6EAF2]">
            {store.cartItems.map((product) => (
              <article
                key={product.id}
                className="flex min-w-0 gap-3 py-5 first:pt-0"
              >
                <Thumbnail
                  src={product.details.images[0].src}
                  name={product.name}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-bold">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#667085]">
                    {money(product.price)} each
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center rounded-xl border border-[#E6EAF2]">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name} quantity`}
                        disabled={busy || product.quantity <= 1}
                        onClick={() => store.changeQuantity(product.id, -1)}
                        className={iconButton}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {product.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name} quantity`}
                        disabled={
                          busy || product.quantity >= product.details.stock
                        }
                        onClick={() => store.changeQuantity(product.id, 1)}
                        className={iconButton}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from cart`}
                      title="Remove"
                      disabled={busy}
                      onClick={() => store.removeFromCart(product.id)}
                      className={iconButton}
                    >
                      <Trash2 className="size-4 text-[#667085]" />
                    </button>
                  </div>
                  <p className="mt-2 text-right text-sm font-bold">
                    {money(product.price * product.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <dl className="space-y-3 border-t border-[#E6EAF2] py-5 text-sm">
            <div className="flex justify-between gap-2">
              <dt>Subtotal</dt>
              <dd>{money(store.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Shipping</dt>
              <dd className="font-semibold text-[#039855]">FREE</dd>
            </div>
            <div className="flex justify-between gap-2 border-t border-[#E6EAF2] pt-4 text-lg font-bold">
              <dt>Total</dt>
              <dd>{money(store.subtotal)}</dd>
            </div>
          </dl>
          <div aria-live="polite">
            {error && (
              <p className="mb-4 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] p-3 text-sm leading-6 text-[#B42318]">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-3 py-3 font-bold text-white transition hover:bg-[#5B3DF5] disabled:cursor-wait disabled:opacity-60 ${focus}`}
          >
            <LockKeyhole className="size-4 shrink-0" />
            {busy ? 'Placing Order...' : `Place Order ${money(store.subtotal)}`}
          </button>
          <p className="mt-4 text-center text-xs leading-6 text-[#667085]">
            Demo checkout &mdash; no real payment will be charged.
          </p>
        </section>
      </form>
    </div>
  );
}
export function CheckoutPage() {
  const { user } = useCustomerAuth();
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />
      <Header />
      <CheckoutContent key={user?.id || 'guest'} />
      <Footer />
    </main>
  );
}
