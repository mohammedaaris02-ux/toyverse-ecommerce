'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, LogOut, MapPin, Package, User, X } from 'lucide-react';

import { useCustomerAuth } from './CustomerAuth';
import { useCustomerStore } from '@/components/customer/CustomerStore';

const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';

export function AccountMenu({
  onNavigate,
  mobile = false,
}: {
  onNavigate: () => void;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const { user, ready, logout } = useCustomerAuth();

  const store = useCustomerStore();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    root.current
      ?.querySelector<HTMLElement>('[data-account-panel] button')
      ?.focus();

    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        setOpen(false);
        trigger.current?.focus();
      }
    };

    document.addEventListener('pointerdown', outside);

    document.addEventListener('keydown', escape, true);

    return () => {
      document.removeEventListener('pointerdown', outside);

      document.removeEventListener('keydown', escape, true);
    };
  }, [open]);

  function action(run: () => void | Promise<void>) {
    setOpen(false);
    onNavigate();
    void run();
  }

  const displayName =
    user?.fullName?.trim() || user?.email?.split('@')[0] || 'ToyVerse Customer';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label="Customer account"
        title="Login / Account"
        aria-expanded={open}
        disabled={!ready}
        onClick={() => setOpen(!open)}
        className={`relative grid size-11 place-items-center rounded-xl border border-[#E6EAF2] bg-white text-[#344054] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#F2EFFF] hover:text-[#6D4AFF] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
      >
        <User className="size-4" />

        {user && (
          <span
            aria-label="Signed in"
            className="absolute right-1 top-1 size-2 rounded-full bg-[#039855] ring-2 ring-white"
          />
        )}
      </button>

      {open && (
        <motion.div
          data-account-panel
          initial={{
            opacity: 0,
            y: -6,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.2,
          }}
          className={`fixed inset-x-4 bottom-4 z-[70] max-h-[80dvh] overflow-y-auto rounded-[18px] border border-[#E6EAF2] bg-white p-4 text-[#101828] shadow-[0_16px_48px_rgb(16_24_40/16%)] ${
            mobile
              ? 'sm:left-auto sm:right-5 sm:w-[304px]'
              : 'sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[304px]'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {user ? (
                <>
                  <span className="mb-3 grid size-11 place-items-center rounded-full bg-[#F2EFFF] font-bold text-[#6D4AFF]">
                    {initials || 'TV'}
                  </span>

                  <p className="text-xs text-[#667085]">Hello,</p>

                  <p className="break-words font-bold">{displayName}</p>

                  <p className="mt-1 break-all text-sm text-[#667085]">
                    {user.email}
                  </p>

                  {user.phone && (
                    <p className="mt-1 text-sm text-[#667085]">{user.phone}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-bold">Welcome to ToyVerse</p>

                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    Sign in to manage your profile, addresses and orders.
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              aria-label="Close account menu"
              className={`grid size-9 shrink-0 place-items-center rounded-lg transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF] ${focus}`}
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X className="size-4" />
            </button>
          </div>

          {user ? (
            <div className="mt-4 border-t border-[#E6EAF2] pt-2">
              {[
                {
                  text: 'My Profile',
                  icon: User,
                  run: () => router.push('/account/profile'),
                },

                {
                  text: 'My Addresses',
                  icon: MapPin,
                  run: () => router.push('/account/profile#addresses'),
                },

                {
                  text: 'My Orders',
                  icon: Package,
                  run: () => router.push('/account/orders'),
                },

                {
                  text: 'Wishlist',
                  icon: Heart,
                  run: () => store.setPanel('wishlist'),
                },

                {
                  text: 'Logout',
                  icon: LogOut,
                  run: async () => {
                    await logout();

                    store.notify('You have been logged out.');

                    router.replace('/login');
                    router.refresh();
                  },
                },
              ].map(({ text, icon: Icon, run }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => action(run)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF] ${focus}`}
                >
                  <Icon className="size-4" />
                  {text}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => action(() => router.push('/login'))}
                className={`min-h-11 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] font-semibold text-white shadow-sm transition hover:shadow-md ${focus}`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() =>
                  action(() =>
                    store.notify(
                      'Account registration will be available in a future update.',
                    ),
                  )
                }
                className={`min-h-11 rounded-xl border border-[#E6EAF2] font-semibold transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF] ${focus}`}
              >
                Create Account
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
