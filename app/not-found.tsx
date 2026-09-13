/* eslint-disable next/no-html-link-for-pages -- Plain anchors avoid the Vinext production Link runtime. */

import {
  ArrowLeft,
  Blocks,
  Home,
  PackageOpen,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';

export default function NotFound() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />
      <Header />

      <section className="relative isolate flex min-h-[calc(100dvh-176px)] items-center border-b border-[#E6EAF2] bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_62%,#FAF9FF_100%)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute left-[7%] top-[14%] hidden size-12 rotate-12 place-items-center rounded-lg bg-[#FFD166] text-[#7A4D00] shadow-sm sm:grid"
        >
          <Sparkles className="size-5" />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-[18%] right-[8%] hidden size-14 -rotate-6 place-items-center rounded-lg bg-[#DDF4EC] text-[#08745B] shadow-sm md:grid"
        >
          <Blocks className="size-6" />
        </div>

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] md:gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <ArrowLeft className="size-5 text-[#6D4AFF]" aria-hidden="true" />
              <p className="text-sm font-bold uppercase text-[#6D4AFF]">
                Lost in ToyVerse
              </p>
            </div>
            <p
              aria-hidden="true"
              className="mt-4 text-8xl font-black leading-[0.82] text-[#6D4AFF] sm:text-[9rem] lg:text-[10rem]"
            >
              404
            </p>
            <h1 className="mt-7 text-3xl font-extrabold sm:text-4xl">
              Oops! This Page Went Missing
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#667085] md:mx-0 md:text-lg">
              Looks like this toy wandered off the shelf. The page you&apos;re
              looking for doesn&apos;t exist or may have moved.
            </p>

            <div className="mx-auto mt-8 grid max-w-sm gap-3 sm:max-w-none sm:grid-cols-[auto_auto] sm:justify-center md:mx-0 md:justify-start">
              <a
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#6D4AFF] px-5 font-bold text-white shadow-[0_8px_20px_rgba(109,74,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5B3DF5] focus:outline-none focus:ring-4 focus:ring-[#6D4AFF]/25"
              >
                <Home className="size-4.5" aria-hidden="true" />
                Back to Home
              </a>
              <a
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#BDB4FF] bg-white px-5 font-bold text-[#4E36D6] transition hover:-translate-y-0.5 hover:border-[#6D4AFF] hover:bg-[#F7F5FF] focus:outline-none focus:ring-4 focus:ring-[#6D4AFF]/20"
              >
                <ShoppingBag className="size-4.5" aria-hidden="true" />
                Continue Shopping
              </a>
            </div>
            <p className="mt-6 text-sm text-[#667085]">
              Need help?{' '}
              <a
                href="/contact"
                className="font-bold text-[#5B3DF5] underline decoration-[#BDB4FF] underline-offset-4 hover:text-[#4028C8] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/30"
              >
                Contact us
              </a>
            </p>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto aspect-square w-full max-w-[330px] sm:max-w-[380px]"
          >
            <div className="absolute inset-[8%] rounded-lg border border-[#D9E2F0] bg-white shadow-[0_24px_60px_rgba(44,62,96,0.13)]" />
            <div className="absolute left-[18%] top-[18%] grid size-[24%] rotate-[-8deg] place-items-center rounded-lg bg-[#DDEBFF] text-[#247BFE] shadow-sm">
              <Blocks className="size-8 sm:size-10" />
            </div>
            <div className="absolute right-[17%] top-[25%] grid size-[20%] rotate-6 place-items-center rounded-lg bg-[#FFF0C2] text-[#9C6500] shadow-sm">
              <Sparkles className="size-7 sm:size-9" />
            </div>
            <div className="absolute bottom-[19%] left-1/2 grid size-[42%] -translate-x-1/2 place-items-center rounded-lg bg-[#F2EFFF] text-[#6D4AFF] shadow-[0_14px_32px_rgba(109,74,255,0.18)]">
              <PackageOpen className="size-16 sm:size-20" strokeWidth={1.7} />
            </div>
            <div className="absolute bottom-[13%] left-[16%] size-[13%] -rotate-12 rounded-lg bg-[#FFD9D2] shadow-sm" />
            <div className="absolute right-[14%] top-[51%] size-[11%] rotate-12 rounded-full bg-[#DDF4EC] shadow-sm" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
