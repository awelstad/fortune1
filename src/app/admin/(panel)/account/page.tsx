import { requireAdminPage } from "@/lib/admin/auth";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const { user, role, supabase } = await requireAdminPage();
  const sp = await searchParams;
  const { data: mfa } = await supabase.auth.mfa.listFactors();
  const factors = (mfa?.totp ?? []).filter((f) => f.status === "verified");
  return (
    <>
      <PageHeader title="Account" description={`${user.email} · ${role}`} />
      {sp.welcome && (
        <div className="mb-6">
          <Notice tone="success">Welcome! Set a password below so you can sign in next time.</Notice>
        </div>
      )}
      <div className="max-w-lg space-y-6">
        <Card title="Two-step verification" description="Required for every admin. A code from your authenticator app is needed at each sign-in.">
          <p className="text-sm">
            <span className="font-medium text-emerald-700">✓ On</span>
            <span className="text-zinc-500">
              {" "}
              · {factors.length} authenticator{factors.length === 1 ? "" : "s"} set up
              {factors[0] ? ` · added ${new Date(factors[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
            </span>
          </p>
          <p className="mt-2 text-xs text-zinc-500">New phone? Ask the site developer to reset your two-step login; you&apos;ll set it up again at your next sign-in.</p>
        </Card>
        <Card title="Change password">
          <PasswordForm />
        </Card>
        <div className="rounded-lg bg-ink px-5 py-4 lg:hidden">
          <SignOutButton />
        </div>
      </div>
    </>
  );
}
