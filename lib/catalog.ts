export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogProduct = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  featured_image: string | null;
  age_group: string | null;
  recommended_age: string | null;
  brand: string | null;
  material: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Pick<CatalogCategory, 'id' | 'name' | 'slug'> | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
