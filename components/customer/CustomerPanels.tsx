'use client';

/* eslint-disable next/no-img-element, next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import type { Product } from '@/lib/product-types';
import { useCustomerStore } from './CustomerStore';

const money = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';
const iconButton = `grid size-11 shrink-0 place-items-center rounded-xl text-[#667085] transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF] disabled:opacity-35 ${focus}`;

function Thumbnail({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#F2EFFF] text-[#6D4AFF]">
      {failed ? (
        <Package className="size-7" />
      ) : (
        <img
          src={product.details.images[0].src}
          alt={product.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
    </span>
  );
}

export function CustomerPanels() {
  const store = useCustomerStore();
  const { panel, setPanel } = store;
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const element = dialog.current;
    if (!panel || !element) return;
    const opener = document.activeElement as HTMLElement | null;
    element.showModal();
    element
      .querySelector<HTMLElement>(
        panel === 'search' ? 'input' : 'section button',
      )
      ?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previous;
      if (opener?.getClientRects().length) opener.focus();
      else
        document
          .querySelector<HTMLButtonElement>('button[aria-label="Open menu"]')
          ?.focus();
    };
  }, [panel]);
  const results = query.trim()
    ? store.products
        .filter((product) =>
          product.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 5)
    : [];
  const title =
    panel === 'search'
      ? 'Search toys'
      : panel === 'wishlist'
        ? 'My Wishlist'
        : 'Your Cart';
  const toast = (
    <output
      aria-live="polite"
      className={
        store.toast
          ? 'pointer-events-none fixed inset-x-4 bottom-5 z-[100] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl border border-[#D1FADF] bg-white px-4 py-3 text-sm font-semibold text-[#101828] shadow-xl'
          : 'sr-only'
      }
    >
      {store.toast && <Check className="size-4 shrink-0 text-[#039855]" />}
      {store.toast}
    </output>
  );
  return (
    <>
      {!panel && toast}
      <dialog
        ref={dialog}
        aria-labelledby="customer-panel-title"
        onCancel={() => setPanel(null)}
        onClose={() => setPanel(null)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-[#101828] backdrop:bg-[#101828]/30 backdrop:backdrop-blur-sm"
      >
        <button
          type="button"
          aria-label="Dismiss panel"
          tabIndex={-1}
          onClick={() => setPanel(null)}
          className="absolute inset-0 size-full"
        />
        {panel && (
          <motion.section
            key={panel}
            initial={
              panel === 'cart' ? { x: 40, opacity: 0 } : { y: -12, opacity: 0 }
            }
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={
              panel === 'cart'
                ? 'absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-[#E6EAF2] bg-white shadow-2xl'
                : 'relative mx-auto mt-20 flex max-h-[calc(100dvh-6rem)] w-[calc(100%-2rem)] max-w-xl flex-col overflow-hidden rounded-[18px] border border-[#E6EAF2] bg-white shadow-2xl sm:mt-24 sm:max-h-[calc(100dvh-7rem)]'
            }
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#E6EAF2] px-5 py-3">
              <h2 id="customer-panel-title" className="text-lg font-extrabold">
                {title}
              </h2>
              <button
                type="button"
                aria-label={`Close ${title}`}
                className={iconButton}
                onClick={() => setPanel(null)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              {panel === 'search' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 size-5 text-[#6D4AFF]" />
                    <input
                      autoFocus
                      aria-label="Search toys"
                      placeholder="Search toys..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className={`h-12 w-full rounded-xl border border-[#E6EAF2] bg-white pl-10 pr-4 text-base ${focus}`}
                    />
                  </div>
                  <output className="sr-only">
                    {query.trim() ? `${results.length} quick results` : ''}
                  </output>
                  {results.map((product) => (
                    <a
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setPanel(null)}
                      className={`mt-3 flex items-center gap-3 rounded-lg p-2 transition hover:bg-[#F2EFFF] ${focus}`}
                    >
                      <Thumbnail product={product} />
                      <span className="min-w-0">
                        <strong className="block text-sm">
                          {product.name}
                        </strong>
                        <span className="block text-xs text-[#667085]">
                          {product.category}
                        </span>
                        <span className="mt-1 block text-sm font-bold">
                          {money(product.price)}
                        </span>
                      </span>
                    </a>
                  ))}
                  {query.trim() && !results.length && (
                    <p className="py-8 text-center text-sm text-[#667085]">
                      No toys found.
                    </p>
                  )}
                </>
              )}
              {panel === 'wishlist' && (
                <>
                  {!store.wishlist.length && (
                    <div className="py-10 text-center text-[#667085]">
                      <Heart className="mx-auto mb-4 size-9 text-[#6D4AFF]" />
                      <p>Your wishlist is empty.</p>
                    </div>
                  )}
                  {store.products
                    .filter((product) => store.wishlist.includes(product.id))
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-start gap-3 border-b border-[#E6EAF2] py-4 first:pt-0 last:border-0"
                      >
                        <Thumbnail product={product} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{product.name}</p>
                          <p className="mt-1 text-sm">{money(product.price)}</p>
                          <a
                            href={`/product/${product.slug}`}
                            onClick={() => setPanel(null)}
                            className={`mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-[#6D4AFF]! ${focus}`}
                          >
                            View Details
                          </a>
                        </div>
                        <button
                          type="button"
                          title="Remove"
                          aria-label={`Remove ${product.name} from wishlist`}
                          className={iconButton}
                          onClick={() => store.removeFromWishlist(product.id)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                </>
              )}
              {panel === 'cart' && (
                <>
                  {!store.cart.length && (
                    <div className="py-10 text-center text-[#667085]">
                      <ShoppingCart className="mx-auto mb-4 size-9 text-[#6D4AFF]" />
                      <p>Your cart is empty.</p>
                    </div>
                  )}
                  {store.cart.map((item) => {
                    const product = store.products.find(
                      (product) => product.id === item.id,
                    );
                    if (!product) return null;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 border-b border-[#E6EAF2] py-4 first:pt-0 last:border-0"
                      >
                        <Thumbnail product={product} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{product.name}</p>
                          <p className="mt-1 text-sm">{money(product.price)}</p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center rounded-xl border border-[#E6EAF2]">
                              <button
                                type="button"
                                aria-label={`Decrease ${product.name} quantity`}
                                disabled={item.quantity <= 1}
                                className={iconButton}
                                onClick={() =>
                                  store.changeQuantity(item.id, -1)
                                }
                              >
                                <Minus className="size-4" />
                              </button>
                              <span
                                aria-label="Quantity"
                                className="w-6 text-center text-sm font-bold"
                              >
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase ${product.name} quantity`}
                                disabled={
                                  item.quantity >= product.details.stock
                                }
                                className={iconButton}
                                onClick={() => store.changeQuantity(item.id, 1)}
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              title="Remove"
                              aria-label={`Remove ${product.name} from cart`}
                              className={iconButton}
                              onClick={() => store.removeFromCart(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            {panel === 'cart' && (
              <div className="shrink-0 border-t border-[#E6EAF2] p-5">
                <div className="mb-5 flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>{money(store.subtotal)}</span>
                </div>
                <a
                  href="/checkout"
                  className={`flex min-h-12 w-full items-center justify-center rounded-xl bg-[#6D4AFF] px-4 text-center font-bold text-white! transition hover:bg-[#5B3DF5] ${focus}`}
                  onClick={() => setPanel(null)}
                >
                  Proceed to Checkout
                </a>
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className={`mt-2 min-h-12 w-full rounded-xl border border-[#E6EAF2] px-4 font-semibold transition hover:bg-[#F2EFFF] ${focus}`}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.section>
        )}
        {panel && toast}
      </dialog>
    </>
  );
}
