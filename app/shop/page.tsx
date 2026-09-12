import { ShopPage } from '@/components/shop/ShopPage';
import { getShopCatalog } from '@/lib/customer-products-server';

export default async function Shop() {
  const catalog = await getShopCatalog();
  return (
    <ShopPage
      products={catalog.products}
      databaseCategories={catalog.categories}
      loadError={catalog.error}
    />
  );
}
