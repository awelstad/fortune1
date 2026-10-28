import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/admin/auth";
import { MfaForm } from "./MfaForm";

export const metadata = { title: "Two-step verification" };
export const dynamic = "force-dynamic";

export default async function MfaPage({ searchParams }: PageProps<"/admin/mfa">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/admin") && !sp.next.startsWith("/admin/mfa") ? sp.next : "/admin";
  const { supabase, verified } = await requireAdminMember();
  if (verified) redirect(next);

  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp?.find((f) => f.status === "verified") ?? null;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Image src="/brand/fortune-logo.svg" alt="Fortune Electrical Construction" width={868} height={207} className="mb-10 h-8 w-auto" />
        <h1 className="text-2xl font-semibold tracking-tight">Two-step verification</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {factor
            ? "Enter the 6-digit code from your authenticator app."
            : "Required for every admin account. Set it up once with an authenticator app on your phone."}
        </p>
        <MfaForm next={next} factorId={factor?.id ?? null} />
      </div>
    </main>
  );
}
