import { requireAdminPage } from "@/lib/admin/auth";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const { user, role } = await requireAdminPage();
  const sp = await searchParams;
  return (
    <>
      <PageHeader title="Account" description={`${user.email} · ${role}`} />
      {sp.welcome && (
        <div className="mb-6">
          <Notice tone="success">Welcome! Set a password below so you can sign in next time.</Notice>
        </div>
      )}
      <div className="max-w-lg space-y-6">
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
