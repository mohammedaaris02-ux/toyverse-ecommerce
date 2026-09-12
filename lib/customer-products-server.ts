import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

import type {
  CatalogCategory,
  CatalogProduct,
  ProductImage,
} from '@/lib/catalog';
import {
  mapCustomerProduct,
  type CustomerProduct,
} from '@/lib/customer-products';

export type ShopCatalog = {
  products: CustomerProduct[];
  categories: CustomerCategory[];
  error: string | null;
};

export type CustomerCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
};

const productColumns =
  'id,category_id,name,slug,sku,short_description,description,price,original_price,stock,featured_image,age_group,recommended_age,brand,material,rating,review_count,is_featured,is_best_seller,is_new_arrival,is_on_sale,is_active,created_at,updated_at,categories(id,name,slug)';

function createCatalogClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const getShopCatalog = cache(async (): Promise<ShopCatalog> => {
  const supabase = createCatalogClient();
  const [productResult, categoryResult, imageResult] = await Promise.all([
    supabase
      .from('products')
      .select(productColumns)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select(
        'id,name,slug,description,image_url,is_active,created_at,updated_at',
      )
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('product_images')
      .select(
        'id,product_id,image_url,alt_text,sort_order,is_primary,created_at',
      )
      .order('sort_order'),
  ]);

  if (productResult.error) {
    console.error('Unable to load customer products:', {
      message: productResult.error.message,
      code: productResult.error.code,
      details: productResult.error.details,
      hint: productResult.error.hint,
    });
    return {
      products: [],
      categories: (categoryResult.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        imageUrl: category.image_url,
        productCount: 0,
      })),
      error: 'Unable to load toys',
    };
  }

  const rows = (productResult.data ?? []) as unknown as CatalogProduct[];
  const images = (imageResult.data ?? []) as ProductImage[];
  if (imageResult.error)
    console.error('Unable to load product images:', imageResult.error);
  const imagesByProduct = new Map<string, ProductImage[]>();
  for (const image of images) {
    const existing = imagesByProduct.get(image.product_id) ?? [];
    existing.push(image);
    imagesByProduct.set(image.product_id, existing);
  }

  const products = rows.map((row) =>
    mapCustomerProduct(row, imagesByProduct.get(row.id) ?? []),
  );
  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    categoryCounts.set(
      product.categorySlug,
      (categoryCounts.get(product.categorySlug) ?? 0) + 1,
    );
  }
  if (categoryResult.error)
    console.error(
      'Unable to load customer categories:',
      categoryResult.error.message,
    );
  const categories = ((categoryResult.data ?? []) as CatalogCategory[]).map(
    (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      imageUrl: category.image_url,
      productCount: categoryCounts.get(category.slug) ?? 0,
    }),
  );
  return {
    products,
    categories,
    error: null,
  };
});

export const getCustomerProductBySlug = cache(
  async function getCustomerProductBySlug(
    slug: string,
  ): Promise<CustomerProduct | null> {
    const supabase = createCatalogClient();
    const { data, error } = await supabase
      .from('products')
      .select(productColumns)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Unable to load product details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }
    if (!data) return null;

    const { data: imageRows, error: imageError } = await supabase
      .from('product_images')
      .select(
        'id,product_id,image_url,alt_text,sort_order,is_primary,created_at',
      )
      .eq('product_id', data.id)
      .order('sort_order');
    if (imageError)
      console.error('Unable to load product gallery:', imageError.message);

    return mapCustomerProduct(
      data as unknown as CatalogProduct,
      (imageRows ?? []) as ProductImage[],
    );
  },
);
