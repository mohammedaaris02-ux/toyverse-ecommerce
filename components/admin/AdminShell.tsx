'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  ClipboardList,
  Truck,
  Package,
  Sparkles,
  Store,
  Tags,
  RotateCcw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerAuth } from '@/components/account/CustomerAuth';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/admin/returns', label: 'Returns', icon: RotateCcw },
];

export function AdminShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout: customerLogout } = useCustomerAuth();

  async function logout() {
    await customerLogout();
    router.replace('/login');
  }

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;

    event.preventDefault();
    router.push(href);
  }

  const currentPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  const navigation = (
    <>
      <div className="flex h-18 items-center gap-3 border-b border-[#E7EAF0] px-5">
        <span className="grid size-10 place-items-center rounded-xl bg-[#6D4AFF] text-white">
          <Sparkles className="size-5" />
        </span>
        <span>
          <strong className="block text-base">ToyVerse</strong>
          <span className="text-xs text-[#667085]">Admin Console</span>
        </span>
      </div>
      <nav className="grid gap-1 p-3" aria-label="Admin navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/admin'
              ? currentPath === href
              : currentPath === href || currentPath.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              onClick={(event) => navigate(event, href)}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition',
                active
                  ? 'bg-[#F2EFFF] text-[#5B3DF5]'
                  : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#101828]',
              )}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto grid gap-1 border-t border-[#E7EAF0] p-3">
        <Link
          href="/"
          prefetch={false}
          onClick={(event) => navigate(event, '/')}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#475467] hover:bg-[#F8FAFC]"
        >
          <Store className="size-4.5" />
          Back to Store
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-[#B42318] hover:bg-[#FEF3F2]"
        >
          <LogOut className="size-4.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-[#F7F8FA] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#E7EAF0] bg-white lg:flex">
        {navigation}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-[#101828]/35"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(84vw,300px)] flex-col bg-white shadow-2xl">
            {navigation}
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-lg hover:bg-[#F2EFFF]"
            >
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#E7EAF0] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-lg border border-[#E7EAF0] lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-2 text-sm text-[#667085] lg:flex">
            <Boxes className="size-4 text-[#6D4AFF]" />
            Catalog operations
          </div>
          <div className="ml-auto text-right">
            <strong className="block text-sm">{userName}</strong>
            <span className="text-xs text-[#667085]">Administrator</span>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
