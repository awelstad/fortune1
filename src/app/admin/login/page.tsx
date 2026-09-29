import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  "not-admin": "That account doesn't have admin access. Ask an owner to add you.",
  link: "That sign-in link is invalid or has expired. Request a new one below.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  const next = typeof sp.next === "string" && sp.next.startsWith("/admin") ? sp.next : "/admin";

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="blueprint relative hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Image src="/brand/fortune-logo-light.png" alt="Fortune Electrical Construction" width={500} height={100} className="h-10 w-auto self-start" />
        <p className="font-display text-7xl">Project CMS</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Image src="/brand/fortune-logo-dark.png" alt="Fortune Electrical Construction" width={500} height={100} className="mb-10 h-8 w-auto lg:hidden" />
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage projects, homepage and company content.</p>
          <LoginForm next={next} initialError={error} />
        </div>
      </div>
    </main>
  );
}
