'use client';

/* eslint-disable next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import {
  BadgePercent,
  ChevronDown,
  Grid2X2,
  Package,
  Sparkles,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'All Products', href: '/shop', icon: Package },
  { name: 'Categories', href: '/categories', icon: Grid2X2 },
  { name: 'New Arrivals', href: '/shop?filter=new-arrivals', icon: Sparkles },
  { name: 'Best Sellers', href: '/shop?filter=best-sellers', icon: Star },
  { name: 'Offers', href: '/shop?filter=offers', icon: BadgePercent },
];

export function ShopMenu({
  active,
  mobile,
  onNavigate,
}: {
  active: boolean;
  mobile: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = mobile ? 'mobile-shop-links' : 'desktop-shop-links';

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  return (
    // The group handles dismissal events bubbled from its accessible button and links.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={root}
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      aria-label="Shop navigation"
      className="relative"
      onMouseEnter={() => {
        if (!mobile) setOpen(true);
      }}
      onMouseLeave={() => {
        if (!mobile) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-current={active ? 'page' : undefined}
        onClick={() => setOpen(mobile ? !open : true)}
        className={cn(
          'relative flex min-h-11 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30',
          mobile && 'w-full justify-between',
          active
            ? 'bg-[#F2EFFF] text-[#6D4AFF]'
            : 'text-[#475569] hover:bg-[#F2EFFF] hover:text-[#247BFE]',
        )}
      >
        Shop{' '}
        <ChevronDown
          className={cn(
            'size-4 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[#6D4AFF] to-[#247BFE]"
          />
        )}
      </button>
      <div
        id={id}
        hidden={!open}
        className={
          mobile ? 'pl-3 pt-2' : 'absolute left-0 top-full z-10 w-64 pt-2'
        }
      >
        <div
          className={cn(
            'grid gap-1 rounded-xl border border-[#E6EAF2] bg-white p-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200',
            !mobile && 'shadow-[0_12px_36px_rgb(16_24_40/12%)]',
          )}
        >
          {links.map(({ name, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#475569]! transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF]! focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
            >
              <Icon className="size-4 shrink-0 text-[#6D4AFF]" />
              {name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
