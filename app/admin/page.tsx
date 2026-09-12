import { AlertTriangle, Boxes, PackageCheck, Tags, Truck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [
    all,
    active,
    outOfStock,
    categories,
    pending,
    processing,
    outForDelivery,
    delivered,
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock', 0),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing'),
    supabase
      .from('delivery_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'out_for_delivery'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered'),
  ]);
  const cards = [
    ['Total Products', all.count ?? 0, Boxes, '#6D4AFF', '#F2EFFF'],
    ['Active Products', active.count ?? 0, PackageCheck, '#067647', '#ECFDF3'],
    [
      'Out of Stock',
      outOfStock.count ?? 0,
      AlertTriangle,
      '#B54708',
      '#FFFAEB',
    ],
    ['Categories', categories.count ?? 0, Tags, '#175CD3', '#EFF8FF'],
    ['Pending Orders', pending.count ?? 0, PackageCheck, '#B54708', '#FFFAEB'],
    ['Processing Orders', processing.count ?? 0, Boxes, '#6D4AFF', '#F2EFFF'],
    [
      'Out for Delivery',
      outForDelivery.count ?? 0,
      Truck,
      '#175CD3',
      '#EFF8FF',
    ],
    [
      'Delivered Orders',
      delivered.count ?? 0,
      PackageCheck,
      '#067647',
      '#ECFDF3',
    ],
  ] as const;
  const loadError = [
    all,
    active,
    outOfStock,
    categories,
    pending,
    processing,
    outForDelivery,
    delivered,
  ].some((result) => result.error);

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-[#6D4AFF]">Overview</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Catalog dashboard</h1>
          <p className="mt-2 text-[#667085]">
            Live inventory and category totals from Supabase.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          prefetch={false}
          className="inline-flex min-h-11 items-center rounded-lg bg-[#6D4AFF] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#5B3DF5]"
        >
          Add product
        </Link>
      </div>
      {loadError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-sm font-medium text-[#B42318]"
        >
          Some catalog metrics could not be loaded. Refresh or check the
          Supabase policies.
        </p>
      )}
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Catalog metrics"
      >
        {cards.map(([label, value, Icon, color, background]) => (
          <article
            key={label}
            className="rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm"
          >
            <span
              className="mb-5 grid size-11 place-items-center rounded-lg"
              style={{ color, background }}
            >
              <Icon className="size-5" />
            </span>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm font-medium text-[#667085]">{label}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 border-y border-[#E7EAF0] bg-white px-5 py-6 sm:px-6">
        <h2 className="text-lg font-bold">Catalog workflow</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link
            href="/admin/categories"
            prefetch={false}
            className="rounded-lg border border-[#E7EAF0] p-4 hover:border-[#6D4AFF]/40 hover:bg-[#F9F8FF]"
          >
            <strong className="block">1. Organize categories</strong>
            <span className="mt-1 block text-sm text-[#667085]">
              Keep storefront navigation clean.
            </span>
          </Link>
          <Link
            href="/admin/products"
            prefetch={false}
            className="rounded-lg border border-[#E7EAF0] p-4 hover:border-[#6D4AFF]/40 hover:bg-[#F9F8FF]"
          >
            <strong className="block">2. Manage inventory</strong>
            <span className="mt-1 block text-sm text-[#667085]">
              Review stock, pricing and status.
            </span>
          </Link>
          <Link
            href="/admin/products/new"
            prefetch={false}
            className="rounded-lg border border-[#E7EAF0] p-4 hover:border-[#6D4AFF]/40 hover:bg-[#F9F8FF]"
          >
            <strong className="block">3. Publish products</strong>
            <span className="mt-1 block text-sm text-[#667085]">
              Add product details and imagery.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
