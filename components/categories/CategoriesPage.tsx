'use client';

/* eslint-disable next/no-html-link-for-pages, next/no-img-element */
import {
  ArrowRight,
  Baby,
  Compass,
  GraduationCap,
  Palette,
  Sparkles,
} from 'lucide-react';
import {
  AnnouncementBar,
  Footer,
  Header,
  ProductCard,
  ToyVisual,
  TrustBar,
} from '@/components/toyverse/shared';
import type { CustomerProduct } from '@/lib/customer-products';
import type { CustomerCategory } from '@/lib/customer-products-server';
import { cn } from '@/lib/utils';

const ages = [
  {
    age: '0-2',
    description: 'Gentle textures and first discoveries.',
    icon: Baby,
    accent: 'bg-[#FFF0F6]',
  },
  {
    age: '3-5',
    description: 'Imagination takes its first big steps.',
    icon: Palette,
    accent: 'bg-[#F2EFFF]',
  },
  {
    age: '6-8',
    description: 'Create, build and solve new challenges.',
    icon: GraduationCap,
    accent: 'bg-[#EDF6FF]',
  },
  {
    age: '9-12',
    description: 'More adventure for curious minds.',
    icon: Compass,
    accent: 'bg-[#ECFDF5]',
  },
];
const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';

const categoryIcons = [GraduationCap, Palette, Compass, Baby];
const categoryAccents = [
  'bg-[#F2EFFF]',
  'bg-[#EDF6FF]',
  'bg-[#FFF0F6]',
  'bg-[#ECFDF5]',
];

export function CategoriesPage({
  products,
  categories,
}: {
  products: CustomerProduct[];
  categories: CustomerCategory[];
}) {
  const popular = products.slice(0, 4);
  return (
    <main className="min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      <section className="bg-[#F2EFFF]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6D4AFF]">
            <Sparkles className="size-4" />
            Explore Toy Categories
          </span>
          <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-[#101828] sm:text-4xl">
            Find The Perfect Toy For Every Little Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#667085]">
            Browse toys by interest, play style and age to discover something
            they&apos;ll love.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black text-[#101828]">Shop By Category</h2>
        <p className="mt-3 text-[#667085]">
          Explore our most-loved toy collections.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <a
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={cn(
                  'group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E6EAF2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl',
                  focus,
                )}
              >
                <div
                  className={cn(
                    'relative grid h-44 place-items-center overflow-hidden',
                    categoryAccents[index % categoryAccents.length],
                  )}
                >
                  <img
                    alt={`${category.name} collection`}
                    src={
                      category.imageUrl ||
                      `https://placehold.co/640x320/F2EFFF/6D4AFF/png?text=${encodeURIComponent(category.name)}`
                    }
                    className="absolute inset-0 h-full w-full object-cover opacity-20 transition duration-300 group-hover:scale-105"
                  />
                  <span className="relative grid size-20 place-items-center rounded-2xl bg-white/90 text-[#6D4AFF] shadow-sm transition duration-300 group-hover:scale-105">
                    <Icon className="size-10" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-extrabold text-[#101828]">
                      {category.name}
                    </h3>
                    <span className="text-xs font-semibold text-[#667085]">
                      {category.productCount} Products
                    </span>
                  </div>
                  <p className="mb-5 mt-3 leading-7 text-[#667085]">
                    {category.description ||
                      'Discover toys selected for this collection.'}
                  </p>
                  <span className="mt-auto flex items-center gap-2 text-sm font-bold text-[#6D4AFF]">
                    Explore{' '}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <section className="bg-[#EDF6FF]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <ToyVisual compact />
          <div>
            <span className="text-sm font-bold uppercase text-[#6D4AFF]">
              Featured Category
            </span>
            <h2 className="mt-3 text-3xl font-black text-[#101828]">
              Learning Can Be Fun
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#667085]">
              Discover educational toys designed to support creativity,
              problem-solving and early learning through play.
            </p>
            <a
              href="/shop?category=educational-toys"
              className={cn(
                'mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#6D4AFF] px-5 py-3 text-sm font-bold text-white!',
                focus,
              )}
            >
              Explore Educational Toys
              <ArrowRight className="size-4 shrink-0" />
            </a>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black text-[#101828]">Shop By Age</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ages.map(({ age, description, icon: Icon, accent }) => (
            <a
              key={age}
              href={`/shop?age=${age}`}
              className={cn(
                'group flex flex-col rounded-2xl border border-[#E6EAF2] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg',
                focus,
              )}
            >
              <span
                className={cn(
                  'grid size-12 place-items-center rounded-xl text-[#6D4AFF]',
                  accent,
                )}
              >
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-[#101828]">
                {age} Years
              </h3>
              <p className="mb-5 mt-3 leading-7 text-[#667085]">
                {description}
              </p>
              <span className="mt-auto flex items-center gap-2 text-sm font-bold text-[#6D4AFF]">
                Explore
                <ArrowRight className="size-4" />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-black text-[#101828]">
          Popular Picks Across Categories
        </h2>
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} showDetails />
          ))}
        </div>
      </section>
      <TrustBar className="py-8" />
      <Footer />
    </main>
  );
}
