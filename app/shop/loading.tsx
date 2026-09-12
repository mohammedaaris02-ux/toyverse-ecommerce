import { LoaderCircle } from 'lucide-react';

export default function ShopLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#F8FAFC] text-[#101828]">
      <output className="flex items-center gap-3 font-semibold">
        <LoaderCircle className="size-5 animate-spin text-[#6D4AFF]" />
        Loading toys...
      </output>
    </main>
  );
}
