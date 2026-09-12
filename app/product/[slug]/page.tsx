import { ProductDetailsPage } from '@/components/product/ProductDetailsPage';
import { getCustomerProductBySlug } from '@/lib/customer-products-server';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCustomerProductBySlug(slug);
  return <ProductDetailsPage key={slug} product={product} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCustomerProductBySlug(slug);
  return {
    title: product
      ? `${product.name} | ToyVerse`
      : 'Product Not Found | ToyVerse',
  };
}
