import type { Product } from '@/lib/product-types';
import type { CatalogProduct, ProductImage } from '@/lib/catalog';

export type CustomerProduct = Product & {
  sku: string | null;
  categorySlug: string;
  shortDescription: string;
  description: string;
  stock: number;
  image: string | null;
  images: { src: string; alt: string }[];
  recommendedAge: string;
  brand: string;
  material: string;
  isBestSeller: boolean;
  isOnSale: boolean;
  createdAt: string;
};

type ProductRow = CatalogProduct & {
  categories?: { name?: string | null; slug?: string | null } | null;
};

const palettes = [
  'from-[#F2EFFF] to-[#EDF6FF]',
  'from-[#EDF6FF] to-[#FFF8E1]',
  'from-[#FFF0F6] to-[#F2EFFF]',
  'from-[#ECFDF5] to-[#EDF6FF]',
];

function finiteNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function mapCustomerProduct(
  row: ProductRow,
  productImages: ProductImage[] = [],
): CustomerProduct {
  const orderedImages = [...productImages].sort(
    (a, b) =>
      Number(b.is_primary) - Number(a.is_primary) ||
      a.sort_order - b.sort_order,
  );
  const image = row.featured_image || orderedImages[0]?.image_url || null;
  const images = orderedImages.map((item) => ({
    src: item.image_url,
    alt: item.alt_text || row.name,
  }));
  if (image && !images.some((item) => item.src === image))
    images.unshift({ src: image, alt: row.name });
  const galleryImages = images.length
    ? images
    : [{ src: '', alt: `${row.name} image unavailable` }];

  const price = Math.max(0, finiteNumber(row.price));
  const originalPrice =
    row.original_price == null
      ? undefined
      : Math.max(0, finiteNumber(row.original_price));
  const stock = Math.max(0, Math.trunc(finiteNumber(row.stock)));
  const onSale =
    row.is_on_sale || Boolean(originalPrice && originalPrice > price);
  const category = row.categories?.name?.trim() || 'Uncategorized';
  const categorySlug = row.categories?.slug?.trim() || 'uncategorized';
  const badge = row.is_best_seller
    ? 'Best Seller'
    : row.is_new_arrival
      ? 'New'
      : onSale
        ? 'On Sale'
        : undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    category,
    categorySlug,
    shortDescription: row.short_description || '',
    description: row.description || '',
    price,
    originalPrice,
    stock,
    inStock: stock > 0,
    image,
    images: galleryImages,
    ageGroup: row.age_group || '',
    recommendedAge: row.recommended_age || '',
    brand: row.brand || '',
    material: row.material || '',
    rating: Math.min(5, Math.max(0, finiteNumber(row.rating))),
    reviewCount: Math.max(0, Math.trunc(finiteNumber(row.review_count))),
    isFeatured: Boolean(row.is_featured),
    isBestSeller: Boolean(row.is_best_seller),
    isNew: Boolean(row.is_new_arrival),
    isOnSale: onSale,
    onSale,
    badge,
    createdAt: row.created_at,
    palette: palettes[row.name.length % palettes.length],
    details: {
      sku: row.sku || 'N/A',
      stock,
      images: galleryImages,
      description: [
        row.description ||
          row.short_description ||
          'Product details coming soon.',
      ],
      highlights: [],
      specifications: [
        { label: 'Brand', value: row.brand || 'ToyVerse' },
        {
          label: 'Age Group',
          value: row.age_group || row.recommended_age || 'All ages',
        },
        { label: 'Material', value: row.material || 'Not specified' },
        {
          label: 'Recommended Age',
          value: row.recommended_age || row.age_group || 'Not specified',
        },
      ],
      whatsInBox: [],
      safety: [],
    },
  };
}
