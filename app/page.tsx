import { HomePage } from '@/components/HomePage';
import { getShopCatalog } from '@/lib/customer-products-server';

export default async function Home() {
  const catalog = await getShopCatalog();
  return (
    <HomePage products={catalog.products} categories={catalog.categories} />
  );
}
