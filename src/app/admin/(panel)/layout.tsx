import Image from "next/image";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireAdminPage();
  const { count: newInquiries } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-30 border-b border-zinc-800 bg-ink text-white lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4 lg:py-6">
            <Link href="/admin" aria-label="Admin home">
              <Image src="/brand/fortune-logo-light.png" alt="Fortune" width={500} height={100} className="h-7 w-auto" />
            </Link>
            <Link href="/" target="_blank" className="text-xs text-zinc-400 hover:text-white lg:hidden">
              View site ↗
            </Link>
          </div>
          <AdminNav newInquiries={newInquiries ?? 0} />
          <div className="mt-auto hidden border-t border-white/10 p-5 lg:block">
            <p className="truncate text-xs text-zinc-400" title={user.email}>
              {user.email}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <Link href="/" target="_blank" className="text-xs text-zinc-400 hover:text-white">
                View site ↗
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
