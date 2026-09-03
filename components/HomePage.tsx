'use client';

/* eslint-disable next/no-html-link-for-pages */

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AnnouncementBar,
  fadeUp,
  Footer,
  Header,
  PrimaryLinkButton,
  ProductCard,
  ToyVisual,
  TrustBar,
} from '@/components/toyverse/shared';
import { categories } from '@/data/categories';
import { bestSellers, newArrivals, type Product } from '@/data/products';
import { testimonials } from '@/data/testimonials';
import { cn } from '@/lib/utils';

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
          <PrimaryLinkButton href="/shop">Shop Toys</PrimaryLinkButton>
          <a
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D9E2F0] bg-white px-6 text-base font-bold text-[#101828] transition hover:bg-[#EDF6FF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25"
          >
            Explore Categories
          </a>
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
          href="/shop"
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
            href="/shop"
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
          <ProductCard key={product.id} product={product} />
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
          <a
            href="/shop"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 font-extrabold text-[#6D4AFF] transition hover:bg-[#FFF8E1] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/40"
          >
            Shop Offers
          </a>
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
          <a
            href="/shop"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-6 font-extrabold text-white transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25"
          >
            Explore Learning Toys
          </a>
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
