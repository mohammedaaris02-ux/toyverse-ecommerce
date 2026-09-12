import { CategoriesPage } from '@/components/categories/CategoriesPage';
import { getShopCatalog } from '@/lib/customer-products-server';

export const metadata = { title: 'Explore Toy Categories | ToyVerse' };

export default async function Categories() {
  const catalog = await getShopCatalog();
  return (
    <CategoriesPage
      products={catalog.products}
      categories={catalog.categories}
    />
  );
}
