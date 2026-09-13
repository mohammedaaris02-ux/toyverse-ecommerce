import type { Metadata } from 'next';
import './globals.css';
import { CustomerStoreProvider } from '@/components/customer/CustomerStore';
import { CustomerPanels } from '@/components/customer/CustomerPanels';
import { CustomerAuthProvider } from '@/components/account/CustomerAuth';
import { CustomerRouteGuard } from '@/components/account/CustomerRouteGuard';
import { getShopCatalog } from '@/lib/customer-products-server';

export const metadata: Metadata = {
  title: 'ToyVerse | Play. Learn. Grow.',
  description:
    'Premium, safe and creative toys for little explorers. Discover best sellers, new arrivals and educational toys at ToyVerse.',
  icons: { icon: '/favicon.svg' },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getShopCatalog();
  return (
    <html lang="en">
      <body>
        <CustomerAuthProvider>
          <CustomerStoreProvider initialProducts={catalog.products}>
            <CustomerRouteGuard>{children}</CustomerRouteGuard>
            <CustomerPanels />
          </CustomerStoreProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
