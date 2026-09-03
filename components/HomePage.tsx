'use client';

import { useState, type ElementType } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Check,
  ChevronRight,
  Gift,
  Heart,
  LockKeyhole,
  Menu,
  PackageCheck,
  PlayCircle,
  Quote,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  User,
  X,
  Video,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/categories';
import { bestSellers, newArrivals, type Product } from '@/data/products';
import { testimonials } from '@/data/testimonials';
import { cn } from '@/lib/utils';

const navItems = [
  'Home',
  'Shop',
  'Categories',
  'New Arrivals',
  'Best Sellers',
  'Offers',
  'About',
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
} as const;

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-2.5" aria-label="ToyVerse home">
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

function AnnouncementBar() {
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

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EAF2]/80 bg-white/86 shadow-[0_8px_30px_rgb(16_24_40/5%)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
              className="text-sm font-semibold text-[#475467] transition hover:text-[#6D4AFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
            >
              {item}
            </a>
          ))}
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
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-xl px-3 py-3 text-sm font-semibold text-[#344054] transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF]"
              onClick={() => setOpen(false)}
            >
              {item}
            </button>
          ))}
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

function ToyVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F2EFFF] via-[#EDF6FF] to-[#FFF8E1] shadow-[0_30px_80px_rgb(36_123_254/14%)]',
        compact && 'max-w-[320px] rounded-[1.5rem]',
      )}
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

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:pb-24 lg:pt-16">
      <motion.div {...fadeUp} className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#6D4AFF]/15 bg-[#F2EFFF] px-4 py-2 text-sm font-bold text-[#6D4AFF]">
          <Sparkles className="size-4" />
          Fun Meets Learning
        </span>
        <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-[0] text-[#101828] sm:text-5xl lg:text-6xl">
          Big Smiles Start With The{' '}
          <span className="bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] bg-clip-text text-transparent">
            Perfect Toy
          </span>
          .
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#667085]">
          Discover safe, creative and exciting toys designed to make every
          moment of childhood more joyful.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="h-12 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-6 text-base font-bold shadow-lg shadow-[#6D4AFF]/20 hover:scale-[1.02]">
            Shop Toys <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-[#D9E2F0] bg-white px-6 text-base font-bold text-[#101828] hover:bg-[#EDF6FF]"
          >
            Explore Categories
          </Button>
        </div>
        <div className="mt-7 flex flex-wrap gap-4 text-sm font-semibold text-[#344054]">
          {['100% Safe Toys', 'Fast Delivery', 'Easy Returns'].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#ECFDF5] text-[#039855]">
                <Check className="size-3.5" />
              </span>
              {item}
            </span>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="relative"
      >
        <ToyVisual />
        {[
          ['4.9 ★ Rating', 'left-0 top-10'],
          ['10K+ Happy Parents', 'right-0 top-1/2'],
          ['Best Seller', 'bottom-8 left-12'],
        ].map(([text, position], index) => (
          <motion.div
            key={text}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3 + index * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-[#101828] shadow-xl backdrop-blur',
              position,
            )}
          >
            {text}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function TrustBar() {
  const items = [
    ['Safe & Certified', 'Quality checked products', ShieldCheck],
    ['Fast Delivery', 'Quick doorstep delivery', Truck],
    ['Easy Returns', 'Hassle-free returns', PackageCheck],
    ['Secure Payment', 'Trusted payment protection', LockKeyhole],
  ] as const;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: string;
}) {
  return (
    <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-3xl font-black tracking-[0] text-[#101828] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#667085]">
          {subtitle}
        </p>
      </div>
      {action ? (
        <a
          href="#best-sellers"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D9E2F0] bg-white px-4 text-sm font-bold text-[#6D4AFF] transition hover:border-[#6D4AFF]/30 hover:bg-[#F2EFFF]"
        >
          {action} <ChevronRight className="size-4" />
        </a>
      ) : null}
    </div>
  );
}

function Categories() {
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <SectionHeading
        title="Shop By Category"
        subtitle="Find the perfect toy for every little explorer."
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ title, accent, icon: Icon }) => (
          <a
            href={`#${title.toLowerCase().replaceAll(' ', '-')}`}
            key={title}
            className="group flex min-h-56 flex-col justify-between rounded-2xl border border-[#E6EAF2] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className={cn(
                'grid aspect-square place-items-center overflow-hidden rounded-2xl',
                accent,
              )}
            >
              <div className="grid size-20 place-items-center rounded-3xl bg-white/80 text-[#6D4AFF] shadow-lg transition duration-300 group-hover:scale-110">
                <Icon className="size-9" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#101828]">{title}</h3>
              <ArrowRight className="size-4 shrink-0 text-[#247BFE]" />
            </div>
          </a>
        ))}
      </div>
    </motion.section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E6EAF2] bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-[#101828]/10"
    >
      <div
        className={cn(
          'relative aspect-[1.08] overflow-hidden bg-gradient-to-br',
          product.palette,
        )}
      >
        {product.badge ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#6D4AFF] shadow">
            {product.badge}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white text-[#667085] shadow transition hover:scale-110 hover:text-[#F04438]"
        >
          <Heart className="size-4" />
        </button>
        <div className="absolute inset-0 grid place-items-center transition duration-300 group-hover:scale-105">
          <div className="relative size-36">
            <div className="absolute inset-x-4 bottom-0 h-16 rounded-2xl bg-white/80 shadow-xl" />
            <div className="absolute left-0 top-8 size-20 -rotate-12 rounded-2xl bg-[#6D4AFF] shadow-lg" />
            <div className="absolute right-0 top-2 size-24 rounded-full bg-[#247BFE] shadow-lg" />
            <Gift className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase text-[#247BFE]">
          {product.category}
        </p>
        <h3 className="mt-2 min-h-12 text-base font-extrabold leading-6 text-[#101828]">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center gap-1 text-sm">
          <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
          <span className="font-bold text-[#101828]">{product.rating}</span>
          <span className="text-[#667085]">({product.reviews} reviews)</span>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black text-[#101828]">
            {product.price}
          </span>
          <span className="text-sm font-semibold text-[#98A2B3] line-through">
            {product.originalPrice}
          </span>
          <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-xs font-extrabold text-[#039855]">
            {product.discount}
          </span>
        </div>
        <Button className="mt-5 h-11 w-full rounded-xl bg-[#101828] font-bold text-white hover:bg-[#6D4AFF]">
          Add to Cart
        </Button>
      </div>
    </motion.article>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  action,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  action?: string;
}) {
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <SectionHeading title={title} subtitle={subtitle} action={action} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </motion.section>
  );
}

function PromoBanner() {
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="relative grid overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] p-8 text-white shadow-2xl shadow-[#247BFE]/20 lg:grid-cols-[1fr_360px] lg:p-12">
        <div className="absolute right-12 top-8 size-28 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-1/2 size-40 rounded-full bg-white/10" />
        <div className="relative z-10">
          <span className="text-sm font-extrabold uppercase tracking-[0.12em] text-white/75">
            Special Offer
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-[0] sm:text-5xl">
            Make Playtime More Magical
          </h2>
          <p className="mt-4 text-xl font-semibold text-white/86">
            Up to 30% Off Selected Toys
          </p>
          <Button className="mt-8 h-12 rounded-xl bg-white px-6 font-extrabold text-[#6D4AFF] hover:bg-[#FFF8E1]">
            Shop Offers
          </Button>
        </div>
        <div className="relative z-10 mt-8 lg:mt-0">
          <ToyVisual compact />
        </div>
      </div>
    </motion.section>
  );
}

function WhyChooseUs() {
  const items = [
    [
      'Child-Safe Products',
      "Carefully selected toys designed with children's safety in mind.",
      ShieldCheck,
    ],
    ['Quality You Can Trust', 'Durable, reliable and parent-approved products.', BadgeCheck],
    ['Fast & Reliable Delivery', "Quick delivery so the fun doesn't have to wait.", Truck],
    ['Easy Shopping Experience', 'Simple browsing, checkout and customer support.', Zap],
  ] as const;

  return (
    <section className="bg-[#F8FAFC] py-20">
      <motion.div {...fadeUp} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why Parents Choose ToyVerse"
          subtitle="Everything we do is designed to make shopping for your little ones simple, safe and joyful."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([title, text, Icon]) => (
            <article
              key={title}
              className="min-h-64 rounded-2xl border border-[#E6EAF2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-[#F2EFFF] text-[#6D4AFF]">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-6 text-lg font-extrabold text-[#101828]">
                {title}
              </h3>
              <p className="mt-3 leading-7 text-[#667085]">{text}</p>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function EducationalBanner() {
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="grid items-center gap-10 rounded-[2rem] bg-gradient-to-br from-[#F2EFFF] to-[#EDF6FF] p-6 lg:grid-cols-2 lg:p-10">
        <ToyVisual compact />
        <div>
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#6D4AFF]">
            Learn Through Play
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-[0] text-[#101828] sm:text-5xl">
            Where Fun Meets Learning
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#667085]">
            Explore engaging educational toys designed to build creativity,
            problem-solving skills and confidence while children play.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              'Boosts creativity',
              'Supports early learning',
              'Encourages problem solving',
            ].map((point) => (
              <span key={point} className="flex items-center gap-3 font-bold text-[#344054]">
                <Check className="size-5 text-[#039855]" /> {point}
              </span>
            ))}
          </div>
          <Button className="mt-8 h-12 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-6 font-extrabold">
            Explore Learning Toys
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

function Testimonials() {
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <SectionHeading
        title="Loved By Parents"
        subtitle="Real experiences from families who shop with ToyVerse."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="relative min-h-72 rounded-2xl border border-[#E6EAF2] bg-white p-6 shadow-sm"
          >
            <Quote className="absolute right-6 top-6 size-8 text-[#F2EFFF]" />
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#6D4AFF] to-[#247BFE] font-black text-white">
                {testimonial.name.charAt(0)}
              </span>
              <span>
                <strong className="block text-[#101828]">{testimonial.name}</strong>
                <span className="text-xs font-bold text-[#039855]">
                  Verified Buyer
                </span>
              </span>
            </div>
            <div className="mt-6 flex text-[#FFB020]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 leading-7 text-[#667085]">
              &quot;{testimonial.review}&quot;
            </p>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function Newsletter() {
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="rounded-[2rem] border border-[#E6EAF2] bg-gradient-to-br from-[#F2EFFF] to-[#EDF6FF] p-7 text-center sm:p-12">
        <h2 className="text-3xl font-black tracking-[0] text-[#101828] sm:text-4xl">
          Join The ToyVerse Family
        </h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#667085]">
          Get new toy launches, parenting picks and exclusive offers straight to
          your inbox.
        </p>
        <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email address"
            className="h-12 rounded-xl border-white bg-white px-4 shadow-sm"
          />
          <Button
            type="button"
            className="h-12 rounded-xl bg-[#101828] px-7 font-extrabold"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </motion.section>
  );
}

function Footer() {
  const columns = [
    ['Quick Links', ['Home', 'Shop', 'New Arrivals', 'Best Sellers', 'Offers']],
    ['Customer Help', ['Contact Us', 'Shipping', 'Returns', 'FAQ', 'Track Order']],
    ['Legal', ['Privacy Policy', 'Terms & Conditions', 'Refund Policy']],
  ] as const;

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
              <a
                href={`#${(label as string).toLowerCase()}`}
                key={label as string}
                aria-label={label as string}
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/18"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <h3 className="font-extrabold">{title}</h3>
            <div className="mt-5 grid gap-3">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
                  className="text-sm text-white/65 transition hover:text-white"
                >
                  {link}
                </a>
              ))}
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

export function HomePage() {
  return (
    <main id="home" className="min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      <Hero />
      <TrustBar />
      <Categories />
      <ProductSection
        title="Our Best Sellers"
        subtitle="Most-loved toys picked by parents and kids."
        products={bestSellers}
        action="View All"
      />
      <PromoBanner />
      <ProductSection
        title="Fresh Finds For Little Ones"
        subtitle="Discover the newest toys added to ToyVerse."
        products={newArrivals}
      />
      <WhyChooseUs />
      <EducationalBanner />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  );
}
