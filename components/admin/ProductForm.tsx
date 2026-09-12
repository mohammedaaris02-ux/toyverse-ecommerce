'use client';

import { useMemo, useState, type SyntheticEvent } from 'react';
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  slugify,
  type CatalogCategory,
  type CatalogProduct,
  type ProductImage,
} from '@/lib/catalog';

type Props = {
  product?: CatalogProduct | null;
  categories: CatalogCategory[];
  images?: ProductImage[];
};
const input =
  'h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm outline-none transition focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/15';
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SafeDatabaseError = {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
};

function databaseError(error: unknown): SafeDatabaseError {
  if (!error || typeof error !== 'object') {
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  const value = error as Record<string, unknown>;
  return {
    code: typeof value.code === 'string' ? value.code : undefined,
    message:
      typeof value.message === 'string' ? value.message : 'Unknown error',
    details: typeof value.details === 'string' ? value.details : undefined,
    hint: typeof value.hint === 'string' ? value.hint : undefined,
  };
}

function productErrorMessage(error: SafeDatabaseError) {
  const text = `${error.message} ${error.details ?? ''}`.toLowerCase();
  if (error.code === '23505' && text.includes('slug'))
    return 'A product with this slug already exists.';
  if (error.code === '23505' && text.includes('sku'))
    return 'A product with this SKU already exists.';
  return [error.message, error.details, error.hint].filter(Boolean).join(' ');
}

export function ProductForm({ product, categories, images = [] }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    category_id: product?.category_id ?? '',
    short_description: product?.short_description ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    original_price: product?.original_price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    age_group: product?.age_group ?? '',
    recommended_age: product?.recommended_age ?? '',
    brand: product?.brand ?? '',
    material: product?.material ?? '',
    rating: product?.rating?.toString() ?? '0',
    review_count: product?.review_count?.toString() ?? '0',
    is_featured: product?.is_featured ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    is_on_sale: product?.is_on_sale ?? false,
    is_active: product?.is_active ?? true,
  });
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [savedImages, setSavedImages] = useState(images);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [savedProductId, setSavedProductId] = useState(product?.id ?? '');

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function safeName(file: File) {
    return file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  async function upload(file: File, productId: string) {
    const path = `products/${productId}/${crypto.randomUUID()}-${safeName(file)}`;
    const result = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (result.error) throw result.error;
    return {
      path,
      url: supabase.storage.from('product-images').getPublicUrl(path).data
        .publicUrl,
    };
  }
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const price = Number(form.price),
      originalPrice = form.original_price ? Number(form.original_price) : null,
      stock = Number(form.stock),
      rating = Number(form.rating),
      reviewCount = Number(form.review_count);
    if (!form.name.trim() || !form.slug || !form.category_id) {
      setMessage('Name, slug and category are required.');
      setSaving(false);
      return;
    }
    if (!uuidPattern.test(form.category_id)) {
      setMessage('Select a valid category before saving.');
      setSaving(false);
      return;
    }
    if (
      price < 0 ||
      (originalPrice !== null && originalPrice < 0) ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      rating < 0 ||
      rating > 5 ||
      !Number.isInteger(reviewCount) ||
      reviewCount < 0
    ) {
      setMessage('Check price, stock, rating and review count values.');
      setSaving(false);
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug),
      sku: form.sku.trim() || null,
      category_id: form.category_id,
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      price,
      original_price: originalPrice,
      stock,
      age_group: form.age_group.trim() || null,
      recommended_age: form.recommended_age.trim() || null,
      brand: form.brand.trim() || null,
      material: form.material.trim() || null,
      rating,
      review_count: reviewCount,
      is_featured: form.is_featured,
      is_best_seller: form.is_best_seller,
      is_new_arrival: form.is_new_arrival,
      is_on_sale:
        form.is_on_sale || Boolean(originalPrice && originalPrice > price),
      is_active: form.is_active,
    };
    let productId = savedProductId || undefined;
    let stage = 'product row';
    let rowCreated = false;
    try {
      const normalizedSlug = payload.slug;
      let duplicateQuery = supabase
        .from('products')
        .select('id, slug, sku')
        .or(
          payload.sku
            ? `slug.eq.${normalizedSlug},sku.eq.${payload.sku}`
            : `slug.eq.${normalizedSlug}`,
        );
      if (productId) duplicateQuery = duplicateQuery.neq('id', productId);
      const { data: duplicates, error: duplicateError } = await duplicateQuery;
      if (duplicateError) throw duplicateError;
      if (duplicates?.some((item) => item.slug === normalizedSlug))
        throw { code: '23505', message: 'Duplicate slug' };
      if (payload.sku && duplicates?.some((item) => item.sku === payload.sku))
        throw { code: '23505', message: 'Duplicate SKU' };

      if (productId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        productId = data.id;
        if (!productId) throw new Error('Product could not be saved.');
        setSavedProductId(productId);
        rowCreated = true;
      }
      if (!productId) throw new Error('Product could not be saved.');
      if (featuredFile) {
        stage = 'featured image upload';
        const uploaded = await upload(featuredFile, productId);
        stage = 'featured image metadata';
        const { error: primaryError } = await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', productId);
        if (primaryError) throw primaryError;
        const { error } = await supabase
          .from('products')
          .update({ featured_image: uploaded.url })
          .eq('id', productId);
        if (error) throw error;
        const { error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: uploaded.url,
            alt_text: form.name,
            sort_order: 0,
            is_primary: true,
          });
        if (imageError) throw imageError;
      }
      if (additionalFiles.length) {
        stage = 'additional image upload';
        const uploaded = await Promise.all(
          additionalFiles.map((file) => upload(file, productId!)),
        );
        stage = 'additional image metadata';
        const { error } = await supabase.from('product_images').insert(
          uploaded.map((item, index) => ({
            product_id: productId,
            image_url: item.url,
            alt_text: form.name,
            sort_order: savedImages.length + index + 1,
            is_primary: false,
          })),
        );
        if (error) throw error;
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      const safeError = databaseError(error);
      console.error('Admin product save failed', { stage, ...safeError });
      const detail = productErrorMessage(safeError);
      setMessage(
        stage === 'product row'
          ? `Unable to save product: ${detail}`
          : `Product ${rowCreated ? 'created' : 'saved'}, but ${stage} failed: ${detail}`,
      );
      setSaving(false);
    }
  }
  async function removeImage(image: ProductImage) {
    const marker = '/product-images/';
    const path = image.image_url.split(marker)[1];
    if (path)
      await supabase.storage
        .from('product-images')
        .remove([decodeURIComponent(path)]);
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', image.id);
    if (error) setMessage(error.message);
    else {
      if (image.is_primary && savedProductId) {
        await supabase
          .from('products')
          .update({ featured_image: null })
          .eq('id', savedProductId);
      }
      setSavedImages((current) =>
        current.filter((item) => item.id !== image.id),
      );
    }
  }
  async function makePrimary(image: ProductImage) {
    if (!savedProductId) return;
    const { error: resetError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', savedProductId);
    if (resetError) {
      setMessage(resetError.message);
      return;
    }
    const [{ error: imageError }, { error: productError }] = await Promise.all([
      supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', image.id),
      supabase
        .from('products')
        .update({ featured_image: image.image_url })
        .eq('id', savedProductId),
    ]);
    const error = imageError ?? productError;
    if (error) setMessage(error.message);
    else {
      setSavedImages((current) =>
        current.map((item) => ({
          ...item,
          is_primary: item.id === image.id,
        })),
      );
      setMessage('Primary image updated.');
    }
  }
  const field = (
    label: string,
    key: keyof typeof form,
    options?: {
      type?: string;
      required?: boolean;
      min?: number;
      max?: number;
      step?: string;
    },
  ) => (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      <input
        type={options?.type ?? 'text'}
        required={options?.required}
        min={options?.min}
        max={options?.max}
        step={options?.step}
        value={String(form[key])}
        onChange={(event) => set(key, event.target.value as never)}
        className={input}
      />
    </label>
  );
  const flag = (
    label: string,
    key:
      | 'is_featured'
      | 'is_best_seller'
      | 'is_new_arrival'
      | 'is_on_sale'
      | 'is_active',
  ) => (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[#E7EAF0] px-3 text-sm font-semibold">
      <input
        type="checkbox"
        checked={form[key]}
        onChange={(event) => set(key, event.target.checked)}
        className="size-4 accent-[#6D4AFF]"
      />
      {label}
    </label>
  );

  return (
    <form onSubmit={submit}>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            prefetch={false}
            aria-label="Back to products"
            className="grid size-11 place-items-center rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F8FAFC]"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-[#6D4AFF]">Products</p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {product ? 'Edit product' : 'Add product'}
            </h1>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#6D4AFF] px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? 'Saving...' : 'Save product'}
        </button>
      </div>
      {message && (
        <output className="mb-5 block rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-3 text-sm text-[#B42318]">
          {message}
        </output>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Product information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {field('Product name', 'name', { required: true })}
              {field('Slug', 'slug', { required: true })}
              {field('SKU', 'sku')}
              <label className="grid gap-1.5 text-sm font-semibold">
                Category
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className={input}
                >
                  <option value="">Select category</option>
                  {categories
                    .filter(
                      (item) =>
                        item.is_active || item.id === product?.category_id,
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                Short description
                <textarea
                  rows={3}
                  value={form.short_description}
                  onChange={(e) => set('short_description', e.target.value)}
                  className="rounded-lg border border-[#D0D5DD] p-3 font-normal outline-none focus:border-[#6D4AFF]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                Full description
                <textarea
                  rows={7}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="rounded-lg border border-[#D0D5DD] p-3 font-normal outline-none focus:border-[#6D4AFF]"
                />
              </label>
            </div>
          </section>
          <section className="rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Pricing and inventory</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {field('Price (₹)', 'price', {
                type: 'number',
                required: true,
                min: 0,
                step: '0.01',
              })}
              {field('Original price (₹)', 'original_price', {
                type: 'number',
                min: 0,
                step: '0.01',
              })}
              {field('Stock', 'stock', {
                type: 'number',
                required: true,
                min: 0,
                step: '1',
              })}
            </div>
          </section>
          <section className="rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Product attributes</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {field('Age group', 'age_group')}
              {field('Recommended age', 'recommended_age')}
              {field('Brand', 'brand')}
              {field('Material', 'material')}
              {field('Rating', 'rating', {
                type: 'number',
                min: 0,
                max: 5,
                step: '0.1',
              })}
              {field('Review count', 'review_count', {
                type: 'number',
                min: 0,
                step: '1',
              })}
            </div>
          </section>
        </div>
        <aside className="grid h-fit gap-6">
          <section className="rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Visibility</h2>
            <div className="mt-4 grid gap-2">
              {flag('Active', 'is_active')}
              {flag('Featured', 'is_featured')}
              {flag('Best seller', 'is_best_seller')}
              {flag('New arrival', 'is_new_arrival')}
              {flag('On sale', 'is_on_sale')}
            </div>
          </section>
          <section className="rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Product images</h2>
            <label className="mt-4 grid cursor-pointer place-items-center rounded-lg border border-dashed border-[#BDB4FF] bg-[#FAF9FF] p-5 text-center hover:bg-[#F2EFFF]">
              <Upload className="mb-2 size-6 text-[#6D4AFF]" />
              <strong className="text-sm">Featured image</strong>
              <span className="mt-1 text-xs text-[#667085]">
                PNG, JPG or WebP
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFeaturedFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            {featuredFile && (
              <p className="mt-2 truncate text-xs text-[#475467]">
                {featuredFile.name}
              </p>
            )}
            <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] text-sm font-semibold hover:bg-[#F8FAFC]">
              <ImagePlus className="size-4" />
              Additional images
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  setAdditionalFiles(Array.from(e.target.files ?? []))
                }
                className="sr-only"
              />
            </label>
            {additionalFiles.length > 0 && (
              <p className="mt-2 text-xs text-[#475467]">
                {additionalFiles.length} files selected
              </p>
            )}
            {savedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {savedImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-[#E7EAF0]"
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text ?? form.name}
                      fill
                      sizes="96px"
                      unoptimized
                      className="size-full object-cover"
                    />
                    {image.is_primary ? (
                      <span className="absolute bottom-1 left-1 rounded bg-[#6D4AFF] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makePrimary(image)}
                        className="absolute bottom-1 left-1 rounded bg-white/95 px-1.5 py-1 text-[11px] font-semibold text-[#5B3DF5] shadow"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 grid size-8 place-items-center rounded-md bg-white/95 text-[#B42318] shadow"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
      {saving && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/65 backdrop-blur-sm">
          <output className="flex items-center gap-3 rounded-lg border border-[#E7EAF0] bg-white px-5 py-4 font-semibold shadow-xl">
            <LoaderCircle className="size-5 animate-spin text-[#6D4AFF]" />
            Saving product...
          </output>
        </div>
      )}
    </form>
  );
}
