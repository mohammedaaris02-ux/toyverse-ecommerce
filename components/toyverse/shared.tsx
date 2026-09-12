'use client';

/* eslint-disable next/no-html-link-for-pages */

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef, useState, type ElementType } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Blocks,
  Eye,
  Gift,
  Heart,
  LockKeyhole,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/product-types';
import { cn } from '@/lib/utils';
import { ShopMenu } from '@/components/toyverse/ShopMenu';
import {
  useCustomerStore,
  type CustomerPanel,
} from '@/components/customer/CustomerStore';
import { AccountMenu } from '@/components/account/AccountMenu';

export const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
} as const;

const navItems = [
  { label: 'Home', href: '/', path: '/' },
  { label: 'Shop', href: '/shop', path: '/shop' },
  { label: 'About', href: '/about', path: '/about' },
  { label: 'Contact', href: '/contact', path: '/contact' },
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      href="/"
      className="flex items-center gap-2.5"
      aria-label="ToyVerse home"
    >
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
  onClick,
  tooltip,
}: {
  label: string;
  icon: ElementType;
  count?: number;
  onClick: () => void;
  tooltip?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={tooltip || label}
      onClick={onClick}
      className="relative grid size-11 place-items-center rounded-xl border border-[#E6EAF2] bg-white text-[#344054] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#6D4AFF]/30 hover:bg-[#F2EFFF] hover:text-[#6D4AFF] hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25"
    >
      <Icon className="size-4" />
      {count ? (
        <motion.span
          key={count}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          aria-label={`${count} items`}
          className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#247BFE] text-[10px] font-bold text-white"
        >
          {count > 99 ? '99+' : count}
        </motion.span>
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
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const store = useCustomerStore();
  function openPanel(panel: CustomerPanel) {
    setOpen(false);
    store.setPanel(panel);
  }
  function customerIcons(mobile = false) {
    return (
      <>
        <IconButton
          label="Search products"
          icon={Search}
          onClick={() => openPanel('search')}
        />
        <AccountMenu
          key={mobile ? String(open) : 'desktop'}
          mobile={mobile}
          onNavigate={() => setOpen(false)}
        />
        <IconButton
          label="Wishlist"
          icon={Heart}
          count={store.wishlistCount}
          onClick={() => openPanel('wishlist')}
        />
        <IconButton
          label="Shopping cart"
          icon={ShoppingCart}
          count={store.cartCount}
          onClick={() => openPanel('cart')}
        />
      </>
    );
  }

  useEffect(() => {
    let compact = false;
    function onScroll() {
      const next = window.scrollY > 20;
      if (next !== compact) {
        compact = next;
        setScrolled(next);
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  function isActive(path: string) {
    if (path === '/') return pathname === '/';
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      (path === '/shop' &&
        (pathname.startsWith('/product/') || pathname === '/categories'))
    );
  }

  function menuItems(mobile = false) {
    return navItems.map((item) => {
      const active = isActive(item.path);
      if (item.path === '/shop')
        return (
          <ShopMenu
            key="shop"
            active={active}
            mobile={mobile}
            onNavigate={() => setOpen(false)}
          />
        );
      const className = cn(
        'relative flex min-h-11 items-center whitespace-nowrap rounded-[10px] px-3 text-sm font-semibold transition duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30',
        active
          ? 'bg-[#F2EFFF] text-[#6D4AFF]!'
          : 'text-[#475569]! hover:bg-[#F2EFFF]/70 hover:text-[#247BFE]!',
        mobile && 'w-full text-left',
      );
      const content = (
        <>
          {item.label}
          {active && (
            <span
              aria-hidden="true"
              className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[#6D4AFF] to-[#247BFE]"
            />
          )}
        </>
      );
      return item.href === '#' ? (
        <button
          key={item.label}
          type="button"
          aria-current={active ? 'page' : undefined}
          className={className}
          onClick={() => setOpen(false)}
        >
          {content}
        </button>
      ) : (
        <a
          key={item.label}
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={className}
          onClick={() => setOpen(false)}
        >
          {content}
        </a>
      );
    });
  }

  return (
    <header
      data-toyverse-header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 motion-reduce:transition-none',
        scrolled
          ? 'border-[#0F172A]/6 bg-white/86 shadow-[0_8px_30px_rgb(15_23_42/6%)] backdrop-blur-[14px]'
          : 'border-[#E6EAF2]/60 bg-white shadow-none',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 motion-reduce:transition-none sm:px-6 lg:px-8',
          scrolled ? 'h-16 xl:h-[68px]' : 'h-[72px] xl:h-20',
        )}
      >
        <div className="shrink-0 rounded-xl transition duration-300 hover:scale-[1.02] hover:drop-shadow-[0_0_8px_rgb(109_74_255/15%)] motion-reduce:transform-none [&>a]:rounded-xl [&>a]:focus-visible:outline-none [&>a]:focus-visible:ring-3 [&>a]:focus-visible:ring-[#6D4AFF]/30">
          <Logo />
        </div>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 xl:flex"
        >
          {menuItems()}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <div className="hidden items-center gap-2 sm:flex">
            {customerIcons()}
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-[#E6EAF2] bg-white text-[#101828] transition hover:bg-[#F2EFFF] hover:text-[#247BFE] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30 xl:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="toyverse-mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        id="toyverse-mobile-menu"
        aria-label="Mobile navigation"
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-[#101828]/30 backdrop:backdrop-blur-sm"
      >
        <button
          type="button"
          aria-label="Dismiss navigation"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-y-0 right-0 w-[min(86vw,360px)] overflow-y-auto border-l border-[#E6EAF2] bg-white p-5 shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-300">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-xl bg-[#F2EFFF] text-[#6D4AFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile menu" className="grid gap-2">
            {menuItems(true)}
          </nav>
          <div className="mt-7 grid grid-cols-4 gap-2">
            {customerIcons(true)}
          </div>
        </div>
      </dialog>
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
    <section
      className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}
    >
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

export function ProductCard({
  product,
  showDetails = false,
}: {
  product: Product;
  showDetails?: boolean;
}) {
  const store = useCustomerStore();
  const liked = store.wishlist.includes(product.id);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const productImage =
    'image' in product && typeof product.image === 'string'
      ? product.image
      : null;

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E6EAF2] bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-[#101828]/10"
    >
      <button
        type="button"
        className={cn(
          'relative h-52 w-full shrink-0 overflow-hidden bg-gradient-to-br text-left',
          product.palette,
        )}
        aria-label={`Preview ${product.name}`}
      >
        {product.badge ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#6D4AFF] shadow">
            {product.badge}
          </span>
        ) : null}
        {productImage ? (
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center transition duration-300 group-hover:scale-105">
            <span className="relative size-36">
              <span className="absolute inset-x-4 bottom-0 h-16 rounded-2xl bg-white/80 shadow-xl" />
              <span className="absolute left-0 top-8 size-20 -rotate-12 rounded-2xl bg-[#6D4AFF] shadow-lg" />
              <span className="absolute right-0 top-2 size-24 rounded-full bg-[#247BFE] shadow-lg" />
              <Gift className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white" />
            </span>
          </span>
        )}
      </button>
      <button
        type="button"
        aria-label={`${liked ? 'Remove' : 'Add'} ${product.name} ${liked ? 'from' : 'to'} wishlist`}
        aria-pressed={liked}
        className={cn(
          'absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white shadow transition hover:scale-110',
          liked ? 'text-[#F04438]' : 'text-[#667085] hover:text-[#F04438]',
        )}
        onClick={() => store.toggleWishlist(product.id)}
      >
        <Heart className={cn('size-4', liked && 'fill-current')} />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="min-h-4 text-xs font-bold uppercase text-[#247BFE]">
          {product.category}
        </p>
        <button
          type="button"
          className="mt-2 min-h-12 overflow-hidden text-left text-base font-extrabold leading-6 text-[#101828] transition [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] hover:text-[#6D4AFF]"
        >
          {product.name}
        </button>
        <div className="mt-3 flex min-h-5 items-center gap-1 text-sm">
          <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
          <span className="font-bold text-[#101828]">{product.rating}</span>
          <span className="text-[#667085]">
            ({product.reviewCount} reviews)
          </span>
        </div>
        <div className="mt-4">
          <div className="flex min-h-7 flex-wrap items-end gap-2">
            <span className="text-xl font-black text-[#101828]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="text-sm font-semibold text-[#98A2B3] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            ) : null}
          </div>
          <div className="mt-2 min-h-7">
            {discount ? (
              <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-xs font-extrabold text-[#039855]">
                {discount}% OFF
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-5">
          {showDetails ? (
            <a
              href={`/product/${product.slug}`}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#6D4AFF]/25 bg-gradient-to-r from-[#F2EFFF] to-[#EDF6FF] text-sm font-semibold text-[#5B3DF5] transition duration-200 hover:-translate-y-px hover:from-[#6D4AFF] hover:to-[#247BFE] hover:text-white hover:shadow-lg hover:shadow-[#6D4AFF]/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
            >
              <Eye className="size-4" /> View Details
            </a>
          ) : null}
          <Button
            type="button"
            className={cn(
              'h-11 w-full rounded-xl font-bold text-white',
              added
                ? 'bg-[#039855] hover:bg-[#039855]'
                : 'bg-[#101828] hover:bg-[#6D4AFF]',
            )}
            onClick={() => {
              if (!store.addToCart(product.id)) return;
              setAdded(true);
              if (addedTimer.current) clearTimeout(addedTimer.current);
              addedTimer.current = setTimeout(() => setAdded(false), 1400);
            }}
          >
            {added ? 'Added' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function Footer() {
  const columns = [
    {
      title: 'Shop',
      links: [
        ['All Products', '/shop'],
        ['Categories', '/categories'],
        ['New Arrivals', '/shop?filter=new-arrivals'],
        ['Best Sellers', '/shop?filter=best-sellers'],
        ['Offers', '/shop?filter=offers'],
      ],
    },
    {
      title: 'Customer',
      links: [
        ['My Account', '/account/profile'],
        ['My Orders', '/account/orders'],
        ['Contact', '/contact'],
      ],
    },
    {
      title: 'Company',
      links: [
        ['About Us', '/about'],
        ['Contact Us', '/contact'],
      ],
    },
  ];
  const store = useCustomerStore();

  return (
    <footer className="mt-10 bg-[#101828] text-white">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo inverse />
          <p className="mt-5 max-w-sm leading-7 text-white/65">
            Play, learn and grow with toys made for happy little moments.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-extrabold">{column.title}</h3>
            <div className="mt-5 grid gap-3">
              {column.links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        ))}
        <div>
          <h3 className="font-extrabold">More</h3>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => store.setPanel('wishlist')}
              className="text-left text-sm text-white/65 transition hover:text-white"
            >
              Wishlist
            </button>
            <button
              type="button"
              onClick={() => store.setPanel('cart')}
              className="text-left text-sm text-white/65 transition hover:text-white"
            >
              Cart
            </button>
            <a
              href="/privacy-policy"
              className="text-sm text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-and-conditions"
              className="text-sm text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 px-4 py-6 text-sm text-white/65 sm:px-6 lg:px-8">
        <span>Development demo checkout — no real payment is charged.</span>
        <p>© {new Date().getFullYear()} ToyVerse. All rights reserved.</p>
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
