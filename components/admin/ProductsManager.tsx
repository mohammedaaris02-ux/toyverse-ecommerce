'use client';

/* eslint-disable next/no-html-link-for-pages -- Native admin navigation avoids the Vinext Link runtime. */

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Edit3,
  ImageOff,
  LoaderCircle,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CatalogProduct } from '@/lib/catalog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Filter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'in-stock'
  | 'out-of-stock'
  | 'featured'
  | 'best-seller'
  | 'new-arrival';

export function ProductsManager({
  initialItems,
}: {
  initialItems: CatalogProduct[];
}) {
  const [items, setItems] = useState<CatalogProduct[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState<CatalogProduct | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id,name,slug)')
        .order('created_at', { ascending: false });
      setItems((data ?? []) as unknown as CatalogProduct[]);
      setMessage(error?.message ?? '');
      setLoading(false);
    },
    [supabase],
  );
  const visible = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = `${item.name} ${item.sku ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesFilter =
          filter === 'all' ||
          (filter === 'active' && item.is_active) ||
          (filter === 'inactive' && !item.is_active) ||
          (filter === 'in-stock' && item.stock > 0) ||
          (filter === 'out-of-stock' && item.stock <= 0) ||
          (filter === 'featured' && item.is_featured) ||
          (filter === 'best-seller' && item.is_best_seller) ||
          (filter === 'new-arrival' && item.is_new_arrival);
        return matchesQuery && matchesFilter;
      }),
    [filter, items, query],
  );

  async function toggle(item: CatalogProduct) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    setMessage(
      error?.message ??
        `${item.name} ${item.is_active ? 'disabled' : 'enabled'}.`,
    );
    await load();
  }
  async function remove() {
    if (!deleting) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleting.id);
    setMessage(error?.message ?? `${deleting.name} deleted.`);
    setDeleting(null);
    await load();
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-[#6D4AFF]">Catalog</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
          <p className="mt-2 text-[#667085]">
            Manage live pricing, stock, visibility and merchandising.
          </p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#6D4AFF] px-4 text-sm font-semibold text-white hover:bg-[#5B3DF5]"
        >
          <Plus className="size-4" />
          Add product
        </a>
      </div>
      <section className="overflow-hidden rounded-lg border border-[#E7EAF0] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#E7EAF0] p-4 lg:grid-cols-[minmax(280px,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU"
              className="h-11 w-full rounded-lg border border-[#D0D5DD] pl-10 pr-3 outline-none focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/15"
            />
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="h-11 rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm font-semibold outline-none focus:border-[#6D4AFF]"
          >
            <option value="all">All products</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
            <option value="featured">Featured</option>
            <option value="best-seller">Best seller</option>
            <option value="new-arrival">New arrival</option>
          </select>
        </div>
        {message && (
          <output className="block border-b border-[#E7EAF0] bg-[#F9FAFB] px-4 py-3 text-sm text-[#475467]">
            {message}
          </output>
        )}
        {loading ? (
          <div className="grid min-h-72 place-items-center">
            <LoaderCircle className="size-6 animate-spin text-[#6D4AFF]" />
          </div>
        ) : visible.length === 0 ? (
          <div className="grid min-h-72 place-items-center text-center">
            <div>
              <Package className="mx-auto mb-3 size-9 text-[#98A2B3]" />
              <p className="font-semibold">No products found</p>
              <p className="mt-1 text-sm text-[#667085]">
                Try another search or add a product.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#F9FAFB] text-xs uppercase text-[#667085]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]">
                {visible.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FCFCFD]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {item.featured_image ? (
                          <Image
                            src={item.featured_image}
                            alt=""
                            width={48}
                            height={48}
                            unoptimized
                            className="size-12 rounded-lg border border-[#E7EAF0] object-cover"
                          />
                        ) : (
                          <span className="grid size-12 place-items-center rounded-lg bg-[#F2F4F7] text-[#98A2B3]">
                            <ImageOff className="size-5" />
                          </span>
                        )}
                        <div>
                          <strong className="block max-w-64 truncate">
                            {item.name}
                          </strong>
                          <span className="text-xs text-[#667085]">
                            {item.sku || 'No SKU'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#475467]">
                      {item.categories?.name ?? 'Uncategorized'}
                    </td>
                    <td className="px-4 py-4">
                      <strong>
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </strong>
                      {item.original_price && (
                        <span className="ml-2 text-xs text-[#98A2B3] line-through">
                          ₹{Number(item.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td
                      className={
                        item.stock > 0
                          ? 'px-4 py-4 font-semibold text-[#067647]'
                          : 'px-4 py-4 font-semibold text-[#B42318]'
                      }
                    >
                      {item.stock}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          item.is_active
                            ? 'rounded-full bg-[#ECFDF3] px-2.5 py-1 text-xs font-semibold text-[#067647]'
                            : 'rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-semibold text-[#667085]'
                        }
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {item.is_featured && (
                        <span className="ml-2 rounded-full bg-[#F2EFFF] px-2.5 py-1 text-xs font-semibold text-[#6D4AFF]">
                          Featured
                        </span>
                      )}
                      {item.is_best_seller && (
                        <span className="ml-2 rounded-full bg-[#EFF8FF] px-2.5 py-1 text-xs font-semibold text-[#175CD3]">
                          Best seller
                        </span>
                      )}
                      {item.is_new_arrival && (
                        <span className="ml-2 rounded-full bg-[#FFFAEB] px-2.5 py-1 text-xs font-semibold text-[#B54708]">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[#667085]">
                      {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/admin/products/${item.id}/edit`}
                          aria-label={`Edit ${item.name}`}
                          className="grid size-10 place-items-center rounded-lg border border-[#D0D5DD] hover:bg-[#F8FAFC]"
                        >
                          <Edit3 className="size-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => toggle(item)}
                          className="min-h-10 rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold hover:bg-[#F8FAFC]"
                        >
                          {item.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          aria-label={`Delete ${item.name}`}
                          className="grid size-10 place-items-center rounded-lg border border-[#FDA29B] text-[#B42318] hover:bg-[#FEF3F2]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleting?.name} and its image records.
              Disabling is safer for normal catalog changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-[#B42318] text-white hover:bg-[#912018]"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
