'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { useCustomerAuth } from './CustomerAuth';

// Demo navigation only; localStorage is not an authentication security boundary.
export function CustomerRouteGuard({ children }: { children: ReactNode }) {
  const { ready, isLoggedIn, loginPending } = useCustomerAuth();

  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login' || pathname === '/login/';
  const isProtectedCustomerPage =
    pathname === '/checkout' ||
    pathname.startsWith('/checkout/') ||
    pathname === '/account' ||
    pathname.startsWith('/account/');

  const destination = !ready
    ? null
    : !isLoggedIn && isProtectedCustomerPage
      ? '/login'
      : isLoggedIn && isLoginPage && !loginPending
        ? '/'
        : null;

  useEffect(() => {
    if (destination) {
      router.replace(destination);
    }
  }, [destination, router]);

  if (!ready || destination) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F8FAFC] px-4 text-[#101828]">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#247BFE] text-white shadow-lg">
              <Sparkles className="size-5" />
            </span>

            <span className="text-xl font-bold">ToyVerse</span>
          </div>

          <output className="flex items-center gap-2 text-sm text-[#667085]">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading...
          </output>
        </div>
      </main>
    );
  }

  return children;
}
