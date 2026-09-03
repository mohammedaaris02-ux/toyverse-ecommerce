'use client';

/* eslint-disable next/no-html-link-for-pages */

import { usePathname } from 'next/navigation';
import { useState, type ElementType } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Blocks,
  Gift,
  Heart,
  LockKeyhole,
  Menu,
  PackageCheck,
  PlayCircle,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  User,
  Video,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Product } from '@/data/products';
import { cn } from '@/lib/utils';

export const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
} as const;

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '#' },
  { label: 'New Arrivals', href: '#' },
  { label: 'Best Sellers', href: '#' },
  { label: 'Offers', href: '#' },
  { label: 'About', href: '#' },
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="ToyVerse home">
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#247BFE] text-white shadow-lg shadow-[#6D4AFF]/25">
        <Sparkles className="size-5" />
      </span>
      <span
        className={cn(
          'text-xl font-extrabold tracking-[0]',
          inverse ? 'text-white' : 'text-[#101828]',
        )}
      >
        ToyVerse
      </span>
    </a>
  );
}

function IconButton({
  label,
  icon: Icon,
  count,
}: {
  label: string;
  icon: ElementType;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative grid size-10 place-items-center rounded-xl border border-[#E6EAF2] bg-white text-[#344054] shadow-sm transition hover:-translate-y-0.5 hover:border-[#6D4AFF]/30 hover:text-[#6D4AFF] hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25"
    >
      <Icon className="size-4" />
      {count ? (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#247BFE] text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-4 py-2 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center text-xs font-semibold sm:justify-between sm:text-sm">
        <span>Free Shipping on Orders Above ₹999</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-4" />
          Safe & Certified Toys for Kids
        </span>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EAF2]/80 bg-white/86 shadow-[0_8px_30px_rgb(16_24_40/5%)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) =>
            item.href === '#' ? (
              <button
                key={item.label}
                type="button"
                className="text-sm font-semibold text-[#475467] transition hover:text-[#6D4AFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30',
                  pathname === item.href
                    ? 'text-[#6D4AFF]'
                    : 'text-[#475467] hover:text-[#6D4AFF]',
                )}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <IconButton label="Search" icon={Search} />
          <IconButton label="Profile" icon={User} />
          <IconButton label="Wishlist" icon={Heart} count={2} />
          <IconButton label="Cart" icon={ShoppingCart} count={3} />
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-[#E6EAF2] text-[#101828] lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </button>
      </div>
      <motion.div
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1, x: 0, pointerEvents: 'auto' },
          closed: { opacity: 0, x: '100%', pointerEvents: 'none' },
        }}
        transition={{ duration: 0.25 }}
        className="fixed inset-y-0 right-0 z-50 w-[min(86vw,360px)] border-l border-[#E6EAF2] bg-white p-5 shadow-2xl lg:hidden"
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-xl bg-[#F2EFFF] text-[#6D4AFF]"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="grid gap-2">
          {navItems.map((item) =>
            item.href === '#' ? (
              <button
                key={item.label}
                type="button"
                className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#344054] transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-[#F2EFFF]',
                  pathname === item.href
                    ? 'bg-[#F2EFFF] text-[#6D4AFF]'
                    : 'text-[#344054] hover:text-[#6D4AFF]',
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div className="mt-7 grid grid-cols-4 gap-2">
          <IconButton label="Search" icon={Search} />
          <IconButton label="Profile" icon={User} />
          <IconButton label="Wishlist" icon={Heart} count={2} />
          <IconButton label="Cart" icon={ShoppingCart} count={3} />
        </div>
      </motion.div>
    </header>
  );
}

export function ToyVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F2EFFF] via-[#EDF6FF] to-[#FFF8E1] shadow-[0_30px_80px_rgb(36_123_254/14%)]',
        compact && 'max-w-[320px] rounded-[1.5rem]',
      )}
      aria-label="Colorful educational toy blocks"
    >
      <div className="absolute -right-12 -top-10 size-40 rounded-full bg-white/55" />
      <div className="absolute -bottom-12 -left-12 size-44 rounded-full bg-[#6D4AFF]/12" />
      <div className="absolute left-[14%] top-[18%] grid size-16 -rotate-12 place-items-center rounded-2xl bg-white text-[#6D4AFF] shadow-xl">
        <Blocks className="size-8" />
      </div>
      <div className="absolute left-[30%] top-[37%] size-24 rounded-[1.3rem] bg-[#247BFE] shadow-xl" />
      <div className="absolute left-[48%] top-[22%] size-28 rounded-full bg-[#FFF0F6] shadow-xl ring-8 ring-white/55" />
      <div className="absolute bottom-[22%] right-[18%] size-24 rotate-12 rounded-[1.3rem] bg-[#6D4AFF] shadow-xl" />
      <div className="absolute bottom-[18%] left-[20%] h-20 w-36 rounded-[1.4rem] bg-white/85 shadow-xl" />
      <Star className="absolute right-[20%] top-[16%] size-5 fill-[#FFD166] text-[#FFD166]" />
      <Star className="absolute bottom-[18%] left-[14%] size-5 fill-[#FFD166] text-[#FFD166]" />
      <Star className="absolute bottom-[35%] right-[10%] size-5 fill-[#FFD166] text-[#FFD166]" />
    </div>
  );
}

export function TrustBar({ className }: { className?: string }) {
  const items = [
    ['Safe & Certified', 'Quality checked products', ShieldCheck],
    ['Fast Delivery', 'Quick doorstep delivery', Truck],
    ['Easy Returns', 'Hassle-free returns', PackageCheck],
    ['Secure Payment', 'Trusted payment protection', LockKeyhole],
  ] as const;

  return (
    <section className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      <motion.div
        {...fadeUp}
        className="grid gap-3 rounded-2xl border border-[#E6EAF2] bg-white p-4 shadow-[0_18px_60px_rgb(16_24_40/6%)] sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map(([title, text, Icon]) => (
          <div key={title} className="flex items-center gap-3 rounded-xl p-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#EDF6FF] text-[#247BFE]">
              <Icon className="size-5" />
            </span>
            <span>
              <strong className="block text-sm text-[#101828]">{title}</strong>
              <span className="text-sm text-[#667085]">{text}</span>
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E6EAF2] bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-[#101828]/10"
    >
      <button
        type="button"
        className={cn(
          'relative aspect-[1.08] overflow-hidden bg-gradient-to-br text-left',
          product.palette,
        )}
        aria-label={`Preview ${product.name}`}
      >
        {product.badge ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#6D4AFF] shadow">
            {product.badge}
          </span>
        ) : null}
        <span className="absolute inset-0 grid place-items-center transition duration-300 group-hover:scale-105">
          <span className="relative size-36">
            <span className="absolute inset-x-4 bottom-0 h-16 rounded-2xl bg-white/80 shadow-xl" />
            <span className="absolute left-0 top-8 size-20 -rotate-12 rounded-2xl bg-[#6D4AFF] shadow-lg" />
            <span className="absolute right-0 top-2 size-24 rounded-full bg-[#247BFE] shadow-lg" />
            <Gift className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white" />
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={`${liked ? 'Remove' : 'Add'} ${product.name} from wishlist`}
        className={cn(
          'absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white shadow transition hover:scale-110',
          liked ? 'text-[#F04438]' : 'text-[#667085] hover:text-[#F04438]',
        )}
        onClick={() => setLiked((value) => !value)}
      >
        <Heart className={cn('size-4', liked && 'fill-current')} />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase text-[#247BFE]">
          {product.category}
        </p>
        <button
          type="button"
          className="mt-2 min-h-12 text-left text-base font-extrabold leading-6 text-[#101828] transition hover:text-[#6D4AFF]"
        >
          {product.name}
        </button>
        <div className="mt-3 flex items-center gap-1 text-sm">
          <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
          <span className="font-bold text-[#101828]">{product.rating}</span>
          <span className="text-[#667085]">({product.reviewCount} reviews)</span>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black text-[#101828]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice ? (
            <span className="text-sm font-semibold text-[#98A2B3] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          {discount ? (
            <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-xs font-extrabold text-[#039855]">
              {discount}% OFF
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          className={cn(
            'mt-5 h-11 w-full rounded-xl font-bold text-white',
            added ? 'bg-[#039855] hover:bg-[#039855]' : 'bg-[#101828] hover:bg-[#6D4AFF]',
          )}
          onClick={() => {
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1400);
          }}
        >
          {added ? 'Added' : 'Add to Cart'}
        </Button>
      </div>
    </motion.article>
  );
}

export function Footer() {
  const columns = [
    { title: 'Quick Links', links: ['Home', 'Shop', 'New Arrivals', 'Best Sellers', 'Offers'] },
    { title: 'Customer Help', links: ['Contact Us', 'Shipping', 'Returns', 'FAQ', 'Track Order'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms & Conditions', 'Refund Policy'] },
  ];

  return (
    <footer className="mt-10 bg-[#101828] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo inverse />
          <p className="mt-5 max-w-sm leading-7 text-white/65">
            Making childhood more joyful with safe, creative and exciting toys
            for every little explorer.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              ['Instagram', ThumbsUp],
              ['Facebook', Video],
              ['YouTube', PlayCircle],
            ].map(([label, Icon]) => (
              <button
                type="button"
                key={label as string}
                aria-label={label as string}
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/18"
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-extrabold">{column.title}</h3>
            <div className="mt-5 grid gap-3">
              {column.links.map((link) =>
                link === 'Home' || link === 'Shop' ? (
                  <a
                    key={link}
                    href={link === 'Home' ? '/' : '/shop'}
                    className="text-sm text-white/65 transition hover:text-white"
                  >
                    {link}
                  </a>
                ) : (
                  <button
                    key={link}
                    type="button"
                    className="text-left text-sm text-white/65 transition hover:text-white"
                  >
                    {link}
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 px-4 py-6 text-sm text-white/65 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span>Secure Payments Powered by Razorpay</span>
          {['UPI', 'Visa', 'Mastercard', 'RuPay'].map((item) => (
            <span
              key={item}
              className="rounded-lg bg-white/10 px-3 py-1 font-bold text-white"
            >
              {item}
            </span>
          ))}
        </div>
        <p>© 2026 ToyVerse. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export function PrimaryLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-6 text-base font-bold text-white shadow-lg shadow-[#6D4AFF]/20 transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25"
    >
      {children}
      <ArrowRight className="size-4" />
    </a>
  );
}
