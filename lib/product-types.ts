export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock: boolean;
  onSale: boolean;
  ageGroup: string;
  palette: string;
  details: ProductDetails;
};

export type ProductDetails = {
  sku: string;
  stock: number;
  images: { src: string; alt: string }[];
  description: string[];
  highlights: string[];
  specifications: { label: string; value: string }[];
  whatsInBox: string[];
  safety: string[];
};
