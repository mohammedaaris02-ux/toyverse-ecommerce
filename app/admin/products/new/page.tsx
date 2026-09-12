import { ProductForm } from '@/components/admin/ProductForm';
import { createClient } from '@/lib/supabase/server';
import type { CatalogCategory } from '@/lib/catalog';

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return <ProductForm categories={(data ?? []) as CatalogCategory[]} />;
}
