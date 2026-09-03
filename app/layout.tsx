import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ToyVerse | Play. Learn. Grow.',
  description:
    'Premium, safe and creative toys for little explorers. Discover best sellers, new arrivals and educational toys at ToyVerse.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
