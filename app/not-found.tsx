/* eslint-disable next/no-html-link-for-pages -- Plain anchors avoid the Vinext production Link runtime. */

import { ArrowLeft, Blocks, PackageOpen, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center overflow-hidden bg-[#F7FAFF] px-4 py-8 text-[#101828] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:gap-16">
        <section className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          <a
            href="/"
            aria-label="ToyVerse home"
            className="inline-flex items-center gap-2 rounded-md text-xl font-extrabold text-[#312A62] focus:outline-none focus:ring-4 focus:ring-[#6D4AFF]/20"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-[#6D4AFF] text-white shadow-sm">
              <Blocks className="size-5" aria-hidden="true" />
            </span>
            ToyVerse
          </a>

          <p className="mt-10 text-8xl font-black leading-none text-[#6D4AFF] sm:text-9xl">
            404
          </p>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#667085] lg:mx-0 lg:text-lg">
            The page you&apos;re looking for may have been moved, deleted, or is
            temporarily unavailable.
          </p>

          <a
            href="/"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#6D4AFF] px-6 font-bold text-white shadow-[0_10px_24px_rgba(109,74,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#593BE8] focus:outline-none focus:ring-4 focus:ring-[#6D4AFF]/25 sm:w-auto"
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
            Back to Home
          </a>

          <p className="mt-6 text-sm text-[#667085]">
            Need help?{' '}
            <a
              href="/contact"
              className="rounded-sm font-bold text-[#5B3DF5] underline decoration-[#BDB4FF] underline-offset-4 transition hover:text-[#4028C8] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/30"
            >
              Contact us
            </a>
          </p>
        </section>

        <div
          aria-hidden="true"
          className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[430px]"
        >
          <div className="absolute inset-[7%] rounded-2xl border border-[#DCE5F2] bg-white shadow-[0_28px_70px_rgba(49,42,98,0.12)]" />
          <div className="absolute left-[17%] top-[18%] grid size-[22%] -rotate-6 place-items-center rounded-xl bg-[#E5EFFF] text-[#247BFE] shadow-sm">
            <Blocks className="size-8 sm:size-10" />
          </div>
          <div className="absolute right-[17%] top-[23%] grid size-[18%] rotate-6 place-items-center rounded-xl bg-[#FFF2C9] text-[#966000] shadow-sm">
            <Sparkles className="size-7 sm:size-8" />
          </div>
          <div className="absolute bottom-[18%] left-1/2 grid size-[42%] -translate-x-1/2 place-items-center rounded-2xl bg-[#F0EDFF] text-[#6D4AFF] shadow-[0_16px_36px_rgba(109,74,255,0.16)]">
            <PackageOpen className="size-16 sm:size-20" strokeWidth={1.6} />
          </div>
          <div className="absolute bottom-[13%] left-[16%] size-[11%] -rotate-6 rounded-lg bg-[#FFDCD5]" />
          <div className="absolute right-[13%] top-[52%] size-[10%] rounded-full bg-[#DDF4EC]" />
        </div>
      </div>
    </main>
  );
}
