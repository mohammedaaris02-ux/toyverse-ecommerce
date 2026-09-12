'use client';

/* eslint-disable next/no-html-link-for-pages, next/no-img-element */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  LockKeyhole,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  ThumbsUp,
  Truck,
} from 'lucide-react';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';
import type { CustomerProduct } from '@/lib/customer-products';
import { cn } from '@/lib/utils';
import { useCustomerStore } from '@/components/customer/CustomerStore';

const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';
const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
const reviews = [
  {
    name: 'Priya S.',
    rating: 5,
    date: '2026-08-18',
    title: 'A lovely addition to playtime',
    text: 'Easy to introduce into our daily play routine. My child enjoys coming back to it and making up new games.',
  },
  {
    name: 'Arun K.',
    rating: 5,
    date: '2026-08-10',
    title: 'Enjoyed by the whole family',
    text: 'Arrived neatly packed. We have had some lovely family play sessions with it so far.',
  },
  {
    name: 'Nisha R.',
    rating: 4,
    date: '2026-07-29',
    title: 'A thoughtful little gift',
    text: 'A nice choice for a birthday present. The care information was useful and it was easy to get started.',
  },
];

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-[#E6EAF2] py-9 sm:py-12"
    >
      <h2 className="mb-6 text-2xl font-extrabold text-[#101828]">{title}</h2>
      {children}
    </section>
  );
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed || !src ? (
    <div
      aria-label={alt}
      className="grid h-full w-full place-content-center gap-4 bg-[#F2EFFF] p-6 text-center text-[#5B3DF5]"
    >
      <Package className="mx-auto size-16" />
      <span className="text-sm font-semibold">{alt}</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
    />
  );
}

export function ProductDetailsPage({
  product,
}: {
  product?: CustomerProduct | null;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const store = useCustomerStore();
  const liked = !!product && store.wishlist.includes(product.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState('');
  const [helpful, setHelpful] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const registerProducts = store.registerProducts;
  useEffect(() => {
    if (product) registerProducts([product]);
  }, [product, registerProducts]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!product)
    return (
      <main className="min-h-screen overflow-x-hidden">
        <AnnouncementBar />
        <Header />
        <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-20 text-center">
          <Package className="size-14 text-[#6D4AFF]" />
          <h1 className="text-3xl font-black text-[#101828]">
            Product Not Found
          </h1>
          <p className="text-[#667085]">
            This toy is no longer available or the link is incorrect.
          </p>
          <a
            href="/shop"
            className={cn(
              'inline-flex h-12 items-center gap-2 rounded-xl bg-[#6D4AFF] px-6 font-bold text-white',
              focus,
            )}
          >
            <ArrowLeft className="size-4" />
            Back to Shop
          </a>
        </section>
        <Footer />
      </main>
    );

  const { details } = product;
  const available = product.inStock && details.stock > 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;
  const fourStarCount = Math.round(product.reviewCount * (5 - product.rating));
  const ratingCounts = [
    product.reviewCount - fourStarCount,
    fourStarCount,
    0,
    0,
    0,
  ];

  function addToCart() {
    if (!available || !product || !store.addToCart(product.id, quantity))
      return;
    if (timer.current) clearTimeout(timer.current);
    setAdded(true);
    setMessage(`${quantity} ${quantity === 1 ? 'toy' : 'toys'} added to cart.`);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#101828]">
      <AnnouncementBar />
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="grid min-w-0 gap-8 py-8 sm:py-12 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-[#E6EAF2] bg-[#F2EFFF]">
              <GalleryImage
                key={details.images[activeImage].src}
                {...details.images[activeImage]}
              />
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#6D4AFF] shadow-sm">
                  {product.badge}
                </span>
              )}
              <button
                type="button"
                aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={liked}
                onClick={() => store.toggleWishlist(product.id)}
                className={cn(
                  'absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-[#6D4AFF] shadow-sm transition hover:shadow-md',
                  focus,
                )}
              >
                <Heart className={cn('size-5', liked && 'fill-current')} />
              </button>
            </div>
            <div
              aria-label="Product gallery"
              className="mt-4 grid grid-cols-4 gap-3"
            >
              {details.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`Show ${image.alt}`}
                  aria-pressed={activeImage === index}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    'aspect-square min-w-0 overflow-hidden rounded-lg border-2 transition',
                    activeImage === index
                      ? 'border-[#6D4AFF] shadow-sm'
                      : 'border-[#E6EAF2] hover:border-[#6D4AFF]/50',
                    focus,
                  )}
                >
                  <GalleryImage {...image} />
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0 self-center">
            <p className="text-sm font-bold uppercase text-[#247BFE]">
              {product.category}
            </p>
            <h1 className="mt-3 break-words text-3xl font-black leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <a
              href="#reviews"
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded text-sm',
                focus,
              )}
            >
              <Star className="size-5 fill-[#FFB020] text-[#FFB020]" />
              <strong>{product.rating}</strong>
              <span className="text-[#667085]">
                {product.reviewCount} ratings
              </span>
            </a>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span
                className={cn(
                  'font-bold',
                  available ? 'text-[#039855]' : 'text-[#B42318]',
                )}
              >
                {available ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="text-[#667085]">SKU: {details.sku}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <strong className="text-4xl font-black">
                {money(product.price)}
              </strong>
              {discount > 0 && (
                <>
                  <span className="text-xl text-[#98A2B3] line-through">
                    {money(product.originalPrice!)}
                  </span>
                  <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-sm font-extrabold text-[#039855]">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-[#667085]">
              Inclusive of all taxes
            </p>
            <p className="mt-6 leading-7 text-[#667085]">
              {product.shortDescription || details.description[0]}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold">Quantity</span>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#D9E2F0]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || !available}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className={cn(
                    'grid size-11 place-items-center hover:bg-[#F2EFFF] disabled:opacity-35',
                    focus,
                  )}
                >
                  <Minus className="size-4" />
                </button>
                <output
                  aria-live="polite"
                  aria-label="Quantity"
                  className="w-12 text-center font-bold"
                >
                  {quantity}
                </output>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= details.stock || !available}
                  onClick={() =>
                    setQuantity((value) => Math.min(details.stock, value + 1))
                  }
                  className={cn(
                    'grid size-11 place-items-center hover:bg-[#F2EFFF] disabled:opacity-35',
                    focus,
                  )}
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="text-xs text-[#667085]">
                {details.stock} available
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                disabled={!available}
                onClick={addToCart}
                className={cn(
                  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#101828] font-bold text-white transition hover:bg-[#247BFE] disabled:cursor-not-allowed disabled:opacity-40',
                  focus,
                )}
              >
                {added ? (
                  <Check className="size-5" />
                ) : (
                  <ShoppingCart className="size-5" />
                )}
                {added ? 'Added' : 'Add to Cart'}
              </button>
            </div>
            <output className="mt-3 block min-h-10 text-sm text-[#5B3DF5]">
              {message}
            </output>
            <div className="grid grid-cols-2 gap-4 border-t border-[#E6EAF2] pt-5">
              {[
                [ShieldCheck, 'Safe & Certified'],
                [LockKeyhole, 'Secure Payments'],
                [RotateCcw, 'Easy Returns'],
                [Truck, 'Fast Delivery'],
              ].map(([Icon, label]) => {
                const TrustIcon = Icon as typeof ShieldCheck;
                return (
                  <span
                    key={String(label)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#475467]"
                  >
                    <TrustIcon className="size-4 shrink-0 text-[#6D4AFF]" />
                    {String(label)}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
        <Section title="Product Highlights">
          <ul className="grid gap-4 sm:grid-cols-2">
            {details.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 rounded-lg border border-[#E6EAF2] p-4"
              >
                <Check className="mt-0.5 size-5 shrink-0 text-[#039855]" />
                <span className="leading-6">{highlight}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Product Specifications">
          <table className="w-full table-fixed text-left text-sm">
            <tbody>
              {details.specifications.map((spec) => (
                <tr
                  key={spec.label}
                  className="border-b border-[#E6EAF2] odd:bg-[#F8FAFC]"
                >
                  <th
                    scope="row"
                    className="w-2/5 break-words px-4 py-4 font-semibold text-[#667085]"
                  >
                    {spec.label}
                  </th>
                  <td className="break-words px-4 py-4 font-medium">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
        <Section title="Product Description">
          <div className="max-w-4xl space-y-4 leading-8 text-[#667085]">
            {details.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>
        <Section title="What's In The Box">
          <ul className="grid gap-4 sm:grid-cols-2">
            {details.whatsInBox.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Package className="size-5 shrink-0 text-[#6D4AFF]" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Safety & Age Guidance">
          <ul className="max-w-4xl space-y-4">
            {details.safety.map((note) => (
              <li
                key={note}
                className="flex items-start gap-3 leading-7 text-[#667085]"
              >
                <ShieldCheck className="mt-1 size-5 shrink-0 text-[#247BFE]" />
                {note}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Delivery & Returns">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Free Delivery',
                text: 'On eligible orders above ₹999',
                icon: Truck,
              },
              {
                title: 'Estimated Delivery',
                text: '3–7 business days',
                icon: Package,
              },
              {
                title: 'Easy Returns',
                text: '7-day return policy',
                icon: RotateCcw,
              },
              {
                title: 'Secure Payment',
                text: 'Payment protection available',
                icon: LockKeyhole,
              },
            ].map(({ title, text, icon: Icon }) => (
              <div key={title}>
                <Icon className="mb-3 size-6 text-[#6D4AFF]" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Ratings & Reviews" id="reviews">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div>
              <p>
                <strong className="text-5xl font-black">
                  {product.rating}
                </strong>
                <span className="text-[#667085]"> / 5</span>
              </p>
              <div
                aria-label={`${product.rating} out of 5 stars`}
                className="my-3 flex gap-1"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="size-5 fill-[#FFB020] text-[#FFB020]"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm text-[#667085]">
                {product.reviewCount} ratings
              </p>
              <div className="space-y-3">
                {ratingCounts.map((count, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className="flex w-8 shrink-0 items-center gap-1">
                      {5 - index}
                      <Star className="size-3" />
                    </span>
                    <progress
                      aria-label={`${5 - index} star ratings`}
                      value={count}
                      max={product.reviewCount}
                      className="h-2 w-full overflow-hidden rounded-full accent-[#6D4AFF]"
                    />
                    <span className="w-8 text-right text-[#667085]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[#E6EAF2]">
              {reviews.map((review) => (
                <article key={review.name} className="pb-6 pt-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <strong>{review.name}</strong>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#039855]">
                      <Check className="size-3" />
                      Verified Buyer
                    </span>
                    <time
                      dateTime={review.date}
                      className="text-xs text-[#667085]"
                    >
                      {new Date(`${review.date}T00:00:00Z`).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'UTC',
                        },
                      )}
                    </time>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-[#ECFDF5] px-2 py-1 text-xs font-bold text-[#039855]">
                      {review.rating}
                      <Star className="size-3 fill-current" />
                    </span>
                    <h3 className="font-semibold">{review.title}</h3>
                  </div>
                  <p className="mt-3 leading-7 text-[#667085]">{review.text}</p>
                  <button
                    type="button"
                    aria-pressed={helpful.includes(review.name)}
                    onClick={() =>
                      setHelpful((values) =>
                        values.includes(review.name)
                          ? values.filter((name) => name !== review.name)
                          : [...values, review.name],
                      )
                    }
                    className={cn(
                      'mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition hover:bg-[#F2EFFF]',
                      helpful.includes(review.name)
                        ? 'bg-[#F2EFFF] text-[#6D4AFF]'
                        : 'text-[#667085]',
                      focus,
                    )}
                  >
                    <ThumbsUp className="size-4" />
                    Helpful{helpful.includes(review.name) ? ' (1)' : ''}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </Section>
      </div>
      <Footer />
    </main>
  );
}
