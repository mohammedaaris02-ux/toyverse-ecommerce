import { ProductsManager } from '@/components/admin/ProductsManager';
import { createClient } from '@/lib/supabase/server';
import type { CatalogProduct } from '@/lib/catalog';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*, categories(id,name,slug)')
    .order('created_at', { ascending: false });
  return (
    <ProductsManager
      initialItems={(data ?? []) as unknown as CatalogProduct[]}
    />
  );
}
