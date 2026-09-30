import { SeoTabs } from "@/components/admin/SeoTabs";

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">SEO</h1>
        <p className="mt-1 text-sm text-zinc-500">How Fortune shows up on Google for commercial electrical work in Southwest Florida.</p>
      </div>
      <SeoTabs />
      {children}
    </>
  );
}
