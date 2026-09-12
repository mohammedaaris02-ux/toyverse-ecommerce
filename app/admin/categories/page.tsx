import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { createClient } from '@/lib/supabase/server';
import type { CatalogCategory } from '@/lib/catalog';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return <CategoriesManager initialItems={(data ?? []) as CatalogCategory[]} />;
}
