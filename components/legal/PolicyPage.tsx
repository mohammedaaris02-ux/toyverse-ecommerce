import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';

export type PolicySection = { title: string; paragraphs: string[] };

export function PolicyPage({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: PolicySection[];
}) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />
      <Header />
      <header className="border-b border-[#E6EAF2] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="text-sm font-bold uppercase text-[#6D4AFF]">
            ToyVerse Information
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#667085]">
            {subtitle}
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <article className="rounded-lg border border-[#E6EAF2] bg-white px-5 py-7 shadow-sm sm:px-9 sm:py-10">
          <p className="rounded-lg border border-[#D9E2F0] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#475467]">
            ToyVerse is currently a demonstration and portfolio e-commerce
            project. These policies describe how the demo experience is designed
            and are not a substitute for production legal advice.
          </p>
          <div className="mt-9 space-y-9">
            {sections.map((section, index) => (
              <section key={section.title} aria-labelledby={`policy-${index}`}>
                <h2 id={`policy-${index}`} className="text-xl font-extrabold">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 leading-7 text-[#475467]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-6 py-3 font-bold text-white! transition hover:bg-[#5B3DF5] hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30"
          >
            <ArrowLeft className="size-4" /> Back to ToyVerse
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#D9E2F0] bg-white px-6 py-3 font-bold text-[#344054] transition hover:border-[#6D4AFF]/35 hover:text-[#6D4AFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/20"
          >
            <ShoppingBag className="size-4" /> Continue Shopping
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
