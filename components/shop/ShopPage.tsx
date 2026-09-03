'use client';

/* eslint-disable next/no-html-link-for-pages */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageCheck,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

import {
  AnnouncementBar,
  fadeUp,
  Footer,
  Header,
  ProductCard,
  ToyVisual,
  TrustBar,
} from '@/components/toyverse/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shopProducts, type Product } from '@/data/products';
import { cn } from '@/lib/utils';

const quickFilters = [
  'All Toys',
  'Educational',
  'Building Blocks',
  'Remote Control',
  'Dolls & Plush',
  'Outdoor',
  'Art & Creativity',
];

const categoryOptions = [
  'Educational Toys',
  'Building Blocks',
  'Remote Control',
  'Dolls & Plush',
  'Outdoor Toys',
  'Art & Creativity',
];

const ageOptions = ['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years'];
const priceOptions = ['Under ₹500', '₹500 - ₹999', '₹1,000 - ₹1,499', '₹1,500+'];
const ratingOptions = ['4★ & Above', '3★ & Above'];
const availabilityOptions = ['In Stock', 'On Sale'];

type SortOption = 'Featured' | 'Newest' | 'Price: Low to High' | 'Price: High to Low' | 'Top Rated';

type Filters = {
  categories: string[];
  ages: string[];
  prices: string[];
  ratings: string[];
  availability: string[];
};

const emptyFilters: Filters = {
  categories: [],
  ages: [],
  prices: [],
  ratings: [],
  availability: [],
};

function categoryFromQuickFilter(filter: string) {
  if (filter === 'All Toys') return null;
  if (filter === 'Educational') return 'Educational Toys';
  if (filter === 'Outdoor') return 'Outdoor Toys';
  return filter;
}

function priceMatches(product: Product, option: string) {
  if (option === 'Under ₹500') return product.price < 500;
  if (option === '₹500 - ₹999') return product.price >= 500 && product.price <= 999;
  if (option === '₹1,000 - ₹1,499') return product.price >= 1000 && product.price <= 1499;
  return product.price >= 1500;
}

function ShopHero() {
  return (
    <section className="bg-gradient-to-br from-[#F2EFFF] via-white to-[#EDF6FF]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <motion.div {...fadeUp}>
          <nav className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#667085]">
            <a href="/" className="transition hover:text-[#6D4AFF]">
              Home
            </a>
            <ChevronRight className="size-4" />
            <span className="text-[#6D4AFF]">Shop</span>
          </nav>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#6D4AFF] shadow-sm">
            <Sparkles className="size-4" />
            100+ Toys To Explore
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] tracking-[0] text-[#101828] sm:text-5xl">
            Find Their Next Favorite Toy
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#667085]">
            Explore playful, educational and exciting toys carefully selected
            for every stage of childhood.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block"
        >
          <ToyVisual compact />
        </motion.div>
      </div>
    </section>
  );
}

function CategoryQuickFilters({
  active,
  onChange,
}: {
  active: string;
  onChange: (filter: string) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {quickFilters.map((filter) => (
          <button
            type="button"
            key={filter}
            onClick={() => onChange(filter)}
            className={cn(
              'relative shrink-0 rounded-full border px-5 py-3 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25',
              active === filter
                ? 'border-transparent text-white'
                : 'border-[#E6EAF2] bg-white text-[#344054] hover:border-[#6D4AFF]/25 hover:text-[#6D4AFF]',
            )}
          >
            {active === filter ? (
              <motion.span
                layoutId="activeCategory"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6D4AFF] to-[#247BFE]"
                transition={{ duration: 0.25 }}
              />
            ) : null}
            <span className="relative z-10">{filter}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FilterGroup({
  title,
  options,
  values,
  onToggle,
}: {
  title: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="border-b border-[#E6EAF2] pb-5">
      <legend className="mb-4 text-sm font-black text-[#101828]">{title}</legend>
      <div className="grid gap-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#475467]"
          >
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => onToggle(option)}
              className="size-4 rounded border-[#D9E2F0] accent-[#6D4AFF]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FilterSidebar({
  filters,
  onToggle,
  onClear,
}: {
  filters: Filters;
  onToggle: (group: keyof Filters, value: string) => void;
  onClear: () => void;
}) {
  return (
    <aside className="rounded-2xl border border-[#E6EAF2] bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-[#101828]">
          <SlidersHorizontal className="size-5 text-[#6D4AFF]" />
          Filters
        </h2>
        <button
          type="button"
          className="text-sm font-extrabold text-[#6D4AFF]"
          onClick={onClear}
        >
          Clear Filters
        </button>
      </div>
      <div className="grid gap-5">
        <FilterGroup
          title="Categories"
          options={categoryOptions}
          values={filters.categories}
          onToggle={(value) => onToggle('categories', value)}
        />
        <FilterGroup
          title="Age Group"
          options={ageOptions}
          values={filters.ages}
          onToggle={(value) => onToggle('ages', value)}
        />
        <FilterGroup
          title="Price"
          options={priceOptions}
          values={filters.prices}
          onToggle={(value) => onToggle('prices', value)}
        />
        <FilterGroup
          title="Rating"
          options={ratingOptions}
          values={filters.ratings}
          onToggle={(value) => onToggle('ratings', value)}
        />
        <FilterGroup
          title="Availability"
          options={availabilityOptions}
          values={filters.availability}
          onToggle={(value) => onToggle('availability', value)}
        />
      </div>
    </aside>
  );
}

function ShopToolbar({
  count,
  search,
  sort,
  inStockOnly,
  onSaleOnly,
  onSearch,
  onSort,
  onInStockOnlyChange,
  onOnSaleOnlyChange,
  onClearQuickFilters,
  onOpenFilters,
}: {
  count: number;
  search: string;
  sort: SortOption;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  onSearch: (value: string) => void;
  onSort: (value: SortOption) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onOnSaleOnlyChange: () => void;
  onClearQuickFilters: () => void;
  onOpenFilters: () => void;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[#E6EAF2] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-extrabold text-[#101828]">Showing {count} Products</p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-[#D9E2F0] lg:hidden"
            onClick={onOpenFilters}
          >
            <Filter className="size-4" />
            Filters
          </Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="shop-search" className="relative block sm:w-72">
            <span className="sr-only">Search toys</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
            <Input
              id="shop-search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search toys..."
              className="h-11 rounded-xl border-[#D9E2F0] bg-[#F8FAFC] pl-10"
            />
          </label>
          <label className="sr-only" htmlFor="shop-sort">
            Sort products
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => onSort(event.target.value as SortOption)}
            className="h-11 rounded-xl border border-[#D9E2F0] bg-white px-3 text-sm font-bold text-[#344054] outline-none transition focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/20"
          >
            {[
              'Featured',
              'Newest',
              'Price: Low to High',
              'Price: High to Low',
              'Top Rated',
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E6EAF2] bg-white p-1.5 shadow-[0_8px_24px_rgb(16_24_40/4%)]">
            <div className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-extrabold text-[#101828]">
              <PackageCheck className="size-4 text-[#6D4AFF]" />
              <span>In Stock Only</span>
              <button
                type="button"
                role="switch"
                aria-checked={inStockOnly}
                aria-label="Show in-stock products only"
                onClick={() => onInStockOnlyChange(!inStockOnly)}
                className={cn(
                  'relative h-4 w-7 rounded-full transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25',
                  inStockOnly ? 'bg-[#6D4AFF]' : 'bg-[#D9E2F0]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition',
                    inStockOnly ? 'left-3.5' : 'left-0.5',
                  )}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={onOnSaleOnlyChange}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25',
                onSaleOnly
                  ? 'border-transparent bg-[#6D4AFF] text-white shadow-md shadow-[#6D4AFF]/20'
                  : 'border-[#E6EAF2] bg-[#F8FAFC] text-[#101828] hover:border-[#6D4AFF]/25 hover:text-[#6D4AFF]',
              )}
            >
              <BadgePercent className="size-4" />
              On Sale
            </button>
            <button
              type="button"
              className="h-10 rounded-xl px-2.5 text-sm font-extrabold text-[#6D4AFF] transition hover:bg-[#F2EFFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/25"
              onClick={onClearQuickFilters}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function sortProducts(products: Product[], sort: SortOption) {
  const sorted = [...products];
  if (sort === 'Newest') return sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
  if (sort === 'Price: Low to High') return sorted.sort((a, b) => a.price - b.price);
  if (sort === 'Price: High to Low') return sorted.sort((a, b) => b.price - a.price);
  if (sort === 'Top Rated') return sorted.sort((a, b) => b.rating - a.rating);
  return sorted.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
}

function productMatchesFilters(product: Product, filters: Filters) {
  const categoryMatch =
    filters.categories.length === 0 || filters.categories.includes(product.category);
  const ageMatch = filters.ages.length === 0 || filters.ages.includes(product.ageGroup);
  const priceMatch =
    filters.prices.length === 0 ||
    filters.prices.some((option) => priceMatches(product, option));
  const ratingMatch =
    filters.ratings.length === 0 ||
    filters.ratings.some((option) =>
      option === '4★ & Above' ? product.rating >= 4 : product.rating >= 3,
    );
  const availabilityMatch =
    filters.availability.length === 0 ||
    filters.availability.every((option) =>
      option === 'In Stock' ? product.inStock : product.onSale,
    );

  return categoryMatch && ageMatch && priceMatch && ratingMatch && availabilityMatch;
}

export function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All Toys');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('Featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const quickCategory = categoryFromQuickFilter(activeCategory);
    const query = search.trim().toLowerCase();

    const products = shopProducts.filter((product) => {
      const quickMatch = !quickCategory || product.category === quickCategory;
      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const stockMatch = !inStockOnly || product.inStock;
      const saleMatch =
        !onSaleOnly ||
        (typeof product.originalPrice === 'number' &&
          product.originalPrice > product.price);

      return (
        quickMatch &&
        searchMatch &&
        productMatchesFilters(product, filters) &&
        stockMatch &&
        saleMatch
      );
    });

    return sortProducts(products, sort);
  }, [activeCategory, filters, inStockOnly, onSaleOnly, search, sort]);

  function toggleFilter(group: keyof Filters, value: string) {
    setFilters((current) => {
      const values = current[group];
      return {
        ...current,
        [group]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setActiveCategory('All Toys');
    setSearch('');
  }

  function clearQuickFilters() {
    setInStockOnly(false);
    setOnSaleOnly(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      <ShopHero />
      <CategoryQuickFilters active={activeCategory} onChange={setActiveCategory} />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onToggle={toggleFilter}
            onClear={clearFilters}
          />
        </div>
        <div>
          <ShopToolbar
            count={filteredProducts.length}
            search={search}
            sort={sort}
            inStockOnly={inStockOnly}
            onSaleOnly={onSaleOnly}
            onSearch={setSearch}
            onSort={setSort}
            onInStockOnlyChange={setInStockOnly}
            onOnSaleOnlyChange={() => setOnSaleOnly((value) => !value)}
            onClearQuickFilters={clearQuickFilters}
            onOpenFilters={() => setMobileFiltersOpen(true)}
          />
          {filteredProducts.length > 0 ? (
            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-[#D9E2F0] bg-white p-8 text-center">
              <div>
                <PackageSearch className="mx-auto size-12 text-[#6D4AFF]" />
                <h2 className="mt-4 text-xl font-black text-[#101828]">
                  No toys found
                </h2>
                <p className="mt-2 max-w-md text-[#667085]">
                  Try clearing a filter or searching a broader toy category.
                </p>
                <Button
                  type="button"
                  className="mt-5 h-11 rounded-xl bg-[#101828] px-5"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E6EAF2] bg-white p-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-[#D9E2F0] text-[#667085]"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((page) => (
                <button
                  type="button"
                  key={page}
                  className={cn(
                    'grid size-10 place-items-center rounded-xl text-sm font-black transition',
                    page === 1
                      ? 'bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] text-white'
                      : 'border border-[#E6EAF2] bg-white text-[#475467] hover:text-[#6D4AFF]',
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              type="button"
              className="h-11 rounded-xl bg-[#101828] px-5 text-white hover:bg-[#6D4AFF]"
            >
              Load More Toys
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
      <TrustBar className="pb-12" />
      <Footer />
      {mobileFiltersOpen ? (
        <dialog
          open
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
        >
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[#101828]/35 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25 }}
            className="relative h-full w-[min(92vw,380px)] overflow-y-auto bg-white shadow-2xl"
          >
            <div className="border-b border-[#E6EAF2] p-5">
              <h2 id="mobile-filter-title" className="text-xl font-black text-[#101828]">
                Filters
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Refine toys by category, age, price, rating and availability.
              </p>
              <button
                type="button"
                aria-label="Close filters"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl bg-[#F2EFFF] text-[#6D4AFF]"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar
                filters={filters}
                onToggle={toggleFilter}
                onClear={clearFilters}
              />
              <Button
                type="button"
                className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] font-extrabold"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show Toys
              </Button>
            </div>
          </motion.aside>
        </dialog>
      ) : null}
    </main>
  );
}
