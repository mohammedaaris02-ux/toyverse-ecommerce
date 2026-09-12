import { redirect } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { createClient } from '@/lib/supabase/server';
import type {
  CatalogCategory,
  CatalogProduct,
  ProductImage,
} from '@/lib/catalog';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [productResult, categoryResult, imageResult] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order'),
  ]);
  if (!productResult.data) redirect('/admin/products');
  return (
    <ProductForm
      product={productResult.data as CatalogProduct}
      categories={(categoryResult.data ?? []) as CatalogCategory[]}
      images={(imageResult.data ?? []) as ProductImage[]}
    />
  );
}
