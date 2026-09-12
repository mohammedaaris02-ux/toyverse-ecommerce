'use client';
/* eslint-disable next/no-html-link-for-pages */
import { motion, MotionConfig } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Compass,
  Heart,
  Lightbulb,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  AnnouncementBar,
  fadeUp,
  Footer,
  Header,
  ToyVisual,
} from '@/components/toyverse/shared';

const wrap = 'mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8';
const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';
const purpose = [
  {
    title: 'Mission',
    text: 'Make safe and meaningful toys easier for every family to discover.',
    icon: Target,
    color: 'bg-[#F2EFFF]',
  },
  {
    title: 'Vision',
    text: 'Build a trusted modern toy platform where play, learning and creativity come together.',
    icon: Compass,
    color: 'bg-[#EDF6FF]',
  },
  {
    title: 'Our Promise',
    text: 'Clear product information, thoughtful selection and a parent-first shopping experience.',
    icon: Heart,
    color: 'bg-[#FFF0F6]',
  },
];
const reasons = [
  {
    title: 'Carefully Curated',
    text: 'We focus on useful, joyful and age-appropriate toys.',
    icon: Sparkles,
  },
  {
    title: 'Safety Focused',
    text: 'Products are selected with quality and child-friendly use in mind.',
    icon: ShieldCheck,
  },
  {
    title: 'Learning Through Play',
    text: 'We highlight toys that encourage creativity, curiosity and problem-solving.',
    icon: Lightbulb,
  },
  {
    title: 'Easy Shopping',
    text: 'Clear categories, helpful product details and a simple buying experience.',
    icon: ShoppingBag,
  },
];
const steps = [
  [
    'Product Selection',
    'We choose toys based on usefulness, age suitability and play value.',
  ],
  [
    'Quality Review',
    'We review product information, materials and practical use.',
  ],
  [
    'Clear Product Details',
    'We present useful information so parents can make informed decisions.',
  ],
  [
    'Customer Feedback',
    'We use reviews and customer experience to improve recommendations.',
  ],
];

export function AboutPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#101828]">
        <AnnouncementBar />
        <Header />
        <section className="bg-[#F2EFFF]">
          <div
            className={`${wrap} grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]`}
          >
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6D4AFF]">
                <Sparkles className="size-4" />
                About ToyVerse
              </span>
              <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Making Childhood More Joyful,{' '}
                <span className="bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] bg-clip-text text-transparent">
                  One Toy At A Time.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#667085]">
                ToyVerse is a modern toy shopping destination built to help
                parents discover safe, creative and exciting products that make
                playtime more meaningful.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <span>10K+ Happy Parents</span>
                <span>100+ Curated Toys</span>
              </div>
            </motion.div>
            <motion.div {...fadeUp}>
              <ToyVisual />
            </motion.div>
          </div>
        </section>
        <motion.section
          {...fadeUp}
          className={`${wrap} grid items-center gap-10 lg:grid-cols-2`}
        >
          <div>
            <h2 className="text-3xl font-black">Our Story</h2>
            <div className="mt-6 space-y-4 leading-8 text-[#667085]">
              <p>
                ToyVerse started with a simple idea: finding the right toy
                should feel exciting, easy and trustworthy.
              </p>
              <p>
                Parents often have to choose between too many products without
                clear information about quality, age suitability or learning
                value. ToyVerse was designed to simplify that experience by
                bringing carefully selected toys into one modern, easy-to-use
                store.
              </p>
              <p>
                Our goal is to combine joyful products with a smooth shopping
                experience, helping families spend less time searching and more
                time creating happy memories.
              </p>
            </div>
          </div>
          <ToyVisual compact />
        </motion.section>
        <section className={wrap}>
          <h2 className="mb-8 text-3xl font-black">What We Believe In</h2>
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {purpose.map(({ title, text, icon: Icon, color }) => (
              <motion.article
                {...fadeUp}
                whileHover={{ y: -4 }}
                key={title}
                className={`h-full rounded-2xl border border-[#E6EAF2] p-7 ${color}`}
              >
                <span className="grid size-12 place-items-center rounded-xl bg-white text-[#6D4AFF]">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 leading-7 text-[#667085]">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="bg-white">
          <div className={wrap}>
            <h2 className="mb-8 text-3xl font-black">
              Why Families Choose ToyVerse
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map(({ title, text, icon: Icon }) => (
                <motion.article
                  {...fadeUp}
                  key={title}
                  className="rounded-2xl border border-[#E6EAF2] p-6 shadow-sm"
                >
                  <Icon className="size-7 text-[#247BFE]" />
                  <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                  <p className="mt-3 leading-7 text-[#667085]">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
        <section className={wrap}>
          <h2 className="mb-9 text-3xl font-black">
            How We Think About Quality
          </h2>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], index) => (
              <li key={title} className="border-t-2 border-[#6D4AFF]/20 pt-5">
                <span className="text-3xl font-black text-[#6D4AFF]">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-3 leading-7 text-[#667085]">{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="bg-[#EDF6FF]">
          <div className={wrap}>
            <h2 className="sr-only">ToyVerse In Numbers</h2>
            <motion.dl
              {...fadeUp}
              className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4"
            >
              {[
                ['10K+', 'Happy Parents'],
                ['100+', 'Curated Toys'],
                ['4.8/5', 'Average Rating'],
                ['6+', 'Toy Categories'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-sm font-semibold text-[#667085]">
                    {label}
                  </dt>
                  <dd className="mt-3 text-4xl font-black text-[#6D4AFF]">
                    {value}
                  </dd>
                </div>
              ))}
            </motion.dl>
            <p className="mt-6 text-center text-xs text-[#667085]">
              Illustrative brand figures for this portfolio project.
            </p>
          </div>
        </section>
        <section className={`${wrap} grid items-center gap-10 lg:grid-cols-2`}>
          <ToyVisual compact />
          <div>
            <h2 className="text-3xl font-black">
              Designed For Parents. Loved By Kids.
            </h2>
            <p className="mt-5 leading-8 text-[#667085]">
              From browsing by age and category to detailed product information,
              ToyVerse is designed to make toy shopping simple, clear and
              enjoyable.
            </p>
            <ul className="my-6 grid gap-4 sm:grid-cols-2">
              {[
                'Easy category discovery',
                'Clear age recommendations',
                'Transparent pricing',
                'Helpful ratings and reviews',
                'Secure checkout ready',
                'Fast support',
              ].map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2 text-sm font-semibold"
                >
                  <Check className="size-5 shrink-0 text-[#039855]" />
                  {text}
                </li>
              ))}
            </ul>
            <a href="/shop" className={`${button} bg-[#101828] text-white!`}>
              Explore Toys
              <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
        <section className="bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] text-white">
          <div className={`${wrap} text-center`}>
            <h2 className="text-3xl font-black">
              Ready To Find Their Next Favorite Toy?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/85">
              Explore safe, creative and exciting toys picked for every kind of
              little explorer.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/shop" className={`${button} bg-white text-[#6D4AFF]!`}>
                Shop Toys
                <ArrowRight className="size-4" />
              </a>
              <a
                href="/contact"
                className={`${button} border border-white/50 text-white! hover:bg-white/10`}
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </MotionConfig>
  );
}
